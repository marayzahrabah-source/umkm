"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CakeSlice,
  FolderTree,
  ShoppingCart,
  Users,
  Boxes,
  TicketPercent,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: CakeSlice },
  { href: "/admin/kategori", label: "Kategori", icon: FolderTree },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/admin/stok", label: "Stok", icon: Boxes },
  { href: "/admin/promo", label: "Promo & Diskon", icon: TicketPercent },
  { href: "/admin/laporan", label: "Laporan Penjualan", icon: BarChart3 },
  { href: "/admin/pengaturan", label: "Pengaturan Toko", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-full flex-col border-b border-cocoa-100 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center justify-between border-b border-cocoa-100 px-6">
        <Link href="/admin" className="font-display text-lg font-bold text-cocoa-900">
          Sweet Bakery <span className="text-xs font-normal text-cocoa-500">Admin</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          title="Lihat Toko"
          className="rounded-lg p-1.5 text-cocoa-500 hover:bg-cream-100"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 lg:flex-col">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-blush-100 text-cocoa-900"
                  : "text-cocoa-500 hover:bg-cream-100 hover:text-cocoa-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cocoa-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
