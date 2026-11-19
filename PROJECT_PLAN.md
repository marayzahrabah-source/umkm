# PROJECT PLAN — SISTEM INFORMASI MANAJEMEN INVENTARIS (SIM-INVENTARIS)

## 1. Ringkasan Eksekutif & Tujuan Proyek
**SIM-INVENTARIS** adalah aplikasi web enterprise modern untuk mengelola siklus hidup inventaris secara menyeluruh, akurat, dan dapat diaudit (auditable). Sistem dirancang agar fleksibel digunakan oleh kantor, sekolah, perusahaan, instansi, maupun organisasi UMKM.

### Tujuan Utama:
1. **Sentralisasi Data Master**: Mengelola data barang, kategori, satuan, supplier, dan lokasi penyimpanan dengan kode unik otomatis.
2. **Kontrol Stok Akurat & Auditable**: Setiap perubahan stok wajib melalui transaksi (`Barang Masuk`, `Barang Keluar`, `Peminjaman`, `Pengembalian`) menggunakan *Database Transaction (ACID)* sehingga stok tidak pernah bernilai negatif atau berubah tanpa jejak audit.
3. **Pelacakan Siklus Peminjaman**: Mengelola peminjaman mulai dari pengajuan, persetujuan, pengurangan stok tersedia, hingga pengembalian bertahap/penuh beserta inspeksi kondisi barang.
4. **Monitoring Real-Time & Early Warning**: Menyediakan dashboard eksekutif dengan metrik real-time dari database, grafik tren keluar-masuk barang, dan peringatan dini stok minimum (*low stock alert*).
5. **Pelaporan & Ekspor Multi-Format**: Menyediakan laporan stok, barang masuk, barang keluar, peminjaman, dan pengembalian yang dapat difilter serta diekspor ke **PDF**, **Excel (.xlsx)**, dan **Print View**.
6. **Keamanan & Role-Based Access Control (RBAC)**: Mengamankan sistem menggunakan autentikasi berbasis sesi terenkripsi (HTTP-Only Cookie JWT/Session), password hashing (`bcryptjs`), validasi berlapis (`Zod`), proteksi mutasi, dan pembatasan hak akses ketat untuk role **ADMIN**, **PETUGAS**, dan **USER** di level frontend maupun backend API.

---

## 2. Analisis Environment Saat Ini
Berdasarkan pemeriksaan awal pada direktori kerja `c:\Users\USER\web umkm`:
- **Status Workspace**: Direktori proyek masih kosong (greenfield project), sehingga struktur modular dapat dibangun dari awal secara bersih.
- **Database Environment**: Terdeteksi instalasi **XAMPP** pada `D:\xampp` (menyediakan layanan **MySQL / MariaDB**).
- **Runtime Environment**: Binary `node` dan `npm` belum terdaftar pada `PATH` sistem standar (akan diverifikasi/diinstal pada **Tahap 2 — Setup**).

---

## 3. Spesifikasi Teknologi (Tech Stack)

| Layer | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework Utama** | **Next.js (App Router, TypeScript)** | Full-stack framework modern yang menyatukan Frontend React dan Backend API Route / Server Actions dalam satu repositori terstruktur, cepat, dan mudah dipelihara. |
| **Styling & UI** | **Tailwind CSS** + Custom Reusable UI | Desain dashboard minimalis enterprise dengan palet warna **White, Slate, dan Blue Accent**, responsif di desktop, tablet, dan mobile. |
| **Database** | **MySQL** (`mysql2/promise` + **Prisma ORM**) | Mendukung relasi Foreign Key yang ketat, migrasi skema terstruktur, pencegahan SQL Injection otomatis (parameterized queries), dan transaksi interaktif (`prisma.$transaction`). |
| **Authentication** | **Jose (JWT HTTP-Only Session Cookie)** + **bcryptjs** | Sesi aman berbasis HTTP-Only Cookie, bebas kebocoran XSS, dilengkapi middleware otorisasi per route dan API. |
| **Validasi Data** | **Zod** | Validasi skema satu pintu (shared schema) untuk form di sisi klien dan payload di sisi backend API. |
| **Visualisasi Data** | **Recharts** | Grafik interaktif dan responsif untuk analisis transaksi barang masuk dan keluar bulanan/harian. |
| **Ikonografi** | **Lucide React** | Ikon konsisten, ringan, dan bersih untuk antarmuka SaaS/Enterprise. |
| **Export Laporan** | **SheetJS (`xlsx`) / ExcelJS** & **jsPDF (`jspdf-autotable`)** | Pembuatan dokumen laporan resmi dalam format Excel (`.xlsx`), PDF siap cetak, dan tampilan cetak langsung (`window.print()`). |

---

## 4. Matriks Hak Akses (Role-Based Access Control)

| Modul / Fitur | ADMIN | PETUGAS | USER |
| :--- | :---: | :---: | :---: |
| **Dashboard Statistik & Grafik** | Penuh (Semua Data) | Penuh (Semua Data) | Terbatas (Katalog & Pinjaman Miliknya) |
| **Master Data Barang** | Lihat, Tambah, Edit, Hapus | Lihat, Tambah, Edit | Lihat Saja (Katalog & Ketersediaan) |
| **Master Kategori, Satuan, Lokasi, Supplier** | Lihat, Tambah, Edit, Hapus | Lihat, Tambah, Edit | - |
| **Transaksi Barang Masuk** | Lihat, Input Transaksi | Lihat, Input Transaksi | - |
| **Transaksi Barang Keluar** | Lihat, Input Transaksi | Lihat, Input Transaksi | - |
| **Peminjaman Barang** | Lihat Semua, Input, Setujui/Tolak | Lihat Semua, Input, Setujui/Tolak | Ajukan Peminjaman & Lihat Riwayat Sendiri |
| **Pengembalian Barang** | Lihat Semua, Proses Pengembalian | Lihat Semua, Proses Pengembalian | Lihat Status Pengembalian Sendiri |
| **Laporan & Export (PDF/Excel/Print)** | Semua Laporan | Semua Laporan | - |
| **Manajemen User & Role** | CRUD User, Ubah Role, Nonaktifkan | - | - |
| **Riwayat Aktivitas (Audit Log)** | Lihat Semua Log | - | - |
| **Pengaturan Sistem & Profil** | Pengaturan Sistem & Profil | Pengaturan Profil | Pengaturan Profil |

---

## 5. Daftar Modul & Kebutuhan Fungsional

### 5.1. Dashboard
- **6 Kartu Statistik Utama**: Total Jenis Barang, Total Stok Tersedia, Total Barang Masuk (kumulatif/periode), Total Barang Keluar, Total Barang Sedang Dipinjam, dan Jumlah Barang Stok Minimum.
- **Grafik Analitik**: Grafik perbandingan transaksi Barang Masuk vs Barang Keluar (Recharts Bar/Area Chart).
- **Tabel Ringkas**: Daftar 5–10 Transaksi Terbaru & Daftar Barang dengan Stok Kritis (`available_stock <= min_stock`).

### 5.2. Master Data
1. **Data Barang (`items`)**:
   - Kode barang unik otomatis (`BRG-YYYYMM-XXXX`), Nama, Kategori, Merek, Spesifikasi, Satuan, Total Stok, Stok Tersedia, Stok Dipinjam, Stok Minimum, Harga Satuan, Lokasi Penyimpanan, Kondisi (`BAIK`, `RUSAK_RINGAN`, `RUSAK_BERAT`), Tanggal Pembelian, Gambar Barang (validasi tipe & ukuran file), dan Keterangan.
   - Pencarian instan, filter Kategori, filter Lokasi, filter Kondisi/Stok Minimum, dan Pagination.
2. **Kategori Barang (`categories`)**: CRUD dengan proteksi penghapusan apabila masih memiliki relasi barang aktif.
3. **Satuan Barang (`units`)**: CRUD satuan (Pcs, Unit, Box, Set, Rim, dll.) dengan proteksi relasi.
4. **Supplier (`suppliers`)**: CRUD informasi pemasok (Kode, Nama Supplier, Nama Kontak, Telepon, Email, Alamat, Keterangan).
5. **Lokasi Barang (`locations`)**: CRUD lokasi penyimpanan (Kode Lokasi, Nama Ruangan/Gudang/Rak, Gedung/Lantai, Penanggung Jawab, Keterangan).

### 5.3. Transaksi Inventaris
1. **Barang Masuk (`IN`)**:
   - Nomor transaksi otomatis (`TRX-IN-YYYYMMDD-XXXX`), Tanggal, Supplier, Keterangan, dan daftar item (multi-item atau single-item dengan jumlah & harga beli).
   - Efek Transaksi: Menambah `total_stock` dan `available_stock` pada tabel `items` secara atomik.
2. **Barang Keluar (`OUT`)**:
   - Nomor transaksi otomatis (`TRX-OUT-YYYYMMDD-XXXX`), Tanggal, Tujuan Penggunaan, Penanggung Jawab, Keterangan, dan daftar item beserta jumlah.
   - Validasi Ketat: Menolak transaksi jika `jumlah > available_stock` (mencegah stok negatif).
   - Efek Transaksi: Mengurangi `total_stock` dan `available_stock`.
3. **Peminjaman Barang (`loans`)**:
   - Nomor peminjaman otomatis (`LOAN-YYYYMMDD-XXXX`), Nama/Akun Peminjam, Instansi/Divisi, Nomor Kontak, Tanggal Pinjam, Tanggal Rencana Kembali, Status (`MENUNGGU_PERSETUJUAN`, `DIPINJAM`, `DIKEMBALIKAN_SEBAGIAN`, `SELESAI`, `TERLAMBAT`, `DITOLAK`), dan detail barang yang dipinjam.
   - Saat disetujui/dipinjam: Mengurangi `available_stock` dan menambah `borrowed_stock` (sedangkan `total_stock` tetap tercatat sebagai aset inventaris).
   - Deteksi otomatis status `TERLAMBAT` jika melewati `expected_return_date` dan belum selesai dikembalikan.
4. **Pengembalian Barang (`returns`)**:
   - Nomor pengembalian otomatis (`RET-YYYYMMDD-XXXX`), pencarian transaksi peminjaman aktif (`DIPINJAM` / `DIKEMBALIKAN_SEBAGIAN` / `TERLAMBAT`).
   - Input jumlah dikembalikan per barang, Kondisi saat dikembalikan (`BAIK`, `RUSAK_RINGAN`, `RUSAK_BERAT`, `HILANG`), Tanggal Kembali, dan Catatan Kerusakan.
   - Efek Stok:
     - Barang kembali dalam kondisi layak (`BAIK` / `RUSAK_RINGAN` yang masih bisa dipakai) menambah `available_stock` dan mengurangi `borrowed_stock`.
     - Barang kembali dalam kondisi `RUSAK_BERAT` atau `HILANG` mengurangi `borrowed_stock` dan mengurangi `total_stock` (atau tercatat rusak) dengan jejak audit lengkap.
   - Pembaruan otomatis status peminjaman menjadi `DIKEMBALIKAN_SEBAGIAN` atau `SELESAI`.

### 5.4. Laporan & Ekspor
- 5 Jenis Laporan: **Laporan Stok Saat Ini**, **Laporan Barang Masuk**, **Laporan Barang Keluar**, **Laporan Peminjaman**, dan **Laporan Pengembalian**.
- Filter rentang tanggal (`startDate` – `endDate`), kategori, lokasi, status, dan barang spesifik.
- Ekspor langsung ke **PDF**, **Excel (.xlsx)**, dan **Cetak (Print)**.

### 5.5. Manajemen User, Audit Log, dan Pengaturan
- **Manajemen User**: Tambah/Edit/Nonaktifkan user, reset password, penetapan Role (`ADMIN`, `PETUGAS`, `USER`).
- **Riwayat Aktivitas (`activity_logs`)**: Mencatat setiap aksi penting (Login, Logout, Create/Update/Delete Master Data, Transaksi Masuk/Keluar, Peminjaman, Pengembalian) beserta waktu, pelaku, IP/User-Agent, dan ringkasan perubahan.
- **Pengaturan (`settings`)**: Profil organisasi (Nama Instansi, Alamat, Telepon, Email untuk kop laporan) serta pengaturan profil & ubah password pengguna aktif.

---

## 6. Roadmap Pengembangan Bertahap

### TAHAP 1 — ANALISIS & PERENCANAAN (Saat Ini)
- [x] Pemeriksaan environment kerja & tools.
- [x] Penyusunan `PROJECT_PLAN.md`.
- [x] Perancangan database MySQL & ERD (`DATABASE_DESIGN.md`).
- [x] Perancangan arsitektur sistem & struktur kode (`SYSTEM_ARCHITECTURE.md`).
- [x] Presentasi rencana implementasi.

### TAHAP 2 — SETUP INFRASTRUKTUR & AUTENTIKASI
- [ ] Verifikasi/instalasi Node.js & koneksi ke MySQL (`D:\xampp\mysql`).
- [ ] Inisialisasi proyek Next.js (TypeScript, Tailwind CSS, Prisma, Zod, Lucide React, Recharts).
- [ ] Eksekusi migrasi database MySQL (14+ tabel dengan relasi Foreign Key & Index) dan *Seed Data* awal (3 Role: Admin, Petugas, User, kategori, satuan, lokasi, supplier, dan data barang contoh yang nyata).
- [ ] Implementasi autentikasi (Login, Logout, Session Middleware, RBAC Guard) dan Layout Utama (Sidebar, Topbar, Toast, Reusable UI Components).

### TAHAP 3 — IMPLEMENTASI MASTER DATA
- [ ] Modul Kategori Barang (CRUD + validasi proteksi hapus).
- [ ] Modul Satuan Barang (CRUD + validasi proteksi hapus).
- [ ] Modul Lokasi Penyimpanan (CRUD + validasi proteksi hapus).
- [ ] Modul Supplier (CRUD + pencarian + pagination).
- [ ] Modul Data Barang (CRUD lengkap + kode otomatis + upload gambar + filter multi-kriteria + detail modal + pagination).

### TAHAP 4 — IMPLEMENTASI TRANSAKSI & PEMINJAMAN
- [ ] Modul Transaksi Barang Masuk (Input transaksi + update stok otomatis dengan DB Transaction).
- [ ] Modul Transaksi Barang Keluar (Input transaksi + proteksi stok negatif + update stok otomatis).
- [ ] Modul Peminjaman Barang (Pengajuan oleh User/Petugas, Persetujuan, alokasi `available_stock` & `borrowed_stock`, indikator keterlambatan).
- [ ] Modul Pengembalian Barang (Pencarian pinjaman aktif, pengembalian parsial/penuh, pencatatan kondisi & kerusakan, rekonsiliasi stok otomatis).

### TAHAP 5 — DASHBOARD, LAPORAN, USER, & PENGATURAN
- [ ] Dashboard Analitik Real-time (6 Kartu Statistik, Grafik Recharts Masuk vs Keluar, Tabel Transaksi Terbaru & Peringatan Stok Minimum).
- [ ] Modul Laporan (5 tab laporan + filter tanggal/kategori/barang + Export PDF, Export Excel, dan Print).
- [ ] Modul Manajemen User, Riwayat Aktivitas (Audit Log), dan Pengaturan Sistem/Profil.

### TAHAP 6 — PENGUJIAN & KEAMANAN (QA)
- [ ] Pengujian alur CRUD semua Master Data.
- [ ] Pengujian konsistensi stok pada Transaksi Masuk, Keluar, Peminjaman, dan Pengembalian.
- [ ] Pengujian autentikasi & pembatasan akses per Role (`ADMIN`, `PETUGAS`, `USER`).
- [ ] Pengujian validasi input dan responsivitas UI.

### TAHAP 7 — FINALISASI & DOKUMENTASI
- [ ] Penyusunan `.env.example`, `README.md` (Panduan Instalasi, Penggunaan, Akun Demo, dan Deployment).
- [ ] Verifikasi build produksi.
