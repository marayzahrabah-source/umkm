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
import type { Customer, Sale } from "@/types/umkm";
import { Plus, Search, Pencil, Trash2, History } from "lucide-react";

export default function CustomersPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Customer | null>(null);
  const [historySales, setHistorySales] = useState<Sale[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", profile.business_id)
      .order("name");
    setCustomers((data || []) as Customer[]);
    setLoading(false);
  }, [profile?.business_id]);

  useEffect(() => {
    if (profile?.business_id) loadData();
  }, [profile?.business_id, loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      notes: c.notes || "",
    });
    setModalOpen(true);
  };

  const openHistory = async (c: Customer) => {
    setHistoryTarget(c);
    const supabase = createClient();
    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("customer_id", c.id)
      .order("sale_date", { ascending: false });
    setHistorySales((data || []) as Sale[]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        business_id: profile.business_id,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase
          .from("customers")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast("Pelanggan diperbarui", "success");
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
        toast("Pelanggan ditambahkan", "success");
      }
      setModalOpen(false);
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
    await supabase.from("customers").delete().eq("id", deleteTarget.id);
    toast("Pelanggan dihapus", "success");
    setDeleteTarget(null);
    loadData();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau telepon..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl"
            />
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Pelanggan
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Belum ada data pelanggan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Nama</th>
                    <th className="px-6 py-3.5">Telepon</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5 text-right">Total Belanja</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {c.phone || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {c.email || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">
                        {formatIDR(c.total_spent)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openHistory(c)}
                            title="Riwayat Belanja"
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Pelanggan" : "Tambah Pelanggan"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Pelanggan *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telepon
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Alamat
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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

      <Modal
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        title={`Riwayat Belanja: ${historyTarget?.name}`}
        maxWidth="lg"
      >
        {historySales.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Belum ada riwayat transaksi.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {historySales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {s.invoice_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateID(s.sale_date)}
                  </p>
                </div>
                <span className="font-bold text-emerald-700">
                  {formatIDR(s.total_amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pelanggan"
        message={`Hapus pelanggan "${deleteTarget?.name}"?`}
      />
    </AppShell>
  );
}
