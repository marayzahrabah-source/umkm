"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDateTimeID } from "@/lib/utils";
import type { Product, StockMovement } from "@/types/umkm";
import { Plus, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";

export default function InventoryPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    movement_type: "in" as "in" | "out" | "adjustment",
    quantity: "1",
    notes: "",
  });

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const [prodRes, movRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("name"),
        supabase
          .from("stock_movements")
          .select("*, products(id, name, sku), users(id, full_name)")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      const prods = (prodRes.data || []) as Product[];
      setProducts(prods);
      setMovements((movRes.data || []) as StockMovement[]);
      if (prods.length > 0 && !form.product_id) {
        setForm((prev) => ({ ...prev, product_id: prods[0].id }));
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id, form.product_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id || !form.product_id) return;

    const product = products.find((p) => p.id === form.product_id);
    if (!product) return;

    const qty = Number(form.quantity);
    if (isNaN(qty) || qty < 0) {
      toast("Jumlah tidak valid", "error");
      return;
    }

    let newStock = product.stock;
    if (form.movement_type === "in") {
      newStock = product.stock + qty;
    } else if (form.movement_type === "out") {
      if (qty > product.stock) {
        toast("Stok keluar melebihi stok tersedia", "error");
        return;
      }
      newStock = product.stock - qty;
    } else {
      newStock = qty; // adjustment sets exact stock
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: prodErr } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", product.id);
      if (prodErr) throw prodErr;

      const { error: movErr } = await supabase.from("stock_movements").insert({
        business_id: profile.business_id,
        product_id: product.id,
        movement_type: form.movement_type,
        quantity: qty,
        previous_stock: product.stock,
        new_stock: newStock,
        reference_type: "manual",
        notes: form.notes.trim() || null,
        created_by: profile.id,
      });
      if (movErr) throw movErr;

      toast("Pergerakan stok berhasil dicatat", "success");
      setModalOpen(false);
      setForm((prev) => ({ ...prev, quantity: "1", notes: "" }));
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mencatat stok", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Riwayat Pergerakan Stok
            </h2>
            <p className="text-xs text-slate-500">
              Catat stok masuk, stok keluar, dan penyesuaian stok barang
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Catat Stok
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : movements.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Belum ada riwayat pergerakan stok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Waktu</th>
                    <th className="px-6 py-3.5">Produk</th>
                    <th className="px-6 py-3.5">Jenis</th>
                    <th className="px-6 py-3.5 text-center">Jumlah</th>
                    <th className="px-6 py-3.5 text-center">Stok Akhir</th>
                    <th className="px-6 py-3.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 text-slate-600 text-xs">
                        {formatDateTimeID(m.created_at)}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {m.products?.name || "-"}
                      </td>
                      <td className="px-6 py-3.5">
                        {m.movement_type === "in" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <ArrowDownLeft className="w-3 h-3" /> Masuk
                          </span>
                        )}
                        {m.movement_type === "out" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <ArrowUpRight className="w-3 h-3" /> Keluar
                          </span>
                        )}
                        {m.movement_type === "adjustment" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <RefreshCw className="w-3 h-3" /> Penyesuaian
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold">
                        {m.quantity}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600">
                        {m.previous_stock} →{" "}
                        <span className="font-semibold text-slate-900">
                          {m.new_stock}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {m.notes || m.reference_type || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Catat Pergerakan Stok"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Produk *
            </label>
            <select
              required
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Jenis Pergerakan *
            </label>
            <select
              value={form.movement_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  movement_type: e.target.value as "in" | "out" | "adjustment",
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              <option value="in">Stok Masuk (+)</option>
              <option value="out">Stok Keluar (-)</option>
              <option value="adjustment">Penyesuaian Stok (Set Nilai Baru)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {form.movement_type === "adjustment"
                ? "Jumlah Stok Baru *"
                : "Jumlah *"}
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Catatan
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contoh: Barang rusak / stok opname"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
