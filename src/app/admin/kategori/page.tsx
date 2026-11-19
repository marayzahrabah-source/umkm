"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/database";

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories((data as Category[]) ?? []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from("categories").insert({
      name,
      slug: slugify(name),
      description: description || null,
      is_active: true,
    });
    setName("");
    setDescription("");
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Manajemen Kategori
        </h1>

        <form
          onSubmit={handleAdd}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-cocoa-100 bg-white p-5 shadow-sm sm:flex-row"
        >
          <input
            type="text"
            required
            placeholder="Nama kategori baru"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="Deskripsi singkat"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
          />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Nama</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Deskripsi</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="p-4 font-semibold text-cocoa-900">{cat.name}</td>
                  <td className="p-4 text-cocoa-500">{cat.slug}</td>
                  <td className="p-4 text-cocoa-500">{cat.description || "-"}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
