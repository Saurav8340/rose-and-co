'use client';
import { clsx } from '@/lib/format';

export type SizeOption = { size: string; stock: number };

export default function SizeSelector({
  sizes, value, onChange,
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
        {sizes.map(s => {
          const outOfStock = s.stock <= 0;
          const active = value === s.size;
          return (
            <button
              key={s.size}
              type="button"
              disabled={outOfStock}
              onClick={() => !outOfStock && onChange(s.size)}
              className={clsx(
                'py-3 text-sm uppercase tracking-widest border transition-all relative',
                active ? 'bg-wine text-ivory border-wine' :
                outOfStock ? 'bg-ivory text-taupe/40 border-taupe/20 line-through cursor-not-allowed' :
                'bg-white text-espresso border-taupe/40 hover:border-wine',
              )}
              aria-label={outOfStock ? `Size ${s.size} out of stock` : `Size ${s.size}`}
            >
              {s.size}
              {!outOfStock && s.stock <= 3 && !active && (
                <span className="absolute -top-2 -right-1 bg-wine text-ivory text-[8px] px-1">{s.stock} left</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
