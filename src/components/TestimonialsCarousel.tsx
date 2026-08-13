'use client';
import { useEffect, useRef, useState } from 'react';
import { REVIEWS, daysAgoText } from '@/lib/reviews';

export default function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(true); // default true — auto-rotate works
  // even before the observer reports back, instead of silently waiting forever
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = REVIEWS.slice(0, 6);

  // Only auto-rotate when the carousel is actually on screen. Lowered
  // threshold + added rootMargin so it triggers reliably instead of
  // requiring a large chunk of the section to be visible first.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setIdx(i => (i + 1) % visible.length), 6000);
    return () => clearInterval(t);
  }, [inView, visible.length]);

  const stars = (n: number) => '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);

  const goTo = (i: number) => setIdx(((i % visible.length) + visible.length) % visible.length);

  return (
    <div className="relative max-w-2xl mx-auto" ref={containerRef}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {visible.map((r, i) => (
            <div key={i} className="min-w-full px-4">
              <div className="text-crimson text-center text-lg tracking-widest">{stars(r.rating)}</div>
              <p className="mt-4 text-lg text-ivory italic text-center leading-relaxed max-w-xl mx-auto">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-6 text-center">
                <div className="text-sm text-ivory font-semibold">{r.name}</div>
                <div className="text-[11px] text-ivory/60 mt-0.5">
                  {r.city} &middot; Size {r.size} &middot; {r.occasion} &middot; {daysAgoText(r.daysAgo)}
                </div>
                <div className="text-[10px] text-ivory/40 uppercase tracking-widest mt-2">Verified order</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual prev/next — a reliable fallback so navigation never depends
          solely on auto-rotate timing or the IntersectionObserver firing. */}
      {visible.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(idx - 1)}
            aria-label="Previous review"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 w-8 h-8 flex items-center justify-center rounded-full bg-blush border border-taupe/40 text-ivory hover:border-wine transition cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(idx + 1)}
            aria-label="Next review"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 w-8 h-8 flex items-center justify-center rounded-full bg-blush border border-taupe/40 text-ivory hover:border-wine transition cursor-pointer"
          >
            ›
          </button>
        </>
      )}

      <div className="flex justify-center gap-2 mt-6">
        {visible.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show review ${i + 1}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${i === idx ? 'bg-wine w-8' : 'bg-taupe/50 w-2 hover:bg-taupe/70'}`}
          />
        ))}
      </div>
    </div>
  );
}



