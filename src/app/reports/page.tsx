"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";
import { formatIDR, formatDateID } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Expense, Product, Sale, SaleItem } from "@/types/umkm";
import { FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { profile, business } = useUser();
  const [tab, setTab] = useState<"sales" | "expenses" | "inventory">("sales");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadReports = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const [salesRes, itemsRes, expRes, prodRes] = await Promise.all([
        supabase
          .from("sales")
          .select("*, customers(id, name)")
          .eq("business_id", profile.business_id)
          .gte("sale_date", `${startDate}T00:00:00`)
          .lte("sale_date", `${endDate}T23:59:59`)
          .order("sale_date", { ascending: false }),
        supabase
          .from("sale_items")
          .select("*")
          .eq("business_id", profile.business_id)
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`),
        supabase
          .from("expenses")
          .select("*")
          .eq("business_id", profile.business_id)
          .gte("expense_date", startDate)
          .lte("expense_date", endDate)
          .order("expense_date", { ascending: false }),
        supabase
          .from("products")
          .select("*, categories(id, name)")
          .eq("business_id", profile.business_id)
          .order("name"),
      ]);

      setSales((salesRes.data || []) as Sale[]);
      setSaleItems((itemsRes.data || []) as SaleItem[]);
      setExpenses((expRes.data || []) as Expense[]);
      setProducts((prodRes.data || []) as Product[]);
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id, startDate, endDate]);

  useEffect(() => {
    if (profile?.business_id) loadReports();
  }, [profile?.business_id, loadReports]);

  const totalRevenue = sales.reduce((s, r) => s + Number(r.total_amount), 0);
  const totalCOGS = saleItems.reduce(
    (s, i) => s + Number(i.purchase_price) * i.quantity,
    0
  );
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = grossProfit - totalExpenses;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(business?.name || "UMKM Management System", 14, 16);
    doc.setFontSize(10);
    doc.text(`Laporan ${tab.toUpperCase()} (${startDate} s/d ${endDate})`, 14, 23);

    if (tab === "sales") {
      autoTable(doc, {
        startY: 30,
        head: [["No. Invoice", "Tanggal", "Pelanggan", "Metode", "Total"]],
        body: sales.map((s) => [
          s.invoice_number,
          formatDateID(s.sale_date),
          s.customers?.name || "Umum",
          s.payment_method.toUpperCase(),
          formatIDR(s.total_amount),
        ]),
      });
    } else if (tab === "expenses") {
      autoTable(doc, {
        startY: 30,
        head: [["Tanggal", "Kategori", "Keterangan", "Jumlah"]],
        body: expenses.map((e) => [
          formatDateID(e.expense_date),
          e.category,
          e.description,
          formatIDR(e.amount),
        ]),
      });
    } else {
      autoTable(doc, {
        startY: 30,
        head: [["SKU", "Produk", "Stok", "Harga Beli", "Harga Jual"]],
        body: products.map((p) => [
          p.sku,
          p.name,
          `${p.stock} ${p.unit}`,
          formatIDR(p.purchase_price),
          formatIDR(p.selling_price),
        ]),
      });
    }

    doc.save(`laporan-${tab}-${startDate}.pdf`);
  };

  const exportExcel = () => {
    let rows: Record<string, unknown>[] = [];
    if (tab === "sales") {
      rows = sales.map((s) => ({
        "No. Invoice": s.invoice_number,
        Tanggal: formatDateID(s.sale_date),
        Pelanggan: s.customers?.name || "Umum",
        Metode: s.payment_method,
        Total: Number(s.total_amount),
      }));
    } else if (tab === "expenses") {
      rows = expenses.map((e) => ({
        Tanggal: formatDateID(e.expense_date),
        Kategori: e.category,
        Keterangan: e.description,
        Jumlah: Number(e.amount),
      }));
    } else {
      rows = products.map((p) => ({
        SKU: p.sku,
        Nama: p.name,
        Stok: p.stock,
        Satuan: p.unit,
        "Harga Beli": Number(p.purchase_price),
        "Harga Jual": Number(p.selling_price),
      }));
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `laporan-${tab}-${startDate}.xlsx`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Filters & Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
            <span className="text-sm text-slate-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportPDF}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-red-600" /> Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">Total Penjualan</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatIDR(totalRevenue)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">Laba Kotor</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              {formatIDR(grossProfit)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-600 mt-1">
              {formatIDR(totalExpenses)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">Laba Bersih</p>
            <p
              className={`text-xl font-bold mt-1 ${
                netProfit >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatIDR(netProfit)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: "sales", label: "Penjualan" },
            { id: "expenses", label: "Pengeluaran" },
            { id: "inventory", label: "Inventaris" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "sales" | "expenses" | "inventory")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : tab === "sales" ? (
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
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-3 font-medium">{s.invoice_number}</td>
                      <td className="px-6 py-3">{formatDateID(s.sale_date)}</td>
                      <td className="px-6 py-3">{s.customers?.name || "Umum"}</td>
                      <td className="px-6 py-3 uppercase text-xs">
                        {s.payment_method}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-emerald-700">
                        {formatIDR(s.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === "expenses" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Kategori</th>
                    <th className="px-6 py-3">Keterangan</th>
                    <th className="px-6 py-3 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="px-6 py-3">{formatDateID(e.expense_date)}</td>
                      <td className="px-6 py-3">{e.category}</td>
                      <td className="px-6 py-3">{e.description}</td>
                      <td className="px-6 py-3 text-right font-semibold text-red-600">
                        {formatIDR(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Produk</th>
                    <th className="px-6 py-3 text-center">Stok</th>
                    <th className="px-6 py-3 text-right">Nilai Modal</th>
                    <th className="px-6 py-3 text-right">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-6 py-3 font-medium">{p.name}</td>
                      <td className="px-6 py-3 text-center">
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {formatIDR(p.purchase_price)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">
                        {formatIDR(p.selling_price)}
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
