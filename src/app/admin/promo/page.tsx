"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils";
import type { Promotion } from "@/types/database";

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");

  const loadPromos = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    setPromos((data as Promotion[]) ?? []);
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from("promotions").insert({
      code: code.toUpperCase(),
      title,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: Number(minOrder),
      is_active: true,
    });
    setCode("");
    setTitle("");
    setDiscountValue("");
    setMinOrder("0");
    loadPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return;
    const supabase = createClient();
    await supabase.from("promotions").delete().eq("id", id);
    loadPromos();
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Manajemen Promo & Diskon
        </h1>

        <form
          onSubmit={handleAdd}
          className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-cocoa-100 bg-white p-5 shadow-sm sm:grid-cols-5"
        >
          <input
            type="text"
            required
            placeholder="Kode (cth: SWEET10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm uppercase"
          />
          <input
            type="text"
            required
            placeholder="Judul Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
            className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
          >
            <option value="percentage">Persentase (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
          <input
            type="number"
            required
            min="1"
            placeholder="Nilai Diskon"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm"
          />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Buat Promo
          </Button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Kode</th>
                <th className="p-4">Judul</th>
                <th className="p-4">Diskon</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <Badge variant="pink">{p.code}</Badge>
                  </td>
                  <td className="p-4 font-semibold text-cocoa-900">{p.title}</td>
                  <td className="p-4">
                    {p.discount_type === "percentage"
                      ? `${p.discount_value}%`
                      : formatRupiah(Number(p.discount_value))}
                  </td>
                  <td className="p-4">{formatRupiah(Number(p.min_order_amount))}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
