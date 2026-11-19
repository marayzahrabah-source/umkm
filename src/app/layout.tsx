import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UMKM Management System — Sistem Manajemen Bisnis Terpadu",
  description:
    "Platform manajemen bisnis UMKM Indonesia: POS Kasir, Produk, Inventaris, Pelanggan, Pemasok, Pengeluaran, dan Laporan Keuangan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <ToastProvider>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
