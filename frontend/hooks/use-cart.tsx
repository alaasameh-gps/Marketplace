'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Cart } from '@/types';
import * as cartService from '@/services/cart';
import { useAuth } from '@/hooks/use-auth';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isCustomer) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartService.getCart());
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    setCart(await cartService.addCartItem(productId, quantity));
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setCart(await cartService.updateCartItem(itemId, quantity));
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setCart(await cartService.removeCartItem(itemId));
  }, []);

  const clear = useCallback(async () => {
    setCart(await cartService.clearCart());
  }, []);

  const itemCount = cart?.itemCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, refreshCart, addItem, updateItem, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}