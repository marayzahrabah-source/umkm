"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatIDR, formatDateID } from "@/lib/utils";
import type { Expense } from "@/types/umkm";
import { Plus, Trash2 } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Operasional",
  "Listrik & Air",
  "Sewa Tempat",
  "Gaji Karyawan",
  "Pemasaran",
  "Transportasi",
  "Lainnya",
];

export default function ExpensesPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const [form, setForm] = useState({
    category: "Operasional",
    description: "",
    amount: "0",
    expense_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
  });

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("business_id", profile.business_id)
      .order("expense_date", { ascending: false });
    setExpenses((data || []) as Expense[]);
    setLoading(false);
  }, [profile?.business_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").insert({
        business_id: profile.business_id,
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount) || 0,
        expense_date: form.expense_date,
        payment_method: form.payment_method,
        created_by: profile.id,
      });
      if (error) throw error;
      toast("Pengeluaran berhasil dicatat", "success");
      setModalOpen(false);
      setForm({
        category: "Operasional",
        description: "",
        amount: "0",
        expense_date: new Date().toISOString().slice(0, 10),
        payment_method: "cash",
      });
      loadData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", deleteTarget.id);
    toast("Pengeluaran dihapus", "success");
    setDeleteTarget(null);
    loadData();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Pengeluaran Usaha
            </h2>
            <p className="text-xs text-slate-500">
              Total Pengeluaran Tercatat:{" "}
              <span className="font-semibold text-red-600">
                {formatIDR(totalExpenses)}
              </span>
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Catat Pengeluaran
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Belum ada catatan pengeluaran.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Kategori</th>
                    <th className="px-6 py-3.5">Keterangan</th>
                    <th className="px-6 py-3.5 text-right">Jumlah</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 text-slate-600">
                        {formatDateID(ex.expense_date)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {ex.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-900">
                        {ex.description}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-red-600">
                        {formatIDR(ex.amount)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setDeleteTarget(ex)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        title="Catat Pengeluaran Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={form.expense_date}
                onChange={(e) =>
                  setForm({ ...form, expense_date: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Keterangan *
            </label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Contoh: Bayar tagihan listrik bulan ini"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Jumlah (IDR) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
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
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pengeluaran"
        message={`Hapus catatan pengeluaran "${deleteTarget?.description}"?`}
      />
    </AppShell>
  );
}
