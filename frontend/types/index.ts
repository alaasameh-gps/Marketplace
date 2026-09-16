export type Role = 'admin' | 'vendor' | 'customer';
export type UserStatus = 'active' | 'suspended';
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'active' | 'inactive';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type CommissionStatus = 'pending' | 'settled';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalizedText {
  en: string;
  ar?: string;
}

export interface Category {
  _id: string;
  name: LocalizedText;
  slug?: string;
  parent: string | null;
  icon?: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  children?: Category[];
}

export interface Brand {
  _id: string;
  name: LocalizedText;
  slug?: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicVendor {
  _id: string;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  status: VendorStatus;
  commissionRate?: number;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVendorInfo {
  _id: string;
  storeName: string;
  slug: string;
}

export interface ProductCategoryInfo {
  _id: string;
  name?: LocalizedText;
}

export interface ProductBrandInfo {
  _id: string;
  name?: LocalizedText;
}

export interface PublicProduct {
  _id: string;
  name: LocalizedText;
  slug: string;
  description?: LocalizedText;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images?: string[];
  isFeatured?: boolean;
  status?: ProductStatus;
  sku?: string;
  inventory?: { availableStock?: number; reservedStock?: number };
  vendor?: ProductVendorInfo;
  category?: ProductCategoryInfo;
  brand?: ProductBrandInfo;
  createdAt?: string;
}

export type Product = PublicProduct;

export interface CartItemProduct extends PublicProduct {
  vendor?: ProductVendorInfo;
}

export interface CartItem {
  _id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: CartItemProduct | null;
}

export interface CartGroup {
  vendor: { id: string };
  items: CartItem[];
  subtotal: number;
}

export interface Cart {
  groups: CartGroup[];
  subtotal: number;
  itemCount: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  _id?: string;
  product: string;
  productSnapshot: { name: LocalizedText; image?: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderGroup {
  _id: string;
  vendor: string | PublicVendor;
  items: OrderItem[];
  groupSubtotal: number;
  commissionRate: number;
  commissionAmount: number;
  vendorEarnings: number;
  status: OrderStatus;
}

export interface Order {
  _id: string;
  orderNumber: string;
  idempotencyKey?: string;
  customer: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  shippingAddress: ShippingAddress;
  groups: OrderGroup[];
  totals: { subtotal: number; shippingFee: number; tax: number; total: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Commission {
  _id: string;
  order: string | { _id: string; orderNumber: string };
  orderGroupId: string;
  vendor: string | PublicVendor;
  rate: number;
  amount: number;
  commissionAmount?: number;
  vendorEarnings: number;
  status: CommissionStatus;
  settledAt?: string;
  settlementRef?: string;
  createdAt?: string;
}

export interface CommissionSummary {
  totalRecords: number;
  totalCommissionAmount: number;
  totalVendorEarnings: number;
  statusBreakdown: Array<{
    status: CommissionStatus;
    count: number;
    commissionAmount: number;
    vendorEarnings: number;
  }>;
}

export interface Payment {
  _id: string;
  order: string;
  provider: string;
  providerRef: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paidAt?: string;
  refundRef?: string;
  webhookEventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  commissionRate: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}