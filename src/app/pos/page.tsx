"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { formatIDR, formatDateTimeID, generateInvoiceNumber } from "@/lib/utils";
import type { Customer, PaymentMethod, Product } from "@/types/umkm";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

interface ReceiptData {
  invoice_number: string;
  sale_date: string;
  items: { name: string; qty: number; price: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  amount_paid: number;
  change: number;
  payment_method: string;
  customer_name: string;
}

export default function PosPage() {
  const { profile, business } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    const supabase = createClient();
    const [prodRes, custRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("business_id", profile.business_id)
        .eq("is_active", true)
        .gt("stock", 0)
        .order("name"),
      supabase
        .from("customers")
        .select("*")
        .eq("business_id", profile.business_id)
        .order("name"),
    ]);
    setProducts((prodRes.data || []) as Product[]);
    setCustomers((custRes.data || []) as Customer[]);
  }, [profile?.business_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast("Stok produk tidak mencukupi", "error");
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i;
          const next = i.quantity + delta;
          if (next > i.product.stock) {
            toast("Melebihi stok tersedia", "error");
            return i;
          }
          return { ...i, quantity: next };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + Number(i.product.selling_price) * i.quantity,
    0
  );
  const discountVal = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - discountVal);
  const paidVal = paymentMethod === "cash" ? Number(amountPaid) || 0 : total;
  const changeVal = Math.max(0, paidVal - total);

  const handleCheckout = async () => {
    if (!profile?.business_id || cart.length === 0) return;
    if (paymentMethod === "cash" && paidVal < total) {
      toast("Jumlah bayar kurang dari total tagihan", "error");
      return;
    }

    setProcessing(true);
    try {
      const supabase = createClient();
      const invoiceNumber = generateInvoiceNumber("INV");
      const nowIso = new Date().toISOString();

      const { data: sale, error: saleErr } = await supabase
        .from("sales")
        .insert({
          business_id: profile.business_id,
          invoice_number: invoiceNumber,
          customer_id: customerId || null,
          cashier_id: profile.id,
          subtotal,
          discount_amount: discountVal,
          tax_amount: 0,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: "paid",
          amount_paid: paidVal,
          change_amount: changeVal,
          sale_date: nowIso,
        })
        .select()
        .single();

      if (saleErr || !sale) throw saleErr || new Error("Gagal membuat transaksi");

      // Insert sale_items
      const saleItemsPayload = cart.map((i) => ({
        business_id: profile.business_id,
        sale_id: sale.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.selling_price,
        purchase_price: i.product.purchase_price,
        discount: 0,
        subtotal: Number(i.product.selling_price) * i.quantity,
      }));
      await supabase.from("sale_items").insert(saleItemsPayload);

      // Update product stock & log stock_movements
      for (const item of cart) {
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product.id);

        await supabase.from("stock_movements").insert({
          business_id: profile.business_id,
          product_id: item.product.id,
          movement_type: "out",
          quantity: item.quantity,
          previous_stock: item.product.stock,
          new_stock: newStock,
          reference_type: "sale",
          reference_id: sale.id,
          notes: `Penjualan ${invoiceNumber}`,
          created_by: profile.id,
        });
      }

      // Log payment
      await supabase.from("payments").insert({
        business_id: profile.business_id,
        reference_type: "sale",
        reference_id: sale.id,
        amount: total,
        payment_method: paymentMethod,
        payment_date: nowIso,
      });

      // Update customer total_spent
      if (customerId) {
        const cust = customers.find((c) => c.id === customerId);
        if (cust) {
          await supabase
            .from("customers")
            .update({ total_spent: Number(cust.total_spent) + total })
            .eq("id", customerId);
        }
      }

      setReceipt({
        invoice_number: invoiceNumber,
        sale_date: nowIso,
        items: cart.map((i) => ({
          name: i.product.name,
          qty: i.quantity,
          price: Number(i.product.selling_price),
          subtotal: Number(i.product.selling_price) * i.quantity,
        })),
        subtotal,
        discount: discountVal,
        total,
        amount_paid: paidVal,
        change: changeVal,
        payment_method: paymentMethod.toUpperCase(),
        customer_name:
          customers.find((c) => c.id === customerId)?.name || "Pelanggan Umum",
      });

      setCart([]);
      setDiscount("0");
      setAmountPaid("");
      setCustomerId("");
      toast("Transaksi berhasil disimpan!", "success");
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal memproses transaksi", "error");
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk atau scan SKU..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="text-left bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  <p className="font-semibold text-sm text-slate-900 mt-1 line-clamp-2">
                    {p.name}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">
                    {formatIDR(p.selling_price)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Stok: {p.stock}
                  </span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full p-8 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
                Tidak ada produk tersedia.
              </div>
            )}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col h-fit sticky top-20 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Keranjang Belanja</h2>
          </div>

          <div className="py-4 space-y-3 max-h-72 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                Keranjang masih kosong
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatIDR(item.product.selling_price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.filter((i) => i.product.id !== item.product.id)
                        )
                      }
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pelanggan
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              >
                <option value="">Pelanggan Umum</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Diskon (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Metode Bayar
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                >
                  <option value="cash">Tunai (Cash)</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="debit">Kartu Debit</option>
                  <option value="credit">Kartu Kredit</option>
                </select>
              </div>
            </div>

            {paymentMethod === "cash" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Jumlah Diterima (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={String(total)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Diskon</span>
                <span>-{formatIDR(discountVal)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-200">
                <span>Total</span>
                <span className="text-emerald-700">{formatIDR(total)}</span>
              </div>
              {paymentMethod === "cash" && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Kembalian</span>
                  <span>{formatIDR(changeVal)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Bayar & Cetak Struk"}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        title="Struk Pembayaran"
        maxWidth="sm"
      >
        {receipt && (
          <div className="space-y-4 text-sm">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-slate-900">
                {business?.name || "UMKM Store"}
              </p>
              <p className="text-xs text-slate-500">{receipt.invoice_number}</p>
              <p className="text-xs text-slate-500">
                {formatDateTimeID(receipt.sale_date)}
              </p>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span className="font-medium">{formatIDR(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total</span>
                <span className="font-bold text-slate-900">
                  {formatIDR(receipt.total)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bayar ({receipt.payment_method})</span>
                <span>{formatIDR(receipt.amount_paid)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kembali</span>
                <span>{formatIDR(receipt.change)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-medium inline-flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
