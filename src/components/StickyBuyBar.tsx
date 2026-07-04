'use client';
import { inr } from '@/lib/format';
import { PAYMENT } from '@/lib/constants';

export default function StickyBuyBar({ price, onBuy }: { price: number; onBuy: () => void }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory border-t border-taupe/30 p-3 flex items-center gap-3 shadow-lg">
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest text-espresso/60">Amara Co-ord</div>
        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold text-wine">{inr(price)}</div>
          <div className="text-[11px] line-through text-espresso/40">{inr(PAYMENT.mrp)}</div>
        </div>
      </div>
      <button onClick={onBuy} className="btn-primary flex-1">Buy Now</button>
    </div>
  );
}
