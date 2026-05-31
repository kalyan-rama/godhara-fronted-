import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartWeight: number; // total weight in grams
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
  const { isAuthenticated, apiFetch } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all products once to map metadata to cart ids easily
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const list = await res.json();
          setAllProducts(list);
        }
      } catch (err) {
        console.error('Error loading products for cart mappings:', err);
      }
    }
    loadProducts();
  }, []);

  // Sync cart from DB on login, or reset when user logs out
  useEffect(() => {
    if (isAuthenticated) {
      syncCartWithDb();
    } else {
      // Offline/Guest session can load from dynamic memory (initialized as empty of unauthenticated items)
      setCart([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, allProducts]);

  const syncCartWithDb = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/cart');
      if (res.ok) {
        const rawItems: Array<{ productId: string; qty: number }> = await res.json();
        // Enrich raw items with product details
        const enriched: CartItem[] = rawItems.map(item => {
          const matchedProd = allProducts.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            qty: item.qty,
            product: matchedProd
          };
        });
        setCart(enriched.filter(item => item.product !== undefined)); // keep only valid mapped products
      }
    } catch (err) {
      console.error('Failed to sync shopping cart with DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, qty: number = 1) => {
    const existing = cart.find(item => item.productId === product.id);
    const newQty = existing ? existing.qty + qty : qty;

    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: newQty }),
        });
        if (res.ok) {
          await syncCartWithDb();
        }
      } catch (err) {
        console.error('Failed to update DB cart state:', err);
      }
    } else {
      // Local addition
      const updatedCart = [...cart];
      if (existing) {
        existing.qty = newQty;
      } else {
        updatedCart.push({ productId: product.id, qty, product });
      }
      setCart(updatedCart);
    }
  };

  const updateCartQty = async (productId: string, qty: number) => {
    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty }),
        });
        if (res.ok) {
          await syncCartWithDb();
        }
      } catch (err) {
        console.error('Failed to change DB cart qty:', err);
      }
    } else {
      let updatedCart = [...cart];
      const match = updatedCart.find(item => item.productId === productId);
      if (match) {
        if (qty > 0) {
          match.qty = qty;
        } else {
          updatedCart = updatedCart.filter(item => item.productId !== productId);
        }
      }
      setCart(updatedCart);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await apiFetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await syncCartWithDb();
        }
      } catch (err) {
        console.error('Failed delete DB cart entry:', err);
      }
    } else {
      setCart(prev => prev.filter(item => item.productId !== productId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        // Clear all
        const res = await apiFetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] }),
        });
        if (res.ok) {
          setCart([]);
        }
      } catch (err) {
        console.error('Failed clear DB state:', err);
      }
    } else {
      setCart([]);
    }
  };

  // derived metrics
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  
  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product?.discountPrice ?? item.product?.price ?? 0;
    return sum + unitPrice * item.qty;
  }, 0);

  const cartWeight = cart.reduce((sum, item) => {
    const unitWeight = item.product?.weight ?? 250; // fallback default grams
    return sum + unitWeight * item.qty;
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
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be called inside a CartProvider wrapper');
  }
  return context;
}
