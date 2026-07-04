'use client';

import { useEffect, useState } from 'react';

interface Props {
  price: number;
  compareAt?: number | null;
  onBuy?: () => void;
  onBuyClick?: () => void;
  productName?: string;
}

export default function StickyBuyBar({ price, compareAt, onBuy, onBuyClick, productName }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show immediately on mobile — no scroll requirement
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShow(true);
      return;
    }

    // On desktop, only show after scrolling
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  const handleClick = () => {
    if (onBuy) onBuy();
    else if (onBuyClick) onBuyClick();
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-ivory border-t border-taupe/20 shadow-2xl z-40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {productName && (
            <div className="text-xs text-espresso/70 truncate">{productName}</div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-wine">Rs {price.toLocaleString('en-IN')}</span>
            {compareAt && (
              <span className="text-xs line-through text-espresso/40">
                Rs {compareAt.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleClick}
          className="bg-wine text-ivory px-6 py-3 uppercase tracking-widest text-xs font-medium hover:bg-espresso transition flex-shrink-0"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
