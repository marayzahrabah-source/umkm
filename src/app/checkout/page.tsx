"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "Ambil di Toko" | "Kurir Toko" | "Ojek Online"
  >("Kurir Toko");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerWhatsapp,
          shippingAddress,
          deliveryMethod,
          orderDate,
          notes,
          promoCode,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Gagal memproses pesanan.");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/pesanan/${result.orderCode}`);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-cocoa-900">Checkout</h1>

        {!isHydrated ? (
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-cream-200" />
        ) : items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Keranjang Anda kosong"
              description="Tambahkan produk terlebih dahulu sebelum melakukan checkout."
              action={
                <Link
                  href="/katalog"
                  className="rounded-xl bg-cocoa-700 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Ke Katalog
                </Link>
              }
            />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="space-y-5 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm lg:col-span-7">
              <h2 className="font-display text-lg font-bold text-cocoa-900">
                Data Pemesan & Pengiriman
              </h2>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Nadia Putri"
                    className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Jalan, nomor rumah, kecamatan, patokan..."
                  className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                    Metode Pengiriman *
                  </label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) =>
                      setDeliveryMethod(
                        e.target.value as
                          | "Ambil di Toko"
                          | "Kurir Toko"
                          | "Ojek Online"
                      )
                    }
                    className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                  >
                    <option value="Kurir Toko">Kurir Toko</option>
                    <option value="Ambil di Toko">Ambil di Toko</option>
                    <option value="Ojek Online">Ojek Online</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                    Tanggal Pesanan *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                  Kode Promo (Opsional)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: SWEET10"
                  className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm uppercase focus:border-cocoa-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-cocoa-900">
                  Catatan Pesanan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tulisan di atas kue, request jam kirim, dll."
                  className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-cocoa-900">
                  Ringkasan Pesanan
                </h2>
                <div className="mt-4 divide-y divide-cream-200">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || "base"}`}
                      className="flex justify-between py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-cocoa-900">
                          {item.name} x{item.quantity}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-cocoa-500">{item.variantName}</p>
                        )}
                      </div>
                      <span className="font-semibold text-cocoa-700">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-cream-200 pt-4">
                  <div className="flex justify-between text-base font-bold text-cocoa-900">
                    <span>Total Estimasi</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-cocoa-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Harga & diskon promo diverifikasi otomatis di server.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="mt-6 w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Memproses Pesanan...
                    </>
                  ) : (
                    "Buat Pesanan Sekarang"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
