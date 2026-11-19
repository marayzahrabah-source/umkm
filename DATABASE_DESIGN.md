# DATABASE DESIGN & ENTITY RELATIONSHIP DIAGRAM (ERD)
## SISTEM INFORMASI MANAJEMEN INVENTARIS (MySQL)

Dokumen ini menjelaskan rancangan skema database **MySQL** untuk Sistem Informasi Manajemen Inventaris. Skema dirancang dengan normalisasi tingkat ketiga (3NF), integritas referensial penuh menggunakan **Foreign Key**, **Unique Constraints**, **Composite Indexing**, **Timestamps**, **Soft Delete**, serta mekanisme **ACID Database Transaction** untuk menjaga keakuratan stok barang.

---

## 1. Prinsip Integritas Stok & Audit
1. **Stok Terstruktur**: Setiap barang (`items`) menyimpan tiga indikator kuantitas yang selalu sinkron:
   - `total_stock`: Total fisik barang milik inventaris (tersedia + sedang dipinjam).
   - `available_stock`: Stok yang siap digunakan/dipinjam di lokasi penyimpanan.
   - `borrowed_stock`: Stok yang sedang berada di tangan peminjam aktif.
   - **Rumus Invarian**: `total_stock = available_stock + borrowed_stock` dan `available_stock >= 0`.
2. **Dilarang Mengubah Stok Tanpa Jejak Transaksi**:
   - **Barang Masuk (`IN`)**: `total_stock += qty`, `available_stock += qty`.
   - **Barang Keluar (`OUT`)**: Validasi `available_stock >= qty`, lalu `total_stock -= qty`, `available_stock -= qty`.
   - **Peminjaman Disetujui (`DIPINJAM`)**: Validasi `available_stock >= qty`, lalu `available_stock -= qty`, `borrowed_stock += qty` (`total_stock` tetap).
   - **Pengembalian Layak Pakai (`BAIK` / `RUSAK_RINGAN`)**: `borrowed_stock -= qty_returned`, `available_stock += qty_returned`.
   - **Pengembalian Rusak Berat / Hilang (`RUSAK_BERAT` / `HILANG`)**: `borrowed_stock -= qty_returned`, `total_stock -= qty_returned` (tercatat pada detail pengembalian & log audit).

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    roles ||--o{ users : "has"
    categories ||--o{ items : "classifies"
    units ||--o{ items : "measures"
    locations ||--o{ items : "stores"
    suppliers ||--o{ stock_transactions : "supplies"
    users ||--o{ stock_transactions : "records"
    stock_transactions ||--|{ stock_transaction_details : "contains"
    items ||--o{ stock_transaction_details : "included_in"
    users ||--o{ loans : "requests_or_creates"
    users ||--o{ loans : "approves"
    loans ||--|{ loan_details : "contains"
    items ||--o{ loan_details : "borrowed_in"
    loans ||--o{ returns : "returned_via"
    users ||--o{ returns : "processes"
    returns ||--|{ return_details : "contains"
    loan_details ||--o{ return_details : "reconciles"
    items ||--o{ return_details : "returned_item"
    users ||--o{ activity_logs : "performs"

    roles {
        int id PK
        varchar code UK "ADMIN, PETUGAS, USER"
        varchar name
        text description
        datetime created_at
        datetime updated_at
    }

    users {
        int id PK
        int role_id FK
        varchar name
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar phone
        varchar department
        boolean is_active
        datetime last_login_at
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    categories {
        int id PK
        varchar code UK
        varchar name UK
        text description
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    units {
        int id PK
        varchar code UK
        varchar name UK
        text description
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    suppliers {
        int id PK
        varchar code UK
        varchar name
        varchar contact_name
        varchar phone
        varchar email
        text address
        text notes
        boolean is_active
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    locations {
        int id PK
        varchar code UK
        varchar name
        varchar building
        varchar pic_name
        text description
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    items {
        int id PK
        varchar code UK "BRG-YYYYMM-XXXX"
        varchar name
        int category_id FK
        int unit_id FK
        int location_id FK
        varchar brand
        text specifications
        int total_stock
        int available_stock
        int borrowed_stock
        int min_stock
        decimal unit_price
        enum item_condition "BAIK, RUSAK_RINGAN, RUSAK_BERAT"
        date purchase_date
        varchar image_url
        text notes
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    stock_transactions {
        int id PK
        varchar transaction_code UK "TRX-IN / TRX-OUT"
        enum type "IN, OUT"
        datetime transaction_date
        int supplier_id FK "Nullable for OUT"
        varchar purpose "For OUT"
        varchar recipient_pic "For OUT"
        decimal total_amount
        text notes
        int created_by FK
        datetime created_at
        datetime updated_at
    }

    stock_transaction_details {
        int id PK
        int stock_transaction_id FK
        int item_id FK
        int quantity
        decimal unit_price
        decimal subtotal
        int stock_before
        int stock_after
        text notes
    }

    loans {
        int id PK
        varchar loan_code UK "LOAN-YYYYMMDD-XXXX"
        int borrower_user_id FK "Nullable if external staff"
        varchar borrower_name
        varchar borrower_phone
        varchar borrower_department
        datetime loan_date
        datetime expected_return_date
        datetime actual_return_date
        enum status "MENUNGGU_PERSETUJUAN, DIPINJAM, DIKEMBALIKAN_SEBAGIAN, SELESAI, TERLAMBAT, DITOLAK"
        text purpose
        text notes
        int approved_by FK
        int created_by FK
        datetime created_at
        datetime updated_at
    }

    loan_details {
        int id PK
        int loan_id FK
        int item_id FK
        int quantity_borrowed
        int quantity_returned
        text notes
    }

    returns {
        int id PK
        varchar return_code UK "RET-YYYYMMDD-XXXX"
        int loan_id FK
        datetime return_date
        varchar returned_by_name
        int processed_by FK
        enum status "SEBAGIAN, LENGKAP"
        text notes
        datetime created_at
        datetime updated_at
    }

    return_details {
        int id PK
        int return_id FK
        int loan_detail_id FK
        int item_id FK
        int quantity_returned
        enum return_condition "BAIK, RUSAK_RINGAN, RUSAK_BERAT, HILANG"
        boolean is_restocked
        text damage_notes
    }

    activity_logs {
        bigint id PK
        int user_id FK
        varchar action "LOGIN, CREATE, UPDATE, DELETE, APPROVE, RETURN"
        varchar module "AUTH, ITEM, CATEGORY, TRX_IN, TRX_OUT, LOAN, RETURN, USER"
        varchar target_id
        text description
        json metadata
        varchar ip_address
        varchar user_agent
        datetime created_at
    }
```

---

## 3. Spesifikasi Detail Tabel (15 Tabel)

### 3.1. Tabel `roles`
Menyimpan daftar hak akses dasar pengguna.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(30) NOT NULL UNIQUE (`ADMIN`, `PETUGAS`, `USER`)
- `name` VARCHAR(50) NOT NULL
- `description` TEXT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### 3.2. Tabel `users`
Menyimpan akun pengguna yang dapat mengakses sistem.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `role_id` INT NOT NULL, FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
- `name` VARCHAR(100) NOT NULL
- `username` VARCHAR(50) NOT NULL UNIQUE
- `email` VARCHAR(100) NOT NULL UNIQUE
- `password_hash` VARCHAR(255) NOT NULL
- `phone` VARCHAR(30) NULL
- `department` VARCHAR(100) NULL
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `last_login_at` DATETIME NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `deleted_at` DATETIME NULL (Soft Delete)
- **Indexes**: `idx_users_role_id`, `idx_users_active`

### 3.3. Tabel `categories`
Menyimpan kategori barang inventaris (Elektronik, Furniture, Alat Tulis Kantor, Kendaraan, Jaringan, dll.).
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(30) NOT NULL UNIQUE
- `name` VARCHAR(100) NOT NULL UNIQUE
- `description` TEXT NULL
- `created_at`, `updated_at`, `deleted_at`

### 3.4. Tabel `units`
Menyimpan satuan kuantitas barang (Unit, Pcs, Set, Box, Rim, Pack).
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(20) NOT NULL UNIQUE
- `name` VARCHAR(50) NOT NULL UNIQUE
- `description` TEXT NULL
- `created_at`, `updated_at`, `deleted_at`

### 3.5. Tabel `suppliers`
Menyimpan daftar pemasok / vendor barang.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(30) NOT NULL UNIQUE
- `name` VARCHAR(150) NOT NULL
- `contact_name` VARCHAR(100) NOT NULL
- `phone` VARCHAR(30) NOT NULL
- `email` VARCHAR(100) NULL
- `address` TEXT NOT NULL
- `notes` TEXT NULL
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`, `updated_at`, `deleted_at`

### 3.6. Tabel `locations`
Menyimpan daftar lokasi penyimpanan barang.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(30) NOT NULL UNIQUE
- `name` VARCHAR(100) NOT NULL
- `building` VARCHAR(100) NULL
- `pic_name` VARCHAR(100) NULL
- `description` TEXT NULL
- `created_at`, `updated_at`, `deleted_at`

### 3.7. Tabel `items`
Menyimpan master data barang inventaris.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(40) NOT NULL UNIQUE (Kode otomatis, contoh: `BRG-202611-0001`)
- `name` VARCHAR(150) NOT NULL
- `category_id` INT NOT NULL, FOREIGN KEY REFERENCES `categories`(`id`) ON DELETE RESTRICT
- `unit_id` INT NOT NULL, FOREIGN KEY REFERENCES `units`(`id`) ON DELETE RESTRICT
- `location_id` INT NOT NULL, FOREIGN KEY REFERENCES `locations`(`id`) ON DELETE RESTRICT
- `brand` VARCHAR(100) NULL
- `specifications` TEXT NULL
- `total_stock` INT NOT NULL DEFAULT 0
- `available_stock` INT NOT NULL DEFAULT 0
- `borrowed_stock` INT NOT NULL DEFAULT 0
- `min_stock` INT NOT NULL DEFAULT 5
- `unit_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
- `item_condition` ENUM('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT') NOT NULL DEFAULT 'BAIK'
- `purchase_date` DATE NULL
- `image_url` VARCHAR(255) NULL
- `notes` TEXT NULL
- `created_at`, `updated_at`, `deleted_at`
- **Indexes**: `idx_items_category`, `idx_items_location`, `idx_items_name`, `idx_items_stock`

### 3.8. Tabel `stock_transactions`
Header untuk transaksi Barang Masuk (`IN`) dan Barang Keluar (`OUT`).
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `transaction_code` VARCHAR(40) NOT NULL UNIQUE (`TRX-IN-YYYYMMDD-XXXX` / `TRX-OUT-YYYYMMDD-XXXX`)
- `type` ENUM('IN', 'OUT') NOT NULL
- `transaction_date` DATETIME NOT NULL
- `supplier_id` INT NULL, FOREIGN KEY REFERENCES `suppliers`(`id`) ON DELETE SET NULL (Digunakan pada transaksi `IN`)
- `purpose` VARCHAR(255) NULL (Tujuan penggunaan pada transaksi `OUT`)
- `recipient_pic` VARCHAR(100) NULL (Penanggung jawab pada transaksi `OUT`)
- `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
- `notes` TEXT NULL
- `created_by` INT NOT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE RESTRICT
- `created_at`, `updated_at`
- **Indexes**: `idx_stock_trx_type_date`, `idx_stock_trx_supplier`

### 3.9. Tabel `stock_transaction_details`
Rincian barang pada setiap transaksi Barang Masuk / Keluar.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `stock_transaction_id` INT NOT NULL, FOREIGN KEY REFERENCES `stock_transactions`(`id`) ON DELETE CASCADE
- `item_id` INT NOT NULL, FOREIGN KEY REFERENCES `items`(`id`) ON DELETE RESTRICT
- `quantity` INT NOT NULL
- `unit_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
- `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
- `stock_before` INT NOT NULL
- `stock_after` INT NOT NULL
- `notes` TEXT NULL

### 3.10. Tabel `loans`
Header transaksi peminjaman barang inventaris.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `loan_code` VARCHAR(40) NOT NULL UNIQUE (`LOAN-YYYYMMDD-XXXX`)
- `borrower_user_id` INT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE SET NULL
- `borrower_name` VARCHAR(100) NOT NULL
- `borrower_phone` VARCHAR(30) NULL
- `borrower_department` VARCHAR(100) NULL
- `loan_date` DATETIME NOT NULL
- `expected_return_date` DATETIME NOT NULL
- `actual_return_date` DATETIME NULL
- `status` ENUM('MENUNGGU_PERSETUJUAN', 'DIPINJAM', 'DIKEMBALIKAN_SEBAGIAN', 'SELESAI', 'TERLAMBAT', 'DITOLAK') NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN'
- `purpose` VARCHAR(255) NOT NULL
- `notes` TEXT NULL
- `approved_by` INT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE SET NULL
- `created_by` INT NOT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE RESTRICT
- `created_at`, `updated_at`
- **Indexes**: `idx_loans_status`, `idx_loans_dates`, `idx_loans_borrower`

### 3.11. Tabel `loan_details`
Rincian barang yang dipinjam dalam satu transaksi peminjaman.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `loan_id` INT NOT NULL, FOREIGN KEY REFERENCES `loans`(`id`) ON DELETE CASCADE
- `item_id` INT NOT NULL, FOREIGN KEY REFERENCES `items`(`id`) ON DELETE RESTRICT
- `quantity_borrowed` INT NOT NULL
- `quantity_returned` INT NOT NULL DEFAULT 0
- `notes` TEXT NULL

### 3.12. Tabel `returns`
Header pencatatan pengembalian barang pinjaman.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `return_code` VARCHAR(40) NOT NULL UNIQUE (`RET-YYYYMMDD-XXXX`)
- `loan_id` INT NOT NULL, FOREIGN KEY REFERENCES `loans`(`id`) ON DELETE RESTRICT
- `return_date` DATETIME NOT NULL
- `returned_by_name` VARCHAR(100) NOT NULL
- `processed_by` INT NOT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE RESTRICT
- `status` ENUM('SEBAGIAN', 'LENGKAP') NOT NULL
- `notes` TEXT NULL
- `created_at`, `updated_at`

### 3.13. Tabel `return_details`
Rincian kondisi dan jumlah per barang saat dikembalikan.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `return_id` INT NOT NULL, FOREIGN KEY REFERENCES `returns`(`id`) ON DELETE CASCADE
- `loan_detail_id` INT NOT NULL, FOREIGN KEY REFERENCES `loan_details`(`id`) ON DELETE RESTRICT
- `item_id` INT NOT NULL, FOREIGN KEY REFERENCES `items`(`id`) ON DELETE RESTRICT
- `quantity_returned` INT NOT NULL
- `return_condition` ENUM('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'HILANG') NOT NULL DEFAULT 'BAIK'
- `is_restocked` BOOLEAN NOT NULL DEFAULT TRUE
- `damage_notes` TEXT NULL

### 3.14. Tabel `activity_logs`
Audit trail seluruh aktivitas pengguna di dalam sistem.
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `user_id` INT NULL, FOREIGN KEY REFERENCES `users`(`id`) ON DELETE SET NULL
- `action` VARCHAR(50) NOT NULL
- `module` VARCHAR(50) NOT NULL
- `target_id` VARCHAR(50) NULL
- `description` TEXT NOT NULL
- `metadata` JSON NULL
- `ip_address` VARCHAR(45) NULL
- `user_agent` VARCHAR(255) NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- **Indexes**: `idx_logs_user_date`, `idx_logs_module`

### 3.15. Tabel `system_settings`
Menyimpan pengaturan aplikasi dan profil organisasi untuk kop laporan.
- `id` INT AUTO_INCREMENT PRIMARY KEY
- `setting_key` VARCHAR(50) NOT NULL UNIQUE
- `setting_value` TEXT NOT NULL
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
