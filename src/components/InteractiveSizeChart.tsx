'use client';
import { useState } from 'react';

const CHART = [
  { size: 'XS',  bust: 81,  waist: 61, hip: 86,  skirt: 75, matches: 'Zara XS, H&amp;M XS, Fabindia S' },
  { size: 'S',   bust: 86,  waist: 66, hip: 91,  skirt: 75, matches: 'Zara S, H&amp;M S, Global Desi S' },
  { size: 'M',   bust: 91,  waist: 71, hip: 97,  skirt: 76, matches: 'Zara M, H&amp;M M, Vero Moda M' },
  { size: 'L',   bust: 97,  waist: 76, hip: 102, skirt: 76, matches: 'Zara L, H&amp;M L, Only L' },
  { size: 'XL',  bust: 102, waist: 81, hip: 107, skirt: 77, matches: 'Zara XL, H&amp;M L-XL' },
  { size: 'XXL', bust: 107, waist: 86, hip: 112, skirt: 77, matches: 'Zara XXL, H&amp;M XL' },
];

export default function InteractiveSizeChart() {
  const [selected, setSelected] = useState<string>('M');
  const current = CHART.find(s => s.size === selected)!;

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-espresso/60 mb-3">Tap a size to see measurements + what it matches in other brands</div>
      <div className="grid grid-cols-6 gap-2">
        {CHART.map(s => (
          <button
            key={s.size}
            onClick={() => setSelected(s.size)}
            className={`py-2 text-xs uppercase tracking-widest border transition ${selected === s.size ? 'bg-wine text-ivory border-wine' : 'bg-white text-espresso border-taupe/40 hover:border-wine'}`}
          >
            {s.size}
          </button>
        ))}
      </div>
      <div className="mt-5 p-4 bg-blush/20 border border-taupe/20">
        <div className="text-sm uppercase tracking-widest text-espresso mb-3">Size {current.size}</div>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-espresso/60">Bust</div>
            <div className="text-lg text-espresso mt-1">{current.bust} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-espresso/60">Waist</div>
            <div className="text-lg text-espresso mt-1">{current.waist} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-espresso/60">Hip</div>
            <div className="text-lg text-espresso mt-1">{current.hip} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-espresso/60">Skirt length</div>
            <div className="text-lg text-espresso mt-1">{current.skirt} cm</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-taupe/20">
          <div className="text-[10px] uppercase tracking-widest text-espresso/60">Matches</div>
          <div className="text-sm text-espresso/80 mt-1" dangerouslySetInnerHTML={{ __html: current.matches }} />
        </div>
        <p className="mt-4 text-xs text-espresso/60">Measured flat, garment size. Add ~2 cm to each for comfortable body-fit. Satin does not stretch.</p>
      </div>
    </div>
  );
}
