import { apiFetch, buildQuery } from '@/lib/api-client';
import { serverApi } from '@/lib/server-api';
import type { Brand, Category, Paginated, Product } from '@/types';

export interface ListProductsParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export async function listProducts(params: ListProductsParams = {}) {
  return apiFetch<Paginated<Product>>(`/products${buildQuery(params as Record<string, unknown>)}`);
}

export async function getProductBySlug(slug: string) {
  const data = await apiFetch<{ product: Product }>(`/products/${slug}`);
  return data.product;
}

export async function listCategories() {
  const data = await apiFetch<{ items: Category[] }>('/categories');
  return data.items;
}

export async function listBrands(params: { q?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Brand>>(`/brands${buildQuery(params as Record<string, unknown>)}`);
}

export async function listVendors(params: { q?: string; page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<PublicVendor>>(`/vendors${buildQuery(params as Record<string, unknown>)}`);
}

export async function getVendorBySlug(slug: string) {
  const data = await apiFetch<{ vendor: PublicVendor }>(`/vendors/${slug}`);
  return data.vendor;
}

export async function listVendorProducts(slug: string, params: { page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Product> & { vendor: PublicVendor }>(
    `/vendors/${slug}/products${buildQuery(params as Record<string, unknown>)}`,
  );
}

export async function serverListProducts(params: ListProductsParams = {}) {
  return serverApi<Paginated<Product>>(`/products${buildQuery(params as Record<string, unknown>)}`);
}

export async function serverGetProductBySlug(slug: string) {
  const data = await serverApi<{ product: Product }>(`/products/${slug}`);
  return data.product;
}

export async function serverListCategories() {
  const data = await serverApi<{ items: Category[] }>('/categories');
  return data.items;
}

export async function serverListBrands(params: { q?: string; page?: number; limit?: number } = {}) {
  return serverApi<Paginated<Brand>>(`/brands${buildQuery(params as Record<string, unknown>)}`);
}

export async function serverListVendors(params: { q?: string; page?: number; limit?: number } = {}) {
  return serverApi<Paginated<PublicVendor>>(`/vendors${buildQuery(params as Record<string, unknown>)}`);
}

export async function serverGetVendorBySlug(slug: string) {
  const data = await serverApi<{ vendor: PublicVendor }>(`/vendors/${slug}`);
  return data.vendor;
}

export async function serverListVendorProducts(
  slug: string,
  params: { page?: number; limit?: number } = {},
) {
  return serverApi<Paginated<Product> & { vendor: PublicVendor }>(
    `/vendors/${slug}/products${buildQuery(params as Record<string, unknown>)}`,
  );
}

export type { Product as PublicProduct };
import type { PublicVendor } from '@/types';