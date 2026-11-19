import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TentangPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-3xl border border-cocoa-100 bg-white p-8 shadow-sm sm:p-12">
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa-900">
              Tentang Sweet Bakery
            </h1>
            <p className="mt-2 text-sm text-cocoa-500">
              Menghadirkan kehangatan kue rumahan dengan standar kualitas artisanal.
            </p>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80"
              alt="Dapur Sweet Bakery"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-cocoa-700 sm:text-base">
            <p>
              Sweet Bakery bermula dari dapur rumahan di Bandung dengan satu misi
              sederhana: membuat kue dan pastry yang tidak hanya cantik dipandang,
              tetapi juga lembut, jujur bahannya, dan aman dinikmati seluruh
              keluarga.
            </p>
            <p>
              Setiap pagi, tim baker kami memanggang croissant, cupcake, dan sponge
              cake menggunakan mentega murni, cokelat Belgia, serta buah-buahan segar
              tanpa tambahan pengawet buatan.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
