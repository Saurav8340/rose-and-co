'use client';
import { useEffect, useRef, useState } from 'react';
import { REVIEWS, daysAgoText } from '@/lib/reviews';

export default function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = REVIEWS.slice(0, 6);

  // Only auto-rotate when the carousel is actually on screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setIdx(i => (i + 1) % visible.length), 6000);
    return () => clearInterval(t);
  }, [inView, visible.length]);

  const stars = (n: number) => '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);

  return (
    <div className="relative max-w-2xl mx-auto" ref={containerRef}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {visible.map((r, i) => (
            <div key={i} className="min-w-full px-4">
              <div className="text-wine text-center text-lg tracking-widest">{stars(r.rating)}</div>
              <p className="mt-4 text-lg text-espresso italic text-center leading-relaxed max-w-xl mx-auto">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-6 text-center">
                <div className="text-sm text-espresso font-semibold">{r.name}</div>
                <div className="text-[11px] text-espresso/60 mt-0.5">
                  {r.city} &middot; Size {r.size} &middot; {r.occasion} &middot; {daysAgoText(r.daysAgo)}
                </div>
                <div className="text-[10px] text-espresso/40 uppercase tracking-widest mt-2">Verified order</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {visible.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show review ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === idx ? 'bg-wine w-8' : 'bg-taupe/40 w-2'}`}
          />
        ))}
      </div>
    </div>
  );
}
