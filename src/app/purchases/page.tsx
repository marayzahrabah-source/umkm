"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatIDR, formatDateID, generateInvoiceNumber } from "@/lib/utils";
import type { Product, Purchase, Supplier } from "@/types/umkm";
import { Plus } from "lucide-react";

export default function PurchasesPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplier_id: "",
    product_id: "",
    quantity: "1",
    unit_cost: "0",
    notes: "",
  });

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    const supabase = createClient();
    const [purRes, supRes, prodRes] = await Promise.all([
      supabase
        .from("purchases")
        .select("*, suppliers(id, name)")
        .eq("business_id", profile.business_id)
        .order("purchase_date", { ascending: false }),
      supabase
        .from("suppliers")
        .select("*")
        .eq("business_id", profile.business_id)
        .order("name"),
      supabase
        .from("products")
        .select("*")
        .eq("business_id", profile.business_id)
        .order("name"),
    ]);
    setPurchases((purRes.data || []) as Purchase[]);
    setSuppliers((supRes.data || []) as Supplier[]);
    const prods = (prodRes.data || []) as Product[];
    setProducts(prods);
    if (prods.length > 0 && !form.product_id) {
      setForm((prev) => ({
        ...prev,
        product_id: prods[0].id,
        unit_cost: String(prods[0].purchase_price),
      }));
    }
    setLoading(false);
  }, [profile?.business_id, form.product_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id || !form.product_id) return;

    const product = products.find((p) => p.id === form.product_id);
    if (!product) return;

    const qty = Number(form.quantity) || 0;
    const cost = Number(form.unit_cost) || 0;
    const total = qty * cost;

    setSaving(true);
    try {
      const supabase = createClient();
      const poNumber = generateInvoiceNumber("PO");

      const { data: purchase, error: purErr } = await supabase
        .from("purchases")
        .insert({
          business_id: profile.business_id,
          purchase_number: poNumber,
          supplier_id: form.supplier_id || null,
          created_by: profile.id,
          total_amount: total,
          status: "received",
          notes: form.notes.trim() || null,
        })
        .select()
        .single();

      if (purErr || !purchase) throw purErr;

      await supabase.from("purchase_items").insert({
        business_id: profile.business_id,
        purchase_id: purchase.id,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_cost: cost,
        subtotal: total,
      });

      const newStock = product.stock + qty;
      await supabase
        .from("products")
        .update({ stock: newStock, purchase_price: cost })
        .eq("id", product.id);

      await supabase.from("stock_movements").insert({
        business_id: profile.business_id,
        product_id: product.id,
        movement_type: "in",
        quantity: qty,
        previous_stock: product.stock,
        new_stock: newStock,
        reference_type: "purchase",
        reference_id: purchase.id,
        notes: `Pembelian ${poNumber}`,
        created_by: profile.id,
      });

      toast("Pembelian stok berhasil dicatat", "success");
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mencatat pembelian", "error");
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
              Pembelian Stok (Restock)
            </h2>
            <p className="text-xs text-slate-500">
              Catat pembelian barang dari pemasok dan tambah stok otomatis
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Pembelian Baru
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : purchases.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Belum ada transaksi pembelian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">No. PO</th>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Pemasok</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {p.purchase_number}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {formatDateID(p.purchase_date)}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {p.suppliers?.name || "Umum"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Diterima
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                        {formatIDR(p.total_amount)}
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
        title="Catat Pembelian Stok"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pemasok
            </label>
            <select
              value={form.supplier_id}
              onChange={(e) =>
                setForm({ ...form, supplier_id: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              <option value="">Pemasok Umum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Produk *
            </label>
            <select
              required
              value={form.product_id}
              onChange={(e) => {
                const prod = products.find((p) => p.id === e.target.value);
                setForm({
                  ...form,
                  product_id: e.target.value,
                  unit_cost: prod ? String(prod.purchase_price) : "0",
                });
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Harga Beli Satuan (IDR) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.unit_cost}
                onChange={(e) =>
                  setForm({ ...form, unit_cost: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
            >
              {saving ? "Menyimpan..." : "Simpan Pembelian"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
