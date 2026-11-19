"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/types/database";

export default function AdminLaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      let query = supabase
        .from("orders")
        .select("*")
        .neq("status", "Dibatalkan")
        .order("order_date", { ascending: false });

      if (startDate) query = query.gte("order_date", startDate);
      if (endDate) query = query.lte("order_date", endDate);

      const { data } = await query;
      setOrders((data as Order[]) ?? []);
    };
    load();
  }, [startDate, endDate]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Laporan Penjualan
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-cocoa-100 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-cocoa-500">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-cocoa-200 bg-cream-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-cocoa-500">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-cocoa-200 bg-cream-50 px-3 py-2 text-sm"
            />
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-cocoa-500">Total Omzet Periode</p>
            <p className="font-display text-2xl font-bold text-cocoa-900">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Kode Pesanan</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-4 text-cocoa-500">{o.order_date}</td>
                  <td className="p-4 font-semibold text-cocoa-900">{o.order_code}</td>
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4">{o.status}</td>
                  <td className="p-4 text-right font-semibold">
                    {formatRupiah(Number(o.total_amount))}
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
