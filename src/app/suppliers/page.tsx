"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Supplier } from "@/types/umkm";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function SuppliersPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadData = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("suppliers")
      .select("*")
      .eq("business_id", profile.business_id)
      .order("name");
    setSuppliers((data || []) as Supplier[]);
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
      const payload = {
        business_id: profile.business_id,
        name: form.name.trim(),
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      };
      if (editing) {
        await supabase.from("suppliers").update(payload).eq("id", editing.id);
        toast("Pemasok diperbarui", "success");
      } else {
        await supabase.from("suppliers").insert(payload);
        toast("Pemasok ditambahkan", "success");
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
    await supabase.from("suppliers").delete().eq("id", deleteTarget.id);
    toast("Pemasok dihapus", "success");
    setDeleteTarget(null);
    loadData();
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Cari nama pemasok..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm({
                name: "",
                contact_person: "",
                phone: "",
                email: "",
                address: "",
              });
              setModalOpen(true);
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Pemasok
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Belum ada data pemasok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Nama Pemasok</th>
                    <th className="px-6 py-3.5">Kontak Person</th>
                    <th className="px-6 py-3.5">Telepon</th>
                    <th className="px-6 py-3.5">Alamat</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {s.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {s.contact_person || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {s.phone || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {s.address || "-"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setForm({
                              name: s.name,
                              contact_person: s.contact_person || "",
                              phone: s.phone || "",
                              email: s.email || "",
                              address: s.address || "",
                            });
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
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
        title={editing ? "Edit Pemasok" : "Tambah Pemasok"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Pemasok *
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
                Kontak Person
              </label>
              <input
                type="text"
                value={form.contact_person}
                onChange={(e) =>
                  setForm({ ...form, contact_person: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pemasok"
        message={`Hapus pemasok "${deleteTarget?.name}"?`}
      />
    </AppShell>
  );
}
