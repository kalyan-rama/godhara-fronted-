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
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // never true on mount
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { isAuthenticated, apiFetch } = useAuth();

  // Refs — stable across renders, no re-render side effects
  const productsLoaded  = useRef(false);
  const pendingRequests = useRef<Map<string, Promise<void>>>(new Map());
  // Holds the latest allProducts without adding it to useCallback deps
  const allProductsRef  = useRef<Product[]>([]);

  // Keep ref in sync with state so syncCartWithDb always sees fresh data
  useEffect(() => { allProductsRef.current = allProducts; }, [allProducts]);

  // ─── 1. Products — fire immediately, completely independent of auth ───────
  useEffect(() => {
    if (productsLoaded.current) return;
    productsLoaded.current = true;

    fetch(`${API_URL}/api/products`)
      .then(r => r.ok ? r.json() : [])
      .then((list: Product[]) => setAllProducts(list))
      .catch(() => {/* silent */});
  }, []);

  // ─── 2. Cart sync — 1 000 ms deferred, never blocks products ─────────────
  //
  //  Timeline on page load:
  //    t=0    AuthContext hydrates from localStorage → isAuthenticated = true
  //    t=0    This effect fires, schedules timer
  //    t=0    React paints Hero + product skeletons
  //    t~150  /api/products returns → product cards render
  //    t=1000 Cart sync starts in background (JWT refresh if needed, silent)
  //
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      setIsLoading(false);
      return;
    }

    // 1 000 ms gives products time to fully paint before any cart/auth work
    const timer = setTimeout(() => {
      // Read apiFetch from closure — it's stable (defined once in AuthContext)
      runCartSync(apiFetch, allProductsRef, setCart, setAllProducts, setIsLoading);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // intentionally excludes apiFetch & allProducts

  // ─── syncCartWithDb — stable identity, no allProducts dep ────────────────
  //
  //  Uses allProductsRef instead of allProducts so the function identity never
  //  changes when the product list arrives, preventing the auth effect from
  //  re-firing and scheduling a duplicate cart fetch.
  //
  const syncCartWithDb = useCallback(async () => {
    if (!isAuthenticated) return;
    await runCartSync(apiFetch, allProductsRef, setCart, setAllProducts, setIsLoading);
  }, [isAuthenticated, apiFetch]); // stable: apiFetch is memoised in AuthContext

  // ─── Cart mutations — optimistic, with silent rollback ───────────────────

  const addToCart = useCallback(async (product: Product, qty: number = 1) => {
    const key = `add-${product.id}`;
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    const existing = cart.find(item => item.productId === product.id);
    const newQty   = existing ? existing.qty + qty : qty;

    // Optimistic: show immediately in UI
    setCart(prev => {
      const copy  = [...prev];
      const match = copy.find(i => i.productId === product.id);
      if (match) { match.qty = newQty; return [...copy]; }
      return [...copy, { productId: product.id, qty, product }];
    });

    if (isAuthenticated) {
      const request = apiFetch(`/api/cart/${product.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ qty: newQty }),
      })
        .then(async res => {
          if (!res.ok) await syncCartWithDb();
          else syncCartWithDb().catch(() => {});
        })
        .catch(async () => { await syncCartWithDb(); })
        .finally(() => { pendingRequests.current.delete(key); });

      pendingRequests.current.set(key, request);
      return request;
    }
    // Guest — optimistic already applied above
  }, [cart, isAuthenticated, apiFetch, syncCartWithDb]);

  const updateCartQty = useCallback(async (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);

    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, qty } : item
    ));

    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ qty }),
        });
        if (!res.ok) await syncCartWithDb();
      } catch { await syncCartWithDb(); }
    }
  }, [isAuthenticated, apiFetch, syncCartWithDb]);

  const removeFromCart = useCallback(async (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));

    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, { method: 'DELETE' });
        if (!res.ok) await syncCartWithDb();
      } catch { await syncCartWithDb(); }
    }
  }, [isAuthenticated, apiFetch, syncCartWithDb]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (isAuthenticated) {
      try { await apiFetch('/api/cart', { method: 'DELETE' }); }
      catch (err) { console.error('[Cart] clear failed:', err); }
    }
  }, [isAuthenticated, apiFetch]);

  // ─── Derived values ───────────────────────────────────────────────────────

  const cartCount    = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => {
    const price = i.product?.discountPrice ?? i.product?.price ?? 0;
    return s + price * i.qty;
  }, 0);
  const cartWeight   = cart.reduce((s, i) =>
    s + (i.product?.weight ?? 250) * i.qty, 0
  );

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartSubtotal, cartWeight,
      isLoading, addToCart, updateCartQty,
      removeFromCart, clearCart, syncCartWithDb,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Pure async helper — extracted so it can be called from both the
//     deferred timer and syncCartWithDb without closure coupling ─────────────
async function runCartSync(
  apiFetch:       (url: string, opts?: RequestInit) => Promise<Response>,
  allProductsRef: React.MutableRefObject<Product[]>,
  setCart:        React.Dispatch<React.SetStateAction<CartItem[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsLoading:   React.Dispatch<React.SetStateAction<boolean>>,
) {
  setIsLoading(true);
  try {
    // apiFetch handles 401 → refresh-token → retry internally.
    // If it still fails after retry, it calls logout() in AuthContext and
    // returns the 401 response — we simply skip the cart update silently.
    const res = await apiFetch('/api/cart');
    if (!res.ok) return; // 401 / 403 after refresh attempt — silent, no throw

    const rawItems: Array<{ productId: string; qty: number }> = await res.json();

    // Use cached ref so we don't depend on state closure age
    let products = allProductsRef.current;
    if (products.length === 0) {
      try {
        const pr = await fetch(`${API_URL}/api/products`);
        if (pr.ok) {
          products = await pr.json();
          setAllProducts(products);
          allProductsRef.current = products;
        }
      } catch { /* products stay empty; cart items will be enriched later */ }
    }

    const enriched: CartItem[] = rawItems
      .map(item => ({
        productId: item.productId,
        qty:       item.qty,
        product:   products.find(p => p.id === item.productId),
      }))
      .filter(item => item.product !== undefined);

    setCart(enriched);
  } catch (err) {
    console.error('[Cart] sync failed (background):', err);
    // Do NOT rethrow — background failure must never crash the page
  } finally {
    setIsLoading(false);
  }
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
