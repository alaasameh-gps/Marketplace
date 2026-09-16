import { apiFetch } from '@/lib/api-client';
import type { Cart } from '@/types';

export async function getCart() {
  const data = await apiFetch<{ cart: Cart }>('/cart');
  return data.cart;
}

export async function addCartItem(productId: string, quantity = 1) {
  const data = await apiFetch<{ cart: Cart }>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product: productId, quantity }),
  });
  return data.cart;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const data = await apiFetch<{ cart: Cart }>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
  return data.cart;
}

export async function removeCartItem(itemId: string) {
  const data = await apiFetch<{ cart: Cart }>(`/cart/items/${itemId}`, { method: 'DELETE' });
  return data.cart;
}

export async function clearCart() {
  const data = await apiFetch<{ cart: Cart }>('/cart', { method: 'DELETE' });
  return data.cart;
}