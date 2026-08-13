'use client';

import { useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

// Same data as InteractiveSizeChart.tsx — unified so the modal and the
// standalone /size-guide page never show conflicting numbers again.
const CHART = [
  { size: 'XS',  bust: 81,  waist: 61, hip: 86,  length: 75, matches: 'Zara XS, H&amp;M XS, Fabindia S' },
  { size: 'S',   bust: 86,  waist: 66, hip: 91,  length: 75, matches: 'Zara S, H&amp;M S, Global Desi S' },
  { size: 'M',   bust: 91,  waist: 71, hip: 97,  length: 76, matches: 'Zara M, H&amp;M M, Vero Moda M' },
  { size: 'L',   bust: 97,  waist: 76, hip: 102, length: 76, matches: 'Zara L, H&amp;M L, Only L' },
  { size: 'XL',  bust: 102, waist: 81, hip: 107, length: 77, matches: 'Zara XL, H&amp;M L-XL' },
  { size: 'XXL', bust: 107, waist: 86, hip: 112, length: 77, matches: 'Zara XXL, H&amp;M XL' },
];

export default function SizeGuideModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>('M');
  const current = CHART.find((s) => s.size === selected)!;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs underline text-ivory hover:text-crimson transition cursor-pointer"
        aria-label="Open size guide"
      >
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-espresso/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-blush max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg border border-taupe/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-crimson">Fit guide</div>
                  <h2 className="font-display text-2xl md:text-3xl text-ivory mt-1">
                    Find your size.
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="text-ivory/50 hover:text-ivory text-2xl leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-ivory/70 mb-6 leading-relaxed">
                Sizing is true to what you already own from Zara or H&amp;M. Tap a size below to see
                exact measurements. Mesh and jersey pieces have some give &mdash; corsets and
                hardware-based pieces do not.
              </p>

              {/* Interactive size selector — this is the piece the old modal
                  never had. Tapping a size updates the measurement panel
                  below it, same behavior as the standalone size guide page. */}
              <div className="grid grid-cols-6 gap-2 mb-5">
                {CHART.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelected(s.size)}
                    className={`py-2 text-xs uppercase tracking-widest border rounded transition cursor-pointer ${
                      selected === s.size
                        ? 'bg-wine text-ivory border-wine'
                        : 'bg-blush/60 text-ivory border-taupe/40 hover:border-wine'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-blush/40 border border-taupe/20 rounded-lg">
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
                  <div
                    className="text-sm text-ivory/80 mt-1"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.matches) }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-taupe/20 text-xs text-ivory/70 space-y-2">
                <p><strong className="text-ivory">How to measure:</strong> Use a soft measuring tape. Keep it snug, not tight.</p>
                <p><strong className="text-ivory">Bust:</strong> around the fullest part.</p>
                <p><strong className="text-ivory">Waist:</strong> narrowest point, above the belly button.</p>
                <p><strong className="text-ivory">Hip:</strong> around the fullest part of your hips.</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs text-ivory/60">Still unsure?</span>
                <a
                  href="https://wa.me/919999999999?text=Hi%20Ros%C3%A9%20%26%20Co%2C%20I%20need%20help%20choosing%20my%20size."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-crimson hover:text-ivory transition"
                >
                  Ask us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



