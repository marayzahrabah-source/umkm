# Sweet Bakery — Website UMKM Toko Kue

Website e-commerce UMKM toko kue modern dengan frontend pelanggan dan dashboard admin terintegrasi menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Supabase**.

## Fitur Utama
- **Frontend Pelanggan**: Homepage, Katalog Produk (pencarian, filter kategori, sorting), Detail Produk (varian ukuran & galeri), Keranjang Belanja, Checkout dengan validasi server-side & konfirmasi WhatsApp, Lacak Pesanan, Tentang Kami, dan Kontak.
- **Dashboard Admin**: Login aman (Supabase Auth + RBAC), Statistik & Grafik Penjualan, CRUD Produk, CRUD Kategori, Manajemen Pesanan & Status, Manajemen Pelanggan, Manajemen Stok, Manajemen Promo, Laporan Penjualan, dan Pengaturan Toko.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Validasi**: Zod

## Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js 18+ dan npm/pnpm
- Akun [Supabase](https://supabase.com)

### 2. Clone & Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi nilai berikut dari dashboard proyek Supabase Anda (**Project Settings > API**):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (hanya digunakan di server, jangan pernah diekspos ke client)

### 4. Setup Database Supabase
1. Buka **SQL Editor** di dashboard Supabase Anda.
2. Jalankan isi file `supabase/migrations/001_initial_schema.sql` untuk membuat seluruh tabel, index, constraint, dan kebijakan RLS.
3. Jalankan isi file `supabase/seed.sql` untuk mengisi data awal (kategori, produk contoh, varian, promo, dan pengaturan toko).
4. Buat user admin pertama melalui **Authentication > Users** di Supabase, lalu ubah `role` user tersebut di tabel `profiles` menjadi `'admin'`:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_UUID_ANDA';
   ```

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

## Panduan Deployment (Vercel)
1. Push repository ke GitHub/GitLab.
2. Import proyek ke [Vercel](https://vercel.com).
3. Tambahkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) di pengaturan Vercel.
4. Klik **Deploy**.
