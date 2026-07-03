'use client';

const KEY = 'rc_recently_viewed';
const MAX = 6;

export type ViewedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
};

export function addRecentlyViewed(p: Omit<ViewedProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyViewed().filter(x => x.slug !== p.slug);
    const next = [{ ...p, viewedAt: Date.now() }, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewed(): ViewedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
