'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
  clear: () => void;
};

const Ctx = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rc_wishlist');
      if (saved) setIds(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('rc_wishlist', JSON.stringify(ids));
  }, [ids]);

  const toggle = (id: string) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const has = (id: string) => ids.includes(id);
  const clear = () => setIds([]);

  return <Ctx.Provider value={{ ids, toggle, has, count: ids.length, clear }}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}




