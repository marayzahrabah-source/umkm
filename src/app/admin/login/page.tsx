"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CakeSlice, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke layanan autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-cocoa-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-cocoa-700">
            <CakeSlice className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cocoa-900">
            Login Admin Sweet Bakery
          </h1>
          <p className="mt-1 text-sm text-cocoa-500">
            Masuk untuk mengelola produk, pesanan, dan laporan toko.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-cocoa-900">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sweetbakery.id"
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-cocoa-900">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-cocoa-200 bg-cream-50 px-3.5 py-2.5 text-sm focus:border-cocoa-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
