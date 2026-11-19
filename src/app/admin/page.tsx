import React from "react";
import { ShoppingCart, CakeSlice, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Order } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalSales = 0;
  let totalOrders = 0;
  let totalProducts = 0;
  let totalCustomers = 0;
  let recentOrders: Order[] = [];

  try {
    const supabase = await createClient();
    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
    ]);

    const orders = (ordersRes.data as Order[]) ?? [];
    totalOrders = orders.length;
    totalSales = orders
      .filter((o) => o.status !== "Dibatalkan")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    totalProducts = productsRes.count ?? 0;
    totalCustomers = customersRes.count ?? 0;
    recentOrders = orders.slice(0, 5);
  } catch {
    // Fallback
  }

  const stats = [
    {
      label: "Total Penjualan",
      value: formatRupiah(totalSales),
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Total Pesanan",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-blush-100 text-cocoa-700",
    },
    {
      label: "Total Produk",
      value: totalProducts.toString(),
      icon: CakeSlice,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Total Pelanggan",
      value: totalCustomers.toString(),
      icon: Users,
      color: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="font-display text-2xl font-bold text-cocoa-900">
          Dashboard Statistik
        </h1>
        <p className="mt-1 text-sm text-cocoa-500">
          Ringkasan performa toko kue Sweet Bakery.
        </p>

        {/* Stat Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl border border-cocoa-100 bg-white p-5 shadow-sm"
              >
                <div className={`rounded-2xl p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-cocoa-500">{stat.label}</p>
                  <p className="font-display text-xl font-bold text-cocoa-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="mt-8 rounded-2xl border border-cocoa-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-cocoa-900">
            Pesanan Terbaru
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-xs uppercase text-cocoa-500">
                  <th className="py-3 pr-4">Kode</th>
                  <th className="py-3 pr-4">Pelanggan</th>
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-cocoa-500">
                      Belum ada pesanan masuk.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 pr-4 font-semibold text-cocoa-900">
                        {order.order_code}
                      </td>
                      <td className="py-3 pr-4">{order.customer_name}</td>
                      <td className="py-3 pr-4 text-cocoa-500">{order.order_date}</td>
                      <td className="py-3 pr-4 font-semibold">
                        {formatRupiah(Number(order.total_amount))}
                      </td>
                      <td className="py-3">
                        <Badge variant="pink">{order.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
