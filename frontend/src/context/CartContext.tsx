import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import API_URL from '../api';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartWeight: number;
  isLoading: boolean;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  updateCartQty: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartWithDb: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const { isAuthenticated, apiFetch } = useAuth();
  const productsLoaded = useRef(false);

  // Load products once
  useEffect(() => {
    if (productsLoaded.current) return;
    productsLoaded.current = true;
    fetch(`${API_URL}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then(list => setAllProducts(list))
      .catch(() => {});
  }, []);

  // Sync cart when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      syncCartWithDb();
    } else {
      setCart([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const syncCartWithDb = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/cart');
      if (res.ok) {
        const rawItems: Array<{ productId: string; qty: number }> = await res.json();
        // Fetch latest products if we don't have them yet
        let products = allProducts;
        if (products.length === 0) {
          try {
            const pr = await fetch(`${API_URL}/api/products`);
            if (pr.ok) {
              products = await pr.json();
              setAllProducts(products);
            }
          } catch {}
        }
        const enriched: CartItem[] = rawItems
          .map(item => ({
            productId: item.productId,
            qty: item.qty,
            product: products.find(p => p.id === item.productId),
          }))
          .filter(item => item.product !== undefined);
        setCart(enriched);
      }
    } catch (err) {
      console.error('[Cart] Sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, qty: number = 1) => {
    const existing = cart.find(item => item.productId === product.id);
    const newQty = existing ? existing.qty + qty : qty;

    if (isAuthenticated) {
      try {
        await apiFetch(`/api/cart/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: newQty }),
        });
        await syncCartWithDb();
      } catch (err) {
        console.error('[Cart] addToCart failed:', err);
      }
    } else {
      setCart(prev => {
        const updated = [...prev];
        const match = updated.find(i => i.productId === product.id);
        if (match) {
          match.qty = newQty;
        } else {
          updated.push({ productId: product.id, qty, product });
        }
        return updated;
      });
    }
  };

  const updateCartQty = async (productId: string, qty: number) => {
    if (qty <= 0) {
      return removeFromCart(productId);
    }
    if (isAuthenticated) {
      try {
        await apiFetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty }),
        });
        await syncCartWithDb();
      } catch (err) {
        console.error('[Cart] updateQty failed:', err);
      }
    } else {
      setCart(prev =>
        prev.map(item => item.productId === productId ? { ...item, qty } : item)
      );
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await apiFetch(`/api/cart/${productId}`, { method: 'DELETE' });
        await syncCartWithDb();
      } catch (err) {
        console.error('[Cart] remove failed:', err);
      }
    } else {
      setCart(prev => prev.filter(item => item.productId !== productId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        // Use DELETE /api/cart to clear all items
        await apiFetch('/api/cart', { method: 'DELETE' });
        setCart([]);
      } catch (err) {
        console.error('[Cart] clear failed:', err);
      }
    } else {
      setCart([]);
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => {
    const price = i.product?.discountPrice ?? i.product?.price ?? 0;
    return s + price * i.qty;
  }, 0);
  const cartWeight = cart.reduce((s, i) => {
    return s + (i.product?.weight ?? 250) * i.qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        cartWeight,
        isLoading,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        syncCartWithDb,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
