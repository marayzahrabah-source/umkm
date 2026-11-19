"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { UserRole } from "@/types/umkm";
import { Skeleton } from "@/components/ui/Skeleton";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "cashier"] },
  { label: "Kasir (POS)", href: "/pos", icon: ShoppingCart, roles: ["owner", "admin", "cashier"] },
  { label: "Produk", href: "/products", icon: Package, roles: ["owner", "admin"] },
  { label: "Inventaris", href: "/inventory", icon: Boxes, roles: ["owner", "admin"] },
  { label: "Pelanggan", href: "/customers", icon: Users, roles: ["owner", "admin", "cashier"] },
  { label: "Pemasok", href: "/suppliers", icon: Truck, roles: ["owner", "admin"] },
  { label: "Pembelian", href: "/purchases", icon: ClipboardList, roles: ["owner", "admin"] },
  { label: "Pengeluaran", href: "/expenses", icon: Wallet, roles: ["owner", "admin"] },
  { label: "Laporan", href: "/reports", icon: BarChart3, roles: ["owner", "admin"] },
  { label: "Pengaturan", href: "/settings", icon: Settings, roles: ["owner", "admin"] },
];

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  cashier: "Kasir",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, business, role, loading, signOut } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter((item) =>
    role ? item.roles.includes(role) : true
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <Store className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">
            {business?.name || "UMKM System"}
          </p>
          <p className="text-xs text-slate-500 truncate">Manajemen Bisnis</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              {visibleNav.find((n) => pathname.startsWith(n.href))?.label || "UMKM Management"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : profile ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 leading-none">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{profile.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {ROLE_LABELS[profile.role]}
                </span>
              </div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
