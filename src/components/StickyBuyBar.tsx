'use client';

import { useEffect, useState } from 'react';
import { haptic } from '@/lib/motion';

interface Props {
  price: number;
  compareAt?: number | null;
  onBuy?: () => void;
  onBuyClick?: () => void;
  productName?: string;
}

/**
 * Sticky buy bar rebuilt for fluid feel:
 * - Press feedback fires on pointer-DOWN, not release, so it never feels laggy (§1)
 * - Haptic on the actual commit — same frame as the visual (§13)
 * - Translucent material so page content shows through underneath (§12),
 *   with a soft scroll-edge fade instead of a hard 1px divider (§12)
 * - Respects the iOS home indicator via safe-area inset
 * - Reduced-transparency users get a solid bar (handled in CSS, §14)
 */
export default function StickyBuyBar({ price, compareAt, onBuy, onBuyClick, productName }: Props) {
  const [show, setShow] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShow(true);
      return;
    }
    const handleScroll = () => setShow(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  const commit = () => {
    haptic(12); // meaningful commit — reserve haptics for moments like this (§13)
    if (onBuy) onBuy();
    else if (onBuyClick) onBuyClick();
  };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 rc-material-bar"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* scroll-edge fade — only where the floating bar overlaps content (§12).
          Fades into the page's near-black background, not the old light theme. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-5 inset-x-0 h-5"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9), rgba(10,10,10,0))' }}
      />
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <div className="min-w-0 flex-1">
          {productName && (
            <div className="text-xs text-ivory/70 truncate">{productName}</div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-wine tabular-nums">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {compareAt && (
              <span className="text-xs line-through text-ivory/40 tabular-nums">
                ₹{compareAt.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <button
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={commit}
          style={{
            transform: pressed ? 'scale(0.96)' : 'scale(1)',
            transition: 'transform 100ms ease-out',
          }}
          className="flex-shrink-0 bg-wine text-ivory px-6 py-3 uppercase tracking-widest text-xs font-medium hover:bg-espresso rounded-xl"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
