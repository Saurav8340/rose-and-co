'use client';
import { clsx } from '@/lib/format';
import { haptic } from '@/lib/motion';

export type SizeOption = { size: string; stock: number };

/**
 * Size selector with fluid press feel:
 * - visual press on active:scale (fires on pointer-down via CSS :active) (§1)
 * - light haptic on a real selection commit (§13)
 * - out-of-stock sizes give a short "nope" buzz so the block is felt, not just seen
 */
export default function SizeSelector({
  sizes,
  value,
  onChange,
}: {
  sizes: SizeOption[];
  value: string | null;
  onChange: (s: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="label !mb-0">Select size</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {sizes.map((s) => {
          const outOfStock = s.stock <= 0;
          const active = value === s.size;
          return (
            <button
              key={s.size}
              type="button"
              disabled={outOfStock}
              onPointerDown={() => haptic(outOfStock ? 20 : 8)}
              onClick={() => {
                if (outOfStock) return;
                onChange(s.size);
              }}
              className={clsx(
                'py-3 text-sm uppercase tracking-widest border rounded-lg relative cursor-pointer',
                'transition-transform duration-100 active:scale-[0.95]',
                active
                  ? 'bg-wine text-ivory border-wine'
                  : outOfStock
                    ? 'bg-blush/30 text-taupe line-through cursor-not-allowed border-taupe/20'
                    : 'bg-blush text-ivory border-taupe/40 hover:border-wine',
              )}
              aria-label={outOfStock ? `Size ${s.size} out of stock` : `Size ${s.size}`}
              aria-pressed={active}
            >
              {s.size}
              {!outOfStock && s.stock <= 3 && !active && (
                <span className="absolute -top-2 -right-1 bg-wine text-ivory text-[8px] px-1 rounded">
                  {s.stock} left
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}



