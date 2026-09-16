import { apiFetch, buildQuery } from '@/lib/api-client';
import type {
  AppUser,
  Brand,
  Category,
  Commission,
  CommissionSummary,
  Order,
  OrderStatus,
  Paginated,
  Payment,
  Product,
  ProductStatus,
  PublicVendor,
  SiteSettings,
  UserStatus,
  VendorStatus,
} from '@/types';

export async function listUsers(params: { q?: string; role?: string; status?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<AppUser>>(`/admin/users${buildQuery(params as Record<string, unknown>)}`);
}

export async function getUserById(id: string) {
  const data = await apiFetch<{ user: AppUser }>(`/admin/users/${id}`);
  return data.user;
}

export async function setUserStatus(id: string, status: UserStatus) {
  const data = await apiFetch<{ user: AppUser }>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.user;
}

export async function listVendorsAdmin(params: { q?: string; status?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<PublicVendor>>(`/admin/vendors${buildQuery(params as Record<string, unknown>)}`);
}

export async function setVendorStatus(id: string, status: VendorStatus) {
  const data = await apiFetch<{ vendor: PublicVendor }>(`/admin/vendors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.vendor;
}

export async function listCategoriesAdmin(params: { q?: string; status?: string; parent?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Category>>(`/admin/categories${buildQuery(params as Record<string, unknown>)}`);
}

export async function createCategory(input: CategoryInput) {
  const data = await apiFetch<{ category: Category }>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const data = await apiFetch<{ category: Category }>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.category;
}

export async function deleteCategory(id: string) {
  await apiFetch<null>(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function setCategoryStatus(id: string, status: 'active' | 'inactive') {
  const data = await apiFetch<{ category: Category }>(`/admin/categories/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.category;
}

export async function listBrandsAdmin(params: { q?: string; status?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Brand>>(`/admin/brands${buildQuery(params as Record<string, unknown>)}`);
}

export async function createBrand(input: BrandInput) {
  const data = await apiFetch<{ brand: Brand }>('/admin/brands', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.brand;
}

export async function updateBrand(id: string, input: Partial<BrandInput>) {
  const data = await apiFetch<{ brand: Brand }>(`/admin/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.brand;
}

export async function deleteBrand(id: string) {
  await apiFetch<null>(`/admin/brands/${id}`, { method: 'DELETE' });
}

export async function setBrandStatus(id: string, status: 'active' | 'inactive') {
  const data = await apiFetch<{ brand: Brand }>(`/admin/brands/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.brand;
}

export async function listProductsAdmin(params: { q?: string; status?: string; vendor?: string; category?: string; brand?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Product>>(`/admin/products${buildQuery(params as Record<string, unknown>)}`);
}

export async function setProductStatus(id: string, status: ProductStatus) {
  const data = await apiFetch<{ product: Product }>(`/admin/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.product;
}

export async function listOrdersAdmin(params: { status?: OrderStatus; customer?: string; vendor?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Order>>(`/admin/orders${buildQuery(params as Record<string, unknown>)}`);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const data = await apiFetch<{ order: Order }>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.order;
}

export async function listCommissions(params: { status?: string; vendor?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Commission>>(`/admin/commissions${buildQuery(params as Record<string, unknown>)}`);
}

export async function getCommissionSummary() {
  const data = await apiFetch<{ summary: CommissionSummary }>('/admin/commissions/summary');
  return data.summary;
}

export async function listPaymentsAdmin(params: { page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Payment>>(`/admin/payments${buildQuery(params as Record<string, unknown>)}`);
}

export async function getSettings() {
  const data = await apiFetch<{ settings: SiteSettings }>('/admin/settings');
  return data.settings;
}

export async function updateSettings(input: { commissionRate: number }) {
  const data = await apiFetch<{ settings: SiteSettings }>('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.settings;
}

export interface CategoryInput {
  name: { en: string; ar?: string };
  slug?: string;
  parent?: string | null;
  icon?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export interface BrandInput {
  name: { en: string; ar?: string };
  slug?: string;
  logo?: string;
  status?: 'active' | 'inactive';
}