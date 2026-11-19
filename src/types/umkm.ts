export type UserRole = "owner" | "admin" | "cashier";

export interface Business {
  id: string;
  name: string;
  owner_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  tax_id: string | null;
  currency: string;
  logo_url: string | null;
  receipt_footer: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: { id: string; name: string } | null;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "cash" | "qris" | "transfer" | "debit" | "credit";

export interface Sale {
  id: string;
  business_id: string;
  invoice_number: string;
  customer_id: string | null;
  cashier_id: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: "paid" | "pending" | "cancelled";
  amount_paid: number;
  change_amount: number;
  notes: string | null;
  sale_date: string;
  created_at: string;
  updated_at: string;
  customers?: { id: string; name: string } | null;
  users?: { id: string; full_name: string } | null;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  business_id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  discount: number;
  subtotal: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  business_id: string;
  purchase_number: string;
  supplier_id: string | null;
  created_by: string | null;
  total_amount: number;
  status: "received" | "pending" | "cancelled";
  notes: string | null;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  suppliers?: { id: string; name: string } | null;
  purchase_items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  business_id: string;
  purchase_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  products?: { id: string; name: string; sku: string } | null;
  users?: { id: string; full_name: string } | null;
}

export interface Expense {
  id: string;
  business_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  reference_type: "sale" | "purchase" | "expense";
  reference_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes: string | null;
  created_at: string;
}
