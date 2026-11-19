import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, Package, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, buildWhatsAppOrderLink } from "@/lib/utils";
import type { Order, StoreSettings } from "@/types/database";

export const dynamic = "force-dynamic";

const statusSteps = [
  "Menunggu Konfirmasi",
  "Dikonfirmasi",
  "Diproses",
  "Siap Diambil/Dikirim",
  "Selesai",
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let order: Order | null = null;
  let storeWhatsapp = "6281234567890";

  try {
    const supabase = await createClient();
    const [{ data: orderData }, { data: settingsData }] = await Promise.all([
      supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("order_code", code)
        .maybeSingle(),
      supabase.from("store_settings").select("whatsapp").limit(1).maybeSingle(),
    ]);
    order = orderData as Order | null;
    if (settingsData && (settingsData as StoreSettings).whatsapp) {
      storeWhatsapp = (settingsData as StoreSettings).whatsapp;
    }
  } catch {
    order = null;
  }

  if (!order) {
    notFound();
  }

  const waLink = buildWhatsAppOrderLink(storeWhatsapp, {
    orderCode: order.order_code,
    customerName: order.customer_name,
    deliveryMethod: order.delivery_method,
    orderDate: order.order_date,
    totalAmount: Number(order.total_amount),
    items: (order.items ?? []).map((i) => ({
      name: i.product_name_snapshot,
      variant: i.variant_name_snapshot,
      quantity: i.quantity,
      subtotal: Number(i.subtotal),
    })),
  });

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cocoa-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-cream-200 pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cocoa-500">
                  Kode Pesanan
                </p>
                <h1 className="font-display text-2xl font-bold text-cocoa-900">
                  {order.order_code}
                </h1>
              </div>
            </div>
            <Badge
              variant={
                order.status === "Dibatalkan"
                  ? "danger"
                  : order.status === "Selesai"
                  ? "success"
                  : "pink"
              }
              className="px-3 py-1 text-sm"
            >
              {order.status}
            </Badge>
          </div>

          {/* Progress */}
          {order.status !== "Dibatalkan" && (
            <div className="my-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {statusSteps.map((step, idx) => {
                  const active = idx <= currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`rounded-xl border p-2.5 text-center text-xs font-semibold ${
                        active
                          ? "border-cocoa-700 bg-blush-50 text-cocoa-900"
                          : "border-cream-200 bg-cream-50 text-cocoa-300"
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Delivery Info */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl bg-cream-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-cocoa-500">Pemesan</p>
              <p className="font-semibold text-cocoa-900">{order.customer_name}</p>
              <p className="text-cocoa-500">{order.customer_whatsapp}</p>
            </div>
            <div>
              <p className="text-xs text-cocoa-500">Pengiriman & Tanggal</p>
              <p className="font-semibold text-cocoa-900">
                {order.delivery_method} — {order.order_date}
              </p>
              <p className="text-cocoa-500">{order.shipping_address}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-cocoa-900">
              <Package className="h-4 w-4" /> Detail Item
            </h2>
            <div className="mt-3 divide-y divide-cream-200 border-t border-cream-200">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-cocoa-900">
                      {item.product_name_snapshot} x{item.quantity}
                    </p>
                    {item.variant_name_snapshot && (
                      <p className="text-xs text-cocoa-500">
                        {item.variant_name_snapshot}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-cocoa-700">
                    {formatRupiah(Number(item.subtotal))}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-cream-200 pt-4 text-sm">
              <div className="flex justify-between text-cocoa-500">
                <span>Subtotal</span>
                <span>{formatRupiah(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Promo</span>
                  <span>-{formatRupiah(Number(order.discount_amount))}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-cocoa-900">
                <span>Total</span>
                <span>{formatRupiah(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Confirmation */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" />
              Konfirmasi Pesanan via WhatsApp
            </a>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cocoa-200 px-6 py-3.5 text-sm font-semibold text-cocoa-900 hover:bg-cream-100"
            >
              <Clock className="h-4 w-4" /> Belanja Lagi
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
