"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Minus, Plus, ArrowLeft } from "lucide-react";
import type { Product, ProductVariant } from "@/types/database";
import { formatRupiah, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(
    product.image_url || product.gallery_urls?.[0] || ""
  );
  const [added, setAdded] = useState(false);

  const images = Array.from(
    new Set([product.image_url, ...(product.gallery_urls || [])].filter(Boolean))
  ) as string[];

  const finalPrice =
    Number(product.price) + Number(selectedVariant?.price_adjustment || 0);
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    if (availableStock <= 0) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      variantName: selectedVariant?.name ?? null,
      slug: product.slug,
      price: finalPrice,
      imageUrl: product.image_url,
      quantity,
      maxStock: availableStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa-500 hover:text-cocoa-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-cocoa-100 bg-white">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-cocoa-300">
                Tanpa Foto
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2",
                    activeImage === img ? "border-cocoa-700" : "border-transparent"
                  )}
                >
                  <Image src={img} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.category?.name && (
              <Badge variant="pink">{product.category.name}</Badge>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold text-cocoa-900">
              {product.name}
            </h1>
            <p className="mt-3 font-display text-2xl font-bold text-cocoa-700">
              {formatRupiah(finalPrice)}
            </p>
            <p className="mt-1 text-xs text-cocoa-500">
              Stok tersedia: {availableStock > 0 ? availableStock : "Habis"}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-cocoa-700">
            {product.description}
          </p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-cocoa-900">
                Pilih Varian Ukuran
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
                      selectedVariant?.id === v.id
                        ? "border-cocoa-700 bg-cocoa-700 text-white"
                        : "border-cocoa-200 bg-white text-cocoa-900 hover:bg-cream-100"
                    )}
                  >
                    {v.name}
                    {v.price_adjustment > 0 &&
                      ` (+${formatRupiah(Number(v.price_adjustment))})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center rounded-xl border border-cocoa-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-cocoa-700 hover:bg-cream-100 rounded-l-xl"
                aria-label="Kurangi jumlah"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-cocoa-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                disabled={quantity >= availableStock}
                className="p-3 text-cocoa-700 hover:bg-cream-100 rounded-r-xl disabled:opacity-40"
                aria-label="Tambah jumlah"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex-1 sm:flex-none"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Ditambahkan ke Keranjang
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  {availableStock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
