"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function LacakPesananPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/pesanan/${trimmed}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
        <div className="rounded-3xl border border-cocoa-100 bg-white p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl font-bold text-cocoa-900">
            Lacak Status Pesanan
          </h1>
          <p className="mt-2 text-sm text-cocoa-500">
            Masukkan kode pesanan Anda (contoh: <span className="font-semibold">SB-261118-ABCD</span>)
            untuk melihat status terkini.
          </p>

          <form onSubmit={handleTrack} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masukkan kode pesanan..."
                className="w-full rounded-xl border border-cocoa-200 bg-cream-50 py-3 pl-10 pr-4 text-sm uppercase focus:border-cocoa-500 focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg">
              Lacak
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
