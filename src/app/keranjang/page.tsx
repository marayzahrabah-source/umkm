"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function KeranjangPage() {
  const { items, subtotal, updateQuantity, removeItem, isHydrated } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-cocoa-900">
          Keranjang Belanja
        </h1>

        {!isHydrated ? (
          <div className="mt-8 h-48 animate-pulse rounded-2xl bg-cream-200" />
        ) : items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Keranjang Anda masih kosong"
              description="Yuk, pilih kue dan pastry favorit Anda dari katalog kami."
              action={
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-cocoa-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cocoa-900"
                >
                  Jelajahi Katalog
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "base"}`}
                  className="flex flex-col gap-4 rounded-2xl border border-cocoa-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-cocoa-300">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/produk/${item.slug}`}
                      className="font-display text-base font-semibold text-cocoa-900 hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-cocoa-500">Varian: {item.variantName}</p>
                    )}
                    <p className="mt-1 font-display text-sm font-bold text-cocoa-700">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center rounded-xl border border-cocoa-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="p-2 text-cocoa-700 hover:bg-cream-100 rounded-l-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxStock}
                        className="p-2 text-cocoa-700 hover:bg-cream-100 rounded-r-xl disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      aria-label="Hapus item"
                      className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-cocoa-900">
                  Ringkasan Belanja
                </h2>
                <div className="mt-4 space-y-2 border-t border-cream-200 pt-4 text-sm">
                  <div className="flex justify-between text-cocoa-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-cocoa-900">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-cocoa-900">
                    <span>Total Estimasi</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="mt-6 block">
                  <Button size="lg" className="w-full">
                    Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
