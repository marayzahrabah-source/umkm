export type OrderStatus =
  | "Menunggu Konfirmasi"
  | "Dikonfirmasi"
  | "Diproses"
  | "Siap Diambil/Dikirim"
  | "Selesai"
  | "Dibatalkan";

export type DeliveryMethod = "Ambil di Toko" | "Kurir Toko" | "Ojek Online";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "admin" | "customer";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  stock: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  gallery_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  variants?: ProductVariant[];
}

export interface Customer {
  id: string;
  profile_id: string | null;
  full_name: string;
  whatsapp: string;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string | null;
  promotion_id: string | null;
  customer_name: string;
  customer_whatsapp: string;
  shipping_address: string;
  delivery_method: DeliveryMethod;
  order_date: string;
  notes: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  description: string;
  address: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  slug: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxStock: number;
}
