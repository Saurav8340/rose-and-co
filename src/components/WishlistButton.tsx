'use client';
import { useWishlist } from './WishlistContext';

export default function WishlistButton({ productId }: { productId: string }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex items-center justify-center w-11 h-11 border transition cursor-pointer ${active ? 'bg-wine border-wine text-ivory' : 'bg-blush border-taupe/40 text-ivory hover:border-wine hover:text-wine'}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    </button>
  );
}
