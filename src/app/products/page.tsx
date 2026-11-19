"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatIDR } from "@/lib/utils";
import type { Category, Product } from "@/types/umkm";
import { Plus, Search, Pencil, Trash2, Tag, Package } from "lucide-react";

export default function ProductsPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category_id: "",
    unit: "pcs",
    purchase_price: "0",
    selling_price: "0",
    stock: "0",
    min_stock: "5",
    image_url: "",
    description: "",
  });

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(id, name)")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("name"),
      ]);
      setProducts((prodRes.data || []) as Product[]);
      setCategories((catRes.data || []) as Category[]);
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      sku: `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      name: "",
      category_id: categories[0]?.id || "",
      unit: "pcs",
      purchase_price: "0",
      selling_price: "0",
      stock: "0",
      min_stock: "5",
      image_url: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      sku: p.sku,
      name: p.name,
      category_id: p.category_id || "",
      unit: p.unit,
      purchase_price: String(p.purchase_price),
      selling_price: String(p.selling_price),
      stock: String(p.stock),
      min_stock: String(p.min_stock),
      image_url: p.image_url || "",
      description: p.description || "",
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        business_id: profile.business_id,
        sku: form.sku.trim(),
        name: form.name.trim(),
        category_id: form.category_id || null,
        unit: form.unit.trim() || "pcs",
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        stock: Number(form.stock) || 0,
        min_stock: Number(form.min_stock) || 0,
        image_url: form.image_url.trim() || null,
        description: form.description.trim() || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast("Produk berhasil diperbarui", "success");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast("Produk berhasil ditambahkan", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan produk", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast("Produk berhasil dihapus", "success");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus produk", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id || !newCatName.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      business_id: profile.business_id,
      name: newCatName.trim(),
    });
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Kategori ditambahkan", "success");
    setNewCatName("");
    loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Kategori dihapus", "success");
    loadData();
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCat === "all" || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama produk atau SKU..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCatModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Kategori
            </button>
            <button
              onClick={openCreate}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900">
                Belum ada produk
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tambahkan produk pertama Anda untuk mulai berjualan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Produk</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5 text-right">Harga Beli</th>
                    <th className="px-6 py-3.5 text-right">Harga Jual</th>
                    <th className="px-6 py-3.5 text-center">Stok</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                        {p.sku}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {p.categories?.name || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-600">
                        {formatIDR(p.purchase_price)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                        {formatIDR(p.selling_price)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            p.stock <= p.min_stock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Satuan (Unit)
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="pcs, kg, dus"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Harga Beli (IDR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.purchase_price}
                onChange={(e) =>
                  setForm({ ...form, purchase_price: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Harga Jual (IDR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.selling_price}
                onChange={(e) =>
                  setForm({ ...form, selling_price: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stok Minimum (Alert)
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.min_stock}
                onChange={(e) =>
                  setForm({ ...form, min_stock: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              URL Gambar Produk (Opsional)
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Kelola Kategori Produk"
        maxWidth="md"
      >
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nama kategori baru..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            Tambah
          </button>
        </form>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="text-sm font-medium text-slate-800">{c.name}</span>
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
        loading={deleting}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </AppShell>
  );
}
