import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  // isLoading ONLY means cart is syncing — never blocks product rendering
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const { isAuthenticated, apiFetch } = useAuth();
  const productsLoaded = useRef(false);
  const cartSyncScheduled = useRef(false);

  // Track in-flight requests to prevent duplicates
  const pendingRequests = useRef<Map<string, Promise<void>>>(new Map());

  // Load products once for cart enrichment (background, doesn't block anything)
  useEffect(() => {
    if (productsLoaded.current) return;
    productsLoaded.current = true;
    fetch(`${API_URL}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then(list => setAllProducts(list))
      .catch(() => {});
  }, []);

  // Sync cart in the background when auth state changes
  // Never blocks product rendering — runs after paint
  useEffect(() => {
    if (isAuthenticated) {
      // Defer cart load so it never delays the product render
      if (!cartSyncScheduled.current) {
        cartSyncScheduled.current = true;
        // Use setTimeout(0) to push cart fetch after current render cycle
        const timer = setTimeout(() => {
          syncCartWithDb().finally(() => {
            cartSyncScheduled.current = false;
          });
        }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      setCart([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const syncCartWithDb = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Use apiFetch — it handles 401 + token refresh automatically
      const res = await apiFetch('/api/cart');

      if (res.ok) {
        const rawItems: Array<{ productId: string; qty: number }> = await res.json();

        // Use cached products if available, else fetch in background
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
      // If cart returns non-ok (including 401 after retry failed), just silently give up
      // apiFetch already handles refresh + retry internally — if still 401, user is logged out
    } catch (err) {
      // Network error — silently fail, cart stays empty/stale
      console.error('[Cart] Sync failed (background):', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, apiFetch, allProducts]);

  const addToCart = useCallback(async (product: Product, qty: number = 1) => {
    const key = `add-${product.id}`;
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    const existing = cart.find(item => item.productId === product.id);
    const newQty = existing ? existing.qty + qty : qty;

    // Optimistic update — apply immediately
    setCart(prev => {
      const updated = [...prev];
      const match = updated.find(i => i.productId === product.id);
      if (match) {
        match.qty = newQty;
        return [...updated];
      } else {
        return [...updated, { productId: product.id, qty, product }];
      }
    });

    if (isAuthenticated) {
      const request = apiFetch(`/api/cart/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      })
        .then(async (res) => {
          if (!res.ok) {
            console.error('[Cart] addToCart API failed, rolling back');
            await syncCartWithDb();
          }
          syncCartWithDb().catch(() => {});
        })
        .catch(async (err) => {
          console.error('[Cart] addToCart failed:', err);
          await syncCartWithDb();
        })
        .finally(() => {
          pendingRequests.current.delete(key);
        });

      pendingRequests.current.set(key, request);
      return request;
    }
    // Guest: optimistic update already applied
  }, [cart, isAuthenticated, apiFetch, syncCartWithDb]);

  const updateCartQty = useCallback(async (productId: string, qty: number) => {
    if (qty <= 0) {
      return removeFromCart(productId);
    }

    setCart(prev =>
      prev.map(item => item.productId === productId ? { ...item, qty } : item)
    );

    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty }),
        });
        if (!res.ok) await syncCartWithDb();
      } catch (err) {
        console.error('[Cart] updateQty failed:', err);
        await syncCartWithDb();
      }
    }
  }, [isAuthenticated, apiFetch, syncCartWithDb]);

  const removeFromCart = useCallback(async (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));

    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, { method: 'DELETE' });
        if (!res.ok) await syncCartWithDb();
      } catch (err) {
        console.error('[Cart] remove failed:', err);
        await syncCartWithDb();
      }
    }
  }, [isAuthenticated, apiFetch, syncCartWithDb]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (isAuthenticated) {
      try {
        await apiFetch('/api/cart', { method: 'DELETE' });
      } catch (err) {
        console.error('[Cart] clear failed:', err);
      }
    }
  }, [isAuthenticated, apiFetch]);

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
