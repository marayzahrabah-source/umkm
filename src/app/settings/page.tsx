"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import type { UserProfile, UserRole } from "@/types/umkm";
import { Building2, Users as UsersIcon, Save, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const { profile, business, role, refreshProfile } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "cashier",
  });

  const [bizForm, setBizForm] = useState({
    name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    receipt_footer: "",
  });

  useEffect(() => {
    if (business) {
      setBizForm({
        name: business.name || "",
        owner_name: business.owner_name || "",
        phone: business.phone || "",
        email: business.email || "",
        address: business.address || "",
        city: business.city || "",
        receipt_footer: business.receipt_footer || "",
      });
    }
  }, [business]);

  const loadTeam = useCallback(async () => {
    if (!profile?.business_id) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("business_id", profile.business_id)
      .order("created_at");
    setTeam((data || []) as UserProfile[]);
  }, [profile?.business_id]);

  useEffect(() => {
    if (profile?.business_id) loadTeam();
  }, [profile?.business_id, loadTeam]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("businesses")
        .update({
          name: bizForm.name.trim(),
          owner_name: bizForm.owner_name.trim(),
          phone: bizForm.phone.trim() || null,
          email: bizForm.email.trim() || null,
          address: bizForm.address.trim() || null,
          city: bizForm.city.trim() || null,
          receipt_footer: bizForm.receipt_footer.trim() || null,
        })
        .eq("id", business.id);
      if (error) throw error;
      toast("Profil usaha berhasil disimpan", "success");
      refreshProfile();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Peran pengguna diperbarui", "success");
    loadTeam();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMember(true);
    try {
      const res = await fetch("/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Gagal menambahkan anggota", "error");
        return;
      }
      toast("Akun anggota tim berhasil dibuat", "success");
      setAddOpen(false);
      setMemberForm({ fullName: "", email: "", password: "", role: "admin" });
      loadTeam();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menambahkan anggota", "error");
    } finally {
      setCreatingMember(false);
    }
  };

  const isOwner = role === "owner";

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Profil Usaha
            </h2>
          </div>

          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Usaha
                </label>
                <input
                  type="text"
                  required
                  disabled={!isOwner}
                  value={bizForm.name}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  required
                  disabled={!isOwner}
                  value={bizForm.owner_name}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, owner_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  disabled={!isOwner}
                  value={bizForm.phone}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Usaha
                </label>
                <input
                  type="email"
                  disabled={!isOwner}
                  value={bizForm.email}
                  onChange={(e) =>
                    setBizForm({ ...bizForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows={2}
                disabled={!isOwner}
                value={bizForm.address}
                onChange={(e) =>
                  setBizForm({ ...bizForm, address: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Kaki Struk (Receipt Footer)
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={bizForm.receipt_footer}
                onChange={(e) =>
                  setBizForm({ ...bizForm, receipt_footer: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl disabled:bg-slate-50"
              />
            </div>

            {isOwner && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Team & Roles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <UsersIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Manajemen Tim &amp; Peran
                </h2>
                <p className="text-xs text-slate-500">
                  Owner memiliki akses penuh; Admin mengelola produk, stok, &amp;
                  laporan; Kasir mengakses POS &amp; pelanggan.
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => setAddOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Tambah Admin / Kasir
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {team.map((member) => (
              <div
                key={member.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {member.full_name}
                  </p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <select
                  disabled={!isOwner || member.id === profile?.id}
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(member.id, e.target.value as UserRole)
                  }
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white disabled:bg-slate-50"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="cashier">Kasir</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Anggota Tim (Admin / Kasir)"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={memberForm.fullName}
              onChange={(e) =>
                setMemberForm({ ...memberForm, fullName: e.target.value })
              }
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={memberForm.email}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
              placeholder="admin@usaha.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={memberForm.password}
              onChange={(e) =>
                setMemberForm({ ...memberForm, password: e.target.value })
              }
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Peran (Role)
            </label>
            <select
              value={memberForm.role}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  role: e.target.value as "admin" | "cashier",
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            >
              <option value="admin">Admin</option>
              <option value="cashier">Kasir</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creatingMember}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl disabled:opacity-50"
            >
              {creatingMember ? "Membuat..." : "Buat Akun"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
