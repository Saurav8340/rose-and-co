'use client';
import { useState } from 'react';
import { sanitizeHtml } from "@/lib/sanitize";

const CHART = [
  { size: 'XS',  bust: 81,  waist: 61, hip: 86,  length: 75, matches: 'Zara XS, H&amp;M XS, Fabindia S' },
  { size: 'S',   bust: 86,  waist: 66, hip: 91,  length: 75, matches: 'Zara S, H&amp;M S, Global Desi S' },
  { size: 'M',   bust: 91,  waist: 71, hip: 97,  length: 76, matches: 'Zara M, H&amp;M M, Vero Moda M' },
  { size: 'L',   bust: 97,  waist: 76, hip: 102, length: 76, matches: 'Zara L, H&amp;M L, Only L' },
  { size: 'XL',  bust: 102, waist: 81, hip: 107, length: 77, matches: 'Zara XL, H&amp;M L-XL' },
  { size: 'XXL', bust: 107, waist: 86, hip: 112, length: 77, matches: 'Zara XXL, H&amp;M XL' },
];

export default function InteractiveSizeChart() {
  const [selected, setSelected] = useState<string>('M');
  const current = CHART.find(s => s.size === selected)!;

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ivory/60 mb-3">Tap a size to see measurements + what it matches in other brands</div>
      <div className="grid grid-cols-6 gap-2">
        {CHART.map(s => (
          <button
            key={s.size}
            onClick={() => setSelected(s.size)}
            className={`py-2 text-xs uppercase tracking-widest border transition ${selected === s.size ? 'bg-wine text-ivory border-wine' : 'bg-blush text-ivory border-taupe/40 hover:border-wine'}`}
          >
            {s.size}
          </button>
        ))}
      </div>
      <div className="mt-5 p-4 bg-blush/40 border border-taupe/20">
        <div className="text-sm uppercase tracking-widest text-ivory mb-3">Size {current.size}</div>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ivory/60">Bust</div>
            <div className="text-lg text-ivory mt-1">{current.bust} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ivory/60">Waist</div>
            <div className="text-lg text-ivory mt-1">{current.waist} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ivory/60">Hip</div>
            <div className="text-lg text-ivory mt-1">{current.hip} cm</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ivory/60">Length</div>
            <div className="text-lg text-ivory mt-1">{current.length} cm</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-taupe/20">
          <div className="text-[10px] uppercase tracking-widest text-ivory/60">Matches</div>
          <div className="text-sm text-ivory/80 mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.matches) }} />
        </div>
        <p className="mt-4 text-xs text-ivory/60">Measured flat, garment size. Add ~2 cm to each for comfortable body-fit. Mesh and jersey pieces have some give &mdash; corsets and hardware-based pieces do not.</p>
      </div>
    </div>
  );
}




