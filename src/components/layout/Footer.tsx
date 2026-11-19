import React from "react";
import Link from "next/link";
import { CakeSlice, MapPin, Phone, Clock, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cocoa-100 bg-cream-100 text-cocoa-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blush-100 text-cocoa-700">
                <CakeSlice className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold text-cocoa-900">
                Sweet Bakery
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-cocoa-500">
              Kue hangat dan pastry artisanal yang dipanggang segar setiap pagi
              menggunakan bahan premium pilihan untuk momen spesial Anda.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa-900">
              Navigasi
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/katalog" className="hover:text-cocoa-900">
                  Katalog Kue
                </Link>
              </li>
              <li>
                <Link href="/lacak-pesanan" className="hover:text-cocoa-900">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-cocoa-900">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-cocoa-900">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa-900">
              Kontak & Lokasi
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm text-cocoa-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cocoa-700" />
                <span>Jl. Melati No. 24, Cihapit, Bandung 40114</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-cocoa-700" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-cocoa-700" />
                <span>halo@sweetbakery.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-cocoa-700" />
                <span>Senin - Minggu, 08.00 - 20.00 WIB</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-cocoa-900">
              Area Admin
            </h4>
            <p className="mt-3 text-sm text-cocoa-500">
              Pengelola toko dapat masuk ke dashboard untuk mengelola produk dan pesanan.
            </p>
            <Link
              href="/admin/login"
              className="mt-3 inline-block text-sm font-semibold text-cocoa-700 underline underline-offset-4 hover:text-cocoa-900"
            >
              Masuk Dashboard Admin
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-cocoa-200/70 pt-6 text-center text-xs text-cocoa-500">
          &copy; {new Date().getFullYear()} Sweet Bakery. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
