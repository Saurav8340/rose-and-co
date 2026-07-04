'use client';

import { useState } from 'react';

const SIZE_TABLE = [
  { size: 'XS', bust: '32', waist: '25', hip: '35', height: '5\'0\" - 5\'4\"' },
  { size: 'S',  bust: '34', waist: '27', hip: '37', height: '5\'1\" - 5\'5\"' },
  { size: 'M',  bust: '36', waist: '29', hip: '39', height: '5\'2\" - 5\'6\"' },
  { size: 'L',  bust: '38', waist: '31', hip: '41', height: '5\'3\" - 5\'7\"' },
  { size: 'XL', bust: '40', waist: '33', hip: '43', height: '5\'4\" - 5\'8\"' },
];

export default function SizeGuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs underline text-espresso hover:text-wine transition"
        aria-label="Open size guide"
      >
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-ivory max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-wine">Fit guide</div>
                  <h2 className="font-display text-2xl md:text-3xl text-espresso mt-1">
                    Find your size.
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="text-espresso/50 hover:text-espresso text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-espresso/70 mb-6 leading-relaxed">
                Sizing is true to what you already own from Zara or H&amp;M. When in doubt, we recommend
                going down for the top and up for the skirt — satin does not stretch.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-taupe/30 text-left">
                      <th className="py-2 pr-4">Size</th>
                      <th className="py-2 pr-4">Bust (in)</th>
                      <th className="py-2 pr-4">Waist (in)</th>
                      <th className="py-2 pr-4">Hip (in)</th>
                      <th className="py-2">Model height</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_TABLE.map((row) => (
                      <tr key={row.size} className="border-b border-taupe/10">
                        <td className="py-3 pr-4 font-medium">{row.size}</td>
                        <td className="py-3 pr-4">{row.bust}</td>
                        <td className="py-3 pr-4">{row.waist}</td>
                        <td className="py-3 pr-4">{row.hip}</td>
                        <td className="py-3 text-xs text-espresso/70">{row.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-taupe/20 text-xs text-espresso/70 space-y-2">
                <p><strong>How to measure:</strong> Use a soft measuring tape. Keep it snug, not tight.</p>
                <p><strong>Bust:</strong> around the fullest part.</p>
                <p><strong>Waist:</strong> narrowest point, above the belly button.</p>
                <p><strong>Hip:</strong> around the fullest part of your hips.</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs text-espresso/60">Still unsure?</span>
                <a
                  href="https://wa.me/919999999999?text=Hi%20Ros%C3%A9%20%26%20Co%2C%20I%20need%20help%20choosing%20my%20size."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-wine"
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
