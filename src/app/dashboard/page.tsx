"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { formatIDR, formatDateID } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Link from "next/link";
import type { Product, Sale } from "@/types/umkm";

interface DailyChartPoint {
  date: string;
  revenue: number;
}

export default function DashboardPage() {
  const { profile, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [chartData, setChartData] = useState<DailyChartPoint[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    try {
      const supabase = createClient();

      const [salesRes, productsRes] = await Promise.all([
        supabase
          .from("sales")
          .select("*, customers(id, name)")
          .eq("business_id", profile.business_id)
          .eq("payment_status", "paid")
          .order("sale_date", { ascending: false }),
        supabase
          .from("products")
          .select("*")
          .eq("business_id", profile.business_id)
          .eq("is_active", true),
      ]);

      const sales = (salesRes.data || []) as Sale[];
      const products = (productsRes.data || []) as Product[];

      setTotalRevenue(sales.reduce((sum, s) => sum + Number(s.total_amount), 0));
      setSalesCount(sales.length);
      setRecentSales(sales.slice(0, 5));

      setProductCount(products.length);
      setLowStockProducts(products.filter((p) => p.stock <= p.min_stock));

      // Build last 7 days chart
      const days: DailyChartPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
        const dayRevenue = sales
          .filter((s) => s.sale_date.slice(0, 10) === key)
          .reduce((sum, s) => sum + Number(s.total_amount), 0);
        days.push({ date: label, revenue: dayRevenue });
      }
      setChartData(days);
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id]);

  useEffect(() => {
    if (!userLoading && profile?.business_id) {
      loadDashboard();
    } else if (!userLoading && !profile) {
      setLoading(false);
    }
  }, [userLoading, profile, loadDashboard]);

  const stats = [
    {
      label: "Total Pendapatan",
      value: formatIDR(totalRevenue),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Transaksi",
      value: salesCount.toString(),
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Produk",
      value: productCount.toString(),
      icon: Package,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Stok Menipis",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color:
        lowStockProducts.length > 0
          ? "bg-amber-50 text-amber-600"
          : "bg-slate-100 text-slate-500",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            : stats.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.label}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {st.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1.5">
                        {st.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${st.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Chart & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Grafik Penjualan 7 Hari Terakhir
                </h2>
                <p className="text-xs text-slate-500">
                  Ringkasan omzet harian dalam Rupiah (IDR)
                </p>
              </div>
              <Link
                href="/reports"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                Lihat Laporan <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value) => [formatIDR(Number(value) || 0), "Omzet"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Peringatan Stok Menipis
              </h2>
              <Link
                href="/inventory"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Kelola
              </Link>
            </div>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : lowStockProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-sm text-slate-500 py-8">
                Semua stok produk dalam kondisi aman.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-64">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">SKU: {p.sku}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 shrink-0">
                      Sisa {p.stock} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Transaksi Penjualan Terbaru
            </h2>
            <Link
              href="/pos"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + Transaksi Baru
            </Link>
          </div>
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : recentSales.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada transaksi penjualan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">No. Invoice</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Pelanggan</th>
                    <th className="px-6 py-3">Metode</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {s.invoice_number}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {formatDateID(s.sale_date)}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {s.customers?.name || "Pelanggan Umum"}
                      </td>
                      <td className="px-6 py-3.5 uppercase text-xs font-semibold text-slate-600">
                        {s.payment_method}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">
                        {formatIDR(s.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
