import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import type { Customer } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPelangganPage() {
  let customers: Customer[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    customers = (data as Customer[]) ?? [];
  } catch {
    customers = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Manajemen Pelanggan
        </h1>
        <p className="mt-1 text-sm text-cocoa-500">
          Daftar pelanggan yang pernah melakukan pemesanan di Sweet Bakery.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Nama</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-cocoa-500">
                    Belum ada data pelanggan.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td className="p-4 font-semibold text-cocoa-900">{c.full_name}</td>
                    <td className="p-4 text-cocoa-500">{c.whatsapp}</td>
                    <td className="p-4 text-cocoa-500">{c.address || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
