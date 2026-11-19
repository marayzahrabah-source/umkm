# Product Requirements Document (PRD) — Sweet Bakery

## 1. Ringkasan Produk
**Sweet Bakery** adalah platform e-commerce UMKM toko kue modern berbasis web yang menghubungkan pelanggan dengan produk kue artisanal secara langsung, sekaligus menyediakan dashboard admin terintegrasi untuk mengelola operasional toko, pesanan, stok, promo, dan laporan penjualan.

## 2. Tujuan Bisnis
- Mempermudah pelanggan melihat katalog kue, memilih varian ukuran, dan memesan secara online.
- Mengotomatiskan pencatatan pesanan ke database dengan kode pesanan unik dan pelacakan status real-time.
- Menyediakan opsi konfirmasi cepat melalui WhatsApp setelah pesanan tersimpan.
- Memberikan dashboard admin yang aman untuk mengelola produk, kategori, stok, pelanggan, promo, dan laporan penjualan.

## 3. Target Pengguna
1. **Pelanggan (Customer)**: Pembeli individu maupun acara (ulang tahun, pernikahan, corporate) yang ingin memesan kue secara praktis dari perangkat mobile maupun desktop.
2. **Admin / Pemilik Toko**: Pengelola UMKM yang memantau penjualan harian, memperbarui stok, mengelola status pesanan, dan mengatur promosi.

## 4. Fitur Utama

### 4.1 Frontend Pelanggan
1. **Homepage (`/`)**: Hero banner, banner promosi aktif, produk unggulan, daftar kategori, ringkasan tentang toko, testimoni pelanggan, kontak, dan footer.
2. **Katalog Produk (`/katalog`)**: Pencarian produk, filter berdasarkan kategori, pengurutan (terbaru, harga terendah, harga tertinggi, nama A-Z), tampilan foto, harga, dan status stok.
3. **Detail Produk (`/produk/[slug]`)**: Galeri gambar, deskripsi lengkap, harga dasar & harga varian ukuran, pemilih jumlah, tombol tambah ke keranjang.
4. **Keranjang Belanja (`/keranjang`)**: Daftar item, ubah kuantitas, hapus item, perhitungan subtotal dan total estimasi.
5. **Checkout (`/checkout`)**: Formulir nama, nomor WhatsApp, alamat lengkap, metode pengiriman (Ambil di Toko / Kurir Toko / Ojek Online), tanggal pesanan, catatan, ringkasan pesanan, validasi stok & harga di server, pembuatan kode pesanan unik, dan tombol konfirmasi ke WhatsApp.
6. **Konfirmasi & Pelacakan Pesanan (`/pesanan/[code]`, `/lacak-pesanan`)**: Menampilkan detail pesanan, snapshot item, dan status pesanan terkini (`Menunggu Konfirmasi`, `Dikonfirmasi`, `Diproses`, `Siap Diambil/Dikirim`, `Selesai`, `Dibatalkan`).
7. **Tentang Kami (`/tentang`) & Kontak (`/kontak`)**: Profil bakery, jam operasional, alamat, dan saluran komunikasi.

### 4.2 Dashboard Admin (`/admin`)
1. **Autentikasi Admin (`/admin/login`)**: Login aman menggunakan Supabase Auth dengan verifikasi role `admin`.
2. **Dashboard Statistik (`/admin`)**: Total penjualan, jumlah pesanan, total produk, total pelanggan, dan grafik penjualan.
3. **Manajemen Produk (`/admin/produk`)**: CRUD produk (nama, slug, deskripsi, kategori, harga, stok, foto, status unggulan/aktif).
4. **Manajemen Kategori (`/admin/kategori`)**: CRUD kategori produk.
5. **Manajemen Pesanan (`/admin/pesanan`)**: Daftar pesanan, filter status, detail item, dan pembaruan status pesanan.
6. **Manajemen Pelanggan (`/admin/pelanggan`)**: Daftar pelanggan, riwayat jumlah pesanan, dan total belanja.
7. **Manajemen Stok (`/admin/stok`)**: Pemantauan stok menipis dan pembaruan stok cepat.
8. **Manajemen Promo & Diskon (`/admin/promo`)**: CRUD kode promo, tipe diskon (persentase/nominal), masa berlaku, dan status aktif.
9. **Laporan Penjualan (`/admin/laporan`)**: Filter laporan berdasarkan rentang tanggal, ringkasan omzet, dan daftar transaksi.
10. **Pengaturan Toko (`/admin/pengaturan`)**: Nama toko, deskripsi, alamat, nomor WhatsApp, jam operasional, dan tautan media sosial.

## 5. Kebutuhan Non-Fungsional & Keamanan
- **Desain**: Modern Minimalist Bakery (Cream `#FFFDF9`, Soft Pink `#F8E8EE`, Cokelat `#5C3D2E`, Putih `#FFFFFF`), tipografi Poppins & Nunito, mobile-first.
- **Keamanan**: Supabase Auth, Role-Based Access Control (RBAC), Row Level Security (RLS), validasi harga & stok di server, tidak pernah mempercayai total dari browser, dan tidak mengekspos `SUPABASE_SERVICE_ROLE_KEY` ke client.
- **Performa**: Server Components untuk data awal, optimasi gambar, dan loading/empty/error state di setiap halaman.
