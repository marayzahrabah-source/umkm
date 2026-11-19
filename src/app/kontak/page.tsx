import React from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function KontakPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cocoa-100 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="font-display text-3xl font-bold text-cocoa-900">
            Hubungi Sweet Bakery
          </h1>
          <p className="mt-2 text-sm text-cocoa-500">
            Ada pertanyaan tentang kue custom, hampers, atau pesanan Anda? Hubungi kami langsung.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl bg-cream-50 p-5">
              <MapPin className="h-6 w-6 shrink-0 text-cocoa-700" />
              <div>
                <h3 className="font-display text-sm font-semibold text-cocoa-900">
                  Alamat Toko
                </h3>
                <p className="mt-1 text-sm text-cocoa-500">
                  Jl. Melati No. 24, Cihapit, Bandung 40114
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-cream-50 p-5">
              <Clock className="h-6 w-6 shrink-0 text-cocoa-700" />
              <div>
                <h3 className="font-display text-sm font-semibold text-cocoa-900">
                  Jam Operasional
                </h3>
                <p className="mt-1 text-sm text-cocoa-500">
                  Senin - Minggu, 08.00 - 20.00 WIB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-cream-50 p-5">
              <Phone className="h-6 w-6 shrink-0 text-cocoa-700" />
              <div>
                <h3 className="font-display text-sm font-semibold text-cocoa-900">
                  Telepon & WhatsApp
                </h3>
                <p className="mt-1 text-sm text-cocoa-500">+62 812-3456-7890</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-cream-50 p-5">
              <Mail className="h-6 w-6 shrink-0 text-cocoa-700" />
              <div>
                <h3 className="font-display text-sm font-semibold text-cocoa-900">
                  Email
                </h3>
                <p className="mt-1 text-sm text-cocoa-500">halo@sweetbakery.id</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" /> Chat via WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
