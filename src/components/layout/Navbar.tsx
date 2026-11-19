"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, CakeSlice, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, isHydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa-100 bg-cream-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blush-100 text-cocoa-700">
            <CakeSlice className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-cocoa-900">
            Sweet Bakery
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-cocoa-700",
                pathname === link.href ? "text-cocoa-700" : "text-cocoa-500"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/katalog"
            aria-label="Cari produk"
            className="rounded-xl p-2 text-cocoa-700 transition-colors hover:bg-cream-200/70"
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            href="/keranjang"
            aria-label="Keranjang belanja"
            className="relative flex items-center gap-1.5 rounded-xl bg-blush-100 px-3 py-2 text-sm font-semibold text-cocoa-900 transition-colors hover:bg-blush-200"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {isHydrated && totalItems > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cocoa-700 px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="rounded-xl p-2 text-cocoa-700 hover:bg-cream-200/70 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-cocoa-100 bg-cream-50 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  pathname === link.href
                    ? "bg-blush-100 text-cocoa-900"
                    : "text-cocoa-700 hover:bg-cream-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
