-- Sweet Bakery - Seed Data for Development

-- 1. Store Settings
INSERT INTO public.store_settings (
  store_name, tagline, description, address, whatsapp, email, opening_hours, instagram_url, tiktok_url
) VALUES (
  'Sweet Bakery',
  'Kue Hangat, Manisnya Setiap Momen',
  'Sweet Bakery menghadirkan kue ulang tahun, pastry, dan roti artisanal yang dipanggang segar setiap pagi menggunakan mentega premium dan bahan pilihan.',
  'Jl. Melati No. 24, Cihapit, Bandung 40114',
  '6281234567890',
  'halo@sweetbakery.id',
  'Senin - Minggu, 08.00 - 20.00 WIB',
  'https://instagram.com/sweetbakery.id',
  'https://tiktok.com/@sweetbakery.id'
);

-- 2. Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Kue Ulang Tahun', 'kue-ulang-tahun', 'Kue tart lembut dengan dekorasi elegan untuk momen spesial.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', TRUE),
  ('11111111-1111-1111-1111-111111111102', 'Pastry & Croissant', 'pastry-croissant', 'Pastry renyah berlapis mentega Prancis yang dipanggang setiap pagi.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', TRUE),
  ('11111111-1111-1111-1111-111111111103', 'Cupcake & Muffin', 'cupcake-muffin', 'Cupcake manis dengan buttercream ringan dan topping buah segar.', 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80', TRUE),
  ('11111111-1111-1111-1111-111111111104', 'Kue Kering & Hampers', 'kue-kering-hampers', 'Pilihan kue kering premium untuk bingkisan dan acara keluarga.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80', TRUE);

-- 3. Products
INSERT INTO public.products (id, category_id, name, slug, description, price, stock, image_url, gallery_urls, is_featured, is_active) VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111101',
    'Strawberry Shortcake Classic',
    'strawberry-shortcake-classic',
    'Sponge cake vanila super lembut dengan lapisan krim kocok segar dan potongan stroberi manis pilihan.',
    245000,
    12,
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80'
    ],
    TRUE,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'Belgian Chocolate Ganache Cake',
    'belgian-chocolate-ganache-cake',
    'Kue cokelat pekat menggunakan cokelat Belgia 70% dengan lapisan ganache halus yang lumer di mulut.',
    275000,
    8,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'
    ],
    TRUE,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111102',
    'Butter Croissant Artisan',
    'butter-croissant-artisan',
    'Croissant renyah di luar dan lembut berongga di dalam, dibuat dengan 100% Elle & Vire butter.',
    28000,
    30,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80'
    ],
    TRUE,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111103',
    'Pink Velvet Cupcake (Box isi 6)',
    'pink-velvet-cupcake-box-6',
    'Enam buah cupcake red & pink velvet dengan cream cheese frosting yang tidak terlalu manis.',
    135000,
    15,
    'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80'
    ],
    TRUE,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '11111111-1111-1111-1111-111111111104',
    'Choco Chip Soft Cookies (Box isi 8)',
    'choco-chip-soft-cookies-box-8',
    'Cookies lembut dengan potongan dark chocolate dan sea salt, cocok untuk teman kopi atau hadiah.',
    95000,
    20,
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80'
    ],
    FALSE,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    '11111111-1111-1111-1111-111111111102',
    'Almond Danish Pastry',
    'almond-danish-pastry',
    'Pastry manis dengan isian krim almond frangipane dan taburan almond panggang.',
    34000,
    18,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
    ],
    FALSE,
    TRUE
  );

-- 4. Product Variants
INSERT INTO public.product_variants (product_id, name, price_adjustment, stock, sku) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Diameter 16 cm', 0, 7, 'SSC-16'),
  ('22222222-2222-2222-2222-222222222201', 'Diameter 20 cm', 75000, 5, 'SSC-20'),
  ('22222222-2222-2222-2222-222222222202', 'Diameter 16 cm', 0, 5, 'BCG-16'),
  ('22222222-2222-2222-2222-222222222202', 'Diameter 20 cm', 85000, 3, 'BCG-20');

-- 5. Promotions
INSERT INTO public.promotions (code, title, description, discount_type, discount_value, min_order_amount, is_active) VALUES
  ('SWEET10', 'Diskon 10% Pelanggan Baru', 'Potongan 10% untuk minimal pembelian Rp 150.000.', 'percentage', 10, 150000, TRUE),
  ('HEMAT25K', 'Potongan Langsung Rp 25.000', 'Berlaku untuk pembelian minimal Rp 250.000.', 'fixed', 25000, 250000, TRUE);
