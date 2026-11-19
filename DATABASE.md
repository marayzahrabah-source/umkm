# Database Design — Sweet Bakery (Supabase PostgreSQL)

## 1. Arsitektur Database
Database menggunakan **PostgreSQL** pada **Supabase** dengan Row Level Security (RLS) aktif pada seluruh tabel.

## 2. Daftar Tabel Utama
1. **`profiles`**: Menyimpan data profil pengguna yang terhubung ke `auth.users` (`id`, `full_name`, `phone`, `role` [`admin` | `customer`], `created_at`, `updated_at`).
2. **`categories`**: Kategori produk kue (`id`, `name`, `slug`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`).
3. **`products`**: Katalog produk (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `image_url`, `gallery_urls`, `is_featured`, `is_active`, `created_at`, `updated_at`).
4. **`product_variants`**: Varian ukuran/rasa produk (`id`, `product_id`, `name`, `price_adjustment`, `stock`, `sku`, `created_at`, `updated_at`).
5. **`customers`**: Data pelanggan (`id`, `profile_id`, `full_name`, `whatsapp`, `email`, `address`, `created_at`, `updated_at`).
6. **`promotions`**: Kode promo dan diskon (`id`, `code`, `title`, `description`, `discount_type` [`percentage` | `fixed`], `discount_value`, `min_order_amount`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`).
7. **`orders`**: Transaksi pesanan (`id`, `order_code`, `customer_id`, `promotion_id`, `customer_name`, `customer_whatsapp`, `shipping_address`, `delivery_method`, `order_date`, `notes`, `subtotal`, `discount_amount`, `total_amount`, `status`, `created_at`, `updated_at`).
8. **`order_items`**: Snapshot item pesanan saat transaksi dibuat (`id`, `order_id`, `product_id`, `variant_id`, `product_name_snapshot`, `variant_name_snapshot`, `unit_price_snapshot`, `quantity`, `subtotal`, `created_at`).
9. **`store_settings`**: Pengaturan profil toko (`id`, `store_name`, `tagline`, `description`, `address`, `whatsapp`, `email`, `opening_hours`, `instagram_url`, `tiktok_url`, `updated_at`).

## 3. Status Pesanan
Status pesanan menggunakan tipe/check constraint:
- `Menunggu Konfirmasi`
- `Dikonfirmasi`
- `Diproses`
- `Siap Diambil/Dikirim`
- `Selesai`
- `Dibatalkan`

## 4. Keamanan & RLS
- **Publik (Anon)**: Dapat membaca `categories`, `products`, `product_variants`, `promotions` (yang aktif), dan `store_settings`. Dapat membuat `orders` dan `order_items` melalui server action/API yang memvalidasi stok dan harga di server.
- **Pelanggan Terautentikasi**: Dapat melihat profil dan pesanan miliknya.
- **Admin (`role = 'admin'`)**: Memiliki akses penuh (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) ke seluruh tabel.

## 5. Migrasi & Seed
- Skema lengkap tersedia di `supabase/migrations/001_initial_schema.sql`.
- Data contoh produk, kategori, promo, dan pengaturan toko tersedia di `supabase/seed.sql`.
