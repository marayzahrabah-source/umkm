"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/database";

export default function AdminStokPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").order("stock", { ascending: true });
    setProducts((data as Product[]) ?? []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateStock = async (id: string, stock: number) => {
    const supabase = createClient();
    await supabase.from("products").update({ stock: Math.max(0, stock) }).eq("id", id);
    loadProducts();
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Manajemen Stok
        </h1>
        <p className="mt-1 text-sm text-cocoa-500">
          Pantau stok menipis dan perbarui jumlah stok produk dengan cepat.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Produk</th>
                <th className="p-4">Status Stok</th>
                <th className="p-4">Jumlah Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-semibold text-cocoa-900">{p.name}</td>
                  <td className="p-4">
                    {p.stock <= 0 ? (
                      <Badge variant="danger">Habis</Badge>
                    ) : p.stock <= 5 ? (
                      <Badge variant="warning">Menipis</Badge>
                    ) : (
                      <Badge variant="success">Aman</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.stock}
                      onBlur={(e) => updateStock(p.id, Number(e.target.value))}
                      className="w-24 rounded-xl border border-cocoa-200 bg-cream-50 px-3 py-1.5 text-sm font-semibold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
