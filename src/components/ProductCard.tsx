"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      variantName: null,
      slug: product.slug,
      price: Number(product.price),
      imageUrl: product.image_url,
      quantity: 1,
      maxStock: product.stock,
    });
  };

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cocoa-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-cocoa-300">
            Tanpa Foto
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.is_featured && <Badge variant="pink">Unggulan</Badge>}
          {product.stock <= 0 && <Badge variant="danger">Habis</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {product.category?.name && (
            <p className="text-xs font-semibold uppercase tracking-wider text-cocoa-500">
              {product.category.name}
            </p>
          )}
          <h3 className="mt-1 font-display text-base font-semibold text-cocoa-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-cocoa-500 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-cream-200">
          <div>
            <p className="font-display text-base font-bold text-cocoa-700">
              {formatRupiah(Number(product.price))}
            </p>
            <p className="text-[11px] text-cocoa-500">
              Stok: {product.stock > 0 ? product.stock : "Habis"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blush-100 text-cocoa-900 transition-colors hover:bg-cocoa-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
