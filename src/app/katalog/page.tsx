import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Product } from "@/types/database";

export const dynamic = "force-dynamic";

interface KatalogPageProps {
  searchParams: Promise<{
    q?: string;
    kategori?: string;
    urut?: string;
  }>;
}

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const params = await searchParams;
  const queryText = params.q?.trim() || "";
  const selectedCategory = params.kategori || "";
  const sort = params.urut || "terbaru";

  let categories: Category[] = [];
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name");
    categories = (catData as Category[]) ?? [];

    let prodQuery = supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true);

    if (queryText) {
      prodQuery = prodQuery.ilike("name", `%${queryText}%`);
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        prodQuery = prodQuery.eq("category_id", cat.id);
      }
    }

    if (sort === "harga-asc") {
      prodQuery = prodQuery.order("price", { ascending: true });
    } else if (sort === "harga-desc") {
      prodQuery = prodQuery.order("price", { ascending: false });
    } else if (sort === "nama") {
      prodQuery = prodQuery.order("name", { ascending: true });
    } else {
      prodQuery = prodQuery.order("created_at", { ascending: false });
    }

    const { data: prodData } = await prodQuery;
    products = (prodData as Product[]) ?? [];
  } catch {
    // Fallback empty when env not set
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cocoa-900">
            Katalog Kue & Pastry
          </h1>
          <p className="mt-1 text-sm text-cocoa-500">
            Pilih kue favorit Anda yang dipanggang segar setiap hari.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <form
          method="GET"
          action="/katalog"
          className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-cocoa-100 bg-white p-4 shadow-sm md:grid-cols-12"
        >
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
            <input
              type="text"
              name="q"
              defaultValue={queryText}
              placeholder="Cari nama kue atau pastry..."
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-cocoa-900 focus:border-cocoa-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              name="kategori"
              defaultValue={selectedCategory}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm text-cocoa-900 focus:border-cocoa-500 focus:outline-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              name="urut"
              defaultValue={sort}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm text-cocoa-900 focus:border-cocoa-500 focus:outline-none"
            >
              <option value="terbaru">Terbaru</option>
              <option value="harga-asc">Harga Terendah</option>
              <option value="harga-desc">Harga Tertinggi</option>
              <option value="nama">Nama A-Z</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full rounded-xl bg-cocoa-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cocoa-900"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Product Grid */}
        {products.length === 0 ? (
          <EmptyState
            title="Produk tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau pilih kategori lainnya."
            action={
              <Link
                href="/katalog"
                className="rounded-xl bg-blush-100 px-5 py-2.5 text-sm font-semibold text-cocoa-900 hover:bg-blush-200"
              >
                Reset Filter
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
