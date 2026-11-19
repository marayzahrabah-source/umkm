"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, slugify } from "@/lib/utils";
import type { Category, Product } from "@/types/database";

export default function AdminProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: prodData }, { data: catData }] = await Promise.all([
      supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts((prodData as Product[]) ?? []);
    setCategories((catData as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategoryId("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setDescription("");
    setIsFeatured(false);
    setShowForm(false);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.category_id || "");
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.image_url || "");
    setDescription(p.description);
    setIsFeatured(p.is_featured);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name,
      slug: slugify(name),
      category_id: categoryId || null,
      price: Number(price),
      stock: Number(stock),
      image_url: imageUrl || null,
      description,
      is_featured: isFeatured,
      is_active: true,
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert(payload);
    }

    setSaving(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    loadData();
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-cocoa-900">
              Manajemen Produk
            </h1>
            <p className="text-sm text-cocoa-500">Tambah, ubah, atau hapus katalog kue.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" /> {showForm ? "Tutup Form" : "Tambah Produk"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSave}
            className="mt-6 space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-cocoa-900">
              {editingId ? "Edit Produk" : "Produk Baru"}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Nama Produk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                required
                min="0"
                placeholder="Harga (Rp)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              />
              <input
                type="number"
                required
                min="0"
                placeholder="Stok"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              />
            </div>
            <input
              type="url"
              placeholder="URL Foto Produk (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
            <textarea
              rows={3}
              required
              placeholder="Deskripsi produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-cocoa-900">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Tampilkan sebagai Produk Unggulan
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Produk
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-cocoa-500">
                    Memuat data...
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-4 font-semibold text-cocoa-900">{p.name}</td>
                    <td className="p-4 text-cocoa-500">{p.category?.name || "-"}</td>
                    <td className="p-4 font-semibold">{formatRupiah(Number(p.price))}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">
                      {p.is_featured ? (
                        <Badge variant="pink">Unggulan</Badge>
                      ) : (
                        <Badge>Reguler</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="mr-2 rounded-lg p-1.5 text-cocoa-700 hover:bg-cream-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
