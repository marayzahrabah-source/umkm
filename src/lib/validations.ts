import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter").max(100),
  customerWhatsapp: z
    .string()
    .min(9, "Nomor WhatsApp tidak valid")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya boleh berisi angka"),
  shippingAddress: z.string().min(5, "Alamat lengkap wajib diisi").max(500),
  deliveryMethod: z.enum(["Ambil di Toko", "Kurir Toko", "Ojek Online"]),
  orderDate: z.string().min(1, "Tanggal pesanan wajib dipilih"),
  notes: z.string().max(500).optional(),
  promoCode: z.string().max(50).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("ID produk tidak valid"),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.number().int().min(1, "Minimal 1 item").max(100),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk wajib diisi").max(150),
  slug: z.string().min(2, "Slug wajib diisi").max(150),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  image_url: z.string().url("URL gambar tidak valid").or(z.literal("")).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori wajib diisi").max(100),
  slug: z.string().min(2, "Slug wajib diisi").max(100),
  description: z.string().max(300).optional().nullable(),
  image_url: z.string().url("URL gambar tidak valid").or(z.literal("")).nullable().optional(),
  is_active: z.boolean().default(true),
});

export const promotionSchema = z.object({
  code: z.string().min(3, "Kode promo minimal 3 karakter").max(30).toUpperCase(),
  title: z.string().min(3, "Judul promo wajib diisi").max(120),
  description: z.string().max(300).optional().nullable(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().positive("Nilai diskon harus lebih dari 0"),
  min_order_amount: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const storeSettingsSchema = z.object({
  store_name: z.string().min(2).max(100),
  tagline: z.string().min(2).max(150),
  description: z.string().min(5).max(1000),
  address: z.string().min(5).max(300),
  whatsapp: z.string().min(9).max(20),
  email: z.string().email("Email tidak valid"),
  opening_hours: z.string().min(3).max(150),
  instagram_url: z.string().url().or(z.literal("")).nullable().optional(),
  tiktok_url: z.string().url().or(z.literal("")).nullable().optional(),
});
