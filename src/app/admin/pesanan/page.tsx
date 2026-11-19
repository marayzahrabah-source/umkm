"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { formatRupiah } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const statusOptions: OrderStatus[] = [
  "Menunggu Konfirmasi",
  "Dikonfirmasi",
  "Diproses",
  "Siap Diambil/Dikirim",
  "Selesai",
  "Dibatalkan",
];

export default function AdminPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    loadOrders();
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Manajemen Pesanan
        </h1>
        <p className="mt-1 text-sm text-cocoa-500">
          Pantau dan perbarui status pesanan pelanggan.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                <th className="p-4">Kode</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Pengiriman</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-4 font-semibold text-cocoa-900">
                    {order.order_code}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-xs text-cocoa-500">{order.customer_whatsapp}</p>
                  </td>
                  <td className="p-4 text-cocoa-500">
                    {order.delivery_method} ({order.order_date})
                  </td>
                  <td className="p-4 font-semibold">
                    {formatRupiah(Number(order.total_amount))}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="rounded-xl border border-cocoa-200 bg-cream-50 px-3 py-1.5 text-xs font-semibold text-cocoa-900"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
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
