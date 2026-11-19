import Link from "next/link";
import { Store, ArrowRight, BarChart3, ShoppingCart, Package, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900">UMKM Management</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            Sistem Manajemen Bisnis UMKM Indonesia
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Kelola Penjualan, Stok, &amp; Keuangan Usaha dalam Satu Platform
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Solusi lengkap untuk UMKM: Kasir POS, manajemen produk &amp; inventaris,
            pelanggan, pemasok, pengeluaran, hingga laporan laba rugi otomatis.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              Mulai Kelola Usaha
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition-colors"
            >
              Buka Dasbor
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            {
              icon: ShoppingCart,
              title: "Kasir POS Cepat",
              desc: "Proses transaksi, diskon, berbagai metode pembayaran, dan cetak struk.",
            },
            {
              icon: Package,
              title: "Produk & Stok",
              desc: "Pantau stok masuk, keluar, penyesuaian, dan peringatan stok menipis.",
            },
            {
              icon: BarChart3,
              title: "Laporan Keuangan",
              desc: "Analisis omzet, laba kotor, pengeluaran, serta ekspor PDF & Excel.",
            },
            {
              icon: ShieldCheck,
              title: "Multi-Peran Aman",
              desc: "Hak akses terpisah untuk Owner, Admin, dan Kasir dengan isolasi data.",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600 mt-1.5">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
