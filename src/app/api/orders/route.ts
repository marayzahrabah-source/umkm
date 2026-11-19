import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data pesanan tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // 1. Validate products, variants, prices, and stock on the server
    let subtotal = 0;
    const verifiedItems: {
      product_id: string;
      variant_id: string | null;
      product_name_snapshot: string;
      variant_name_snapshot: string | null;
      unit_price_snapshot: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of data.items) {
      const { data: product, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .eq("is_active", true)
        .single();

      if (prodErr || !product) {
        return NextResponse.json(
          { error: "Salah satu produk tidak ditemukan atau tidak aktif." },
          { status: 400 }
        );
      }

      let unitPrice = Number(product.price);
      let variantName: string | null = null;
      let availableStock = product.stock;

      if (item.variantId) {
        const { data: variant, error: varErr } = await supabase
          .from("product_variants")
          .select("*")
          .eq("id", item.variantId)
          .eq("product_id", product.id)
          .single();

        if (varErr || !variant) {
          return NextResponse.json(
            { error: `Varian untuk ${product.name} tidak valid.` },
            { status: 400 }
          );
        }

        unitPrice += Number(variant.price_adjustment);
        variantName = variant.name;
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok ${product.name}${variantName ? ` (${variantName})` : ""} tidak mencukupi (tersisa ${availableStock}).`,
          },
          { status: 400 }
        );
      }

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      verifiedItems.push({
        product_id: product.id,
        variant_id: item.variantId ?? null,
        product_name_snapshot: product.name,
        variant_name_snapshot: variantName,
        unit_price_snapshot: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 2. Validate promotion code if provided
    let discountAmount = 0;
    let promotionId: string | null = null;

    if (data.promoCode && data.promoCode.trim() !== "") {
      const { data: promo } = await supabase
        .from("promotions")
        .select("*")
        .eq("code", data.promoCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promo && subtotal >= Number(promo.min_order_amount)) {
        promotionId = promo.id;
        if (promo.discount_type === "percentage") {
          discountAmount = Math.round((subtotal * Number(promo.discount_value)) / 100);
        } else {
          discountAmount = Number(promo.discount_value);
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 3. Upsert customer record
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("whatsapp", data.customerWhatsapp)
      .maybeSingle();

    let customerId: string | null = existingCustomer?.id ?? null;

    if (!customerId) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          full_name: data.customerName,
          whatsapp: data.customerWhatsapp,
          address: data.shippingAddress,
        })
        .select("id")
        .single();
      customerId = newCustomer?.id ?? null;
    }

    // 4. Create Order
    const orderCode = generateOrderCode();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_code: orderCode,
        customer_id: customerId,
        promotion_id: promotionId,
        customer_name: data.customerName,
        customer_whatsapp: data.customerWhatsapp,
        shipping_address: data.shippingAddress,
        delivery_method: data.deliveryMethod,
        order_date: data.orderDate,
        notes: data.notes || null,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        status: "Menunggu Konfirmasi",
      })
      .select()
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan ke database." },
        { status: 500 }
      );
    }

    // 5. Insert Order Items (with snapshots)
    const itemsToInsert = verifiedItems.map((vi) => ({
      ...vi,
      order_id: order.id,
    }));

    await supabase.from("order_items").insert(itemsToInsert);

    // 6. Decrement stock
    for (const vi of verifiedItems) {
      if (vi.variant_id) {
        const { data: v } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", vi.variant_id)
          .single();
        if (v) {
          await supabase
            .from("product_variants")
            .update({ stock: Math.max(0, v.stock - vi.quantity) })
            .eq("id", vi.variant_id);
        }
      } else {
        const { data: p } = await supabase
          .from("products")
          .select("stock")
          .eq("id", vi.product_id)
          .single();
        if (p) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, p.stock - vi.quantity) })
            .eq("id", vi.product_id);
        }
      }
    }

    return NextResponse.json({ orderCode: order.order_code }, { status: 201 });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses pesanan." },
      { status: 500 }
    );
  }
}
