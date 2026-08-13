'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  update: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const KEY = 'rc_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const add = (item: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.productId === item.productId && p.size === item.size);
      if (idx > -1) {
        const next = [...prev]; next[idx].quantity = Math.min(5, next[idx].quantity + item.quantity); return next;
      }
      return [...prev, item];
    });
  };
  const update = (i: number, qty: number) => setItems(prev => {
    if (qty <= 0) return prev.filter((_, x) => x !== i);
    const next = [...prev]; next[i].quantity = Math.min(5, qty); return next;
  });
  const remove = (i: number) => setItems(prev => prev.filter((_, x) => x !== i));
  const clear = () => setItems([]);

  const count = items.reduce((s, x) => s + x.quantity, 0);
  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);

  return <CartContext.Provider value={{ items, count, total, add, update, remove, clear }}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};




