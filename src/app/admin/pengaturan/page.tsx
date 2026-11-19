"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/Button";
import type { StoreSettings } from "@/types/database";

export default function AdminPengaturanPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("Sweet Bakery");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
      if (data) {
        const s = data as StoreSettings;
        setSettingsId(s.id);
        setStoreName(s.store_name);
        setTagline(s.tagline);
        setDescription(s.description);
        setAddress(s.address);
        setWhatsapp(s.whatsapp);
        setEmail(s.email);
        setOpeningHours(s.opening_hours);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsId) return;
    setSaving(true);
    setSavedMsg(false);
    const supabase = createClient();
    await supabase
      .from("store_settings")
      .update({
        store_name: storeName,
        tagline,
        description,
        address,
        whatsapp,
        email,
        opening_hours: openingHours,
      })
      .eq("id", settingsId);
    setSaving(false);
    setSavedMsg(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Pengaturan Profil Toko
        </h1>

        <form
          onSubmit={handleSave}
          className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm"
        >
          {savedMsg && (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              Pengaturan toko berhasil disimpan.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold">Nama Toko</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Deskripsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Alamat</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Jam Operasional</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Pengaturan
          </Button>
        </form>
      </main>
    </div>
  );
}
