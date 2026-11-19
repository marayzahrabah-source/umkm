import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderCode(): string {
  const now = new Date();
  const datePart = `${now.getFullYear().toString().slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SB-${datePart}-${randomPart}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildWhatsAppOrderLink(
  storeWhatsapp: string,
  order: {
    orderCode: string;
    customerName: string;
    deliveryMethod: string;
    orderDate: string;
    totalAmount: number;
    items: { name: string; variant?: string | null; quantity: number; subtotal: number }[];
  }
): string {
  const cleanPhone = storeWhatsapp.replace(/\D/g, "");
  const phone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;

  const itemLines = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}${item.variant ? ` (${item.variant})` : ""} x${
          item.quantity
        } = ${formatRupiah(item.subtotal)}`
    )
    .join("\n");

  const message = `Halo Sweet Bakery! Saya ingin mengonfirmasi pesanan saya:\n\n*Kode Pesanan:* ${
    order.orderCode
  }\n*Nama:* ${order.customerName}\n*Pengiriman:* ${
    order.deliveryMethod
  }\n*Tanggal:* ${order.orderDate}\n\n*Detail Pesanan:*\n${itemLines}\n\n*Total:* ${formatRupiah(
    order.totalAmount
  )}\n\nTerima kasih!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const formatIDR = formatRupiah;

export function formatDateID(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeID(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateInvoiceNumber(prefix = "INV"): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}
