'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { inr } from '@/lib/format';

interface Slide {
  slug: string;
  name: string;
  hero: string;
  price: number;
  mrp: number;
  tagline: string;
  title: string;
  sub: string;
}

export default function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative bg-blush-depth overflow-hidden">
      {slides.map((slide, i) => {
        const discount = slide.mrp > slide.price
          ? Math.round(((slide.mrp - slide.price) / slide.mrp) * 100)
          : 0;
        // FIX (accessibility bug found via PageSpeed Insights): links
        // inside an aria-hidden, invisible slide were still keyboard-
        // focusable — a sighted keyboard user tabbing through the page
        // could land focus on a link they can't see at all, since the
        // slide is opacity-0 and pointer-events-none. tabIndex={-1} on
        // every interactive element inside a non-active slide removes it
        // from the tab order entirely; only the currently visible slide's
        // links remain reachable by keyboard.
        const isActive = i === index;
        const tabIndex = isActive ? undefined : -1;
        return (
          <div
            key={`${slide.slug}-${i}`}
            className={`transition-opacity duration-700 ${
              isActive ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            aria-hidden={isActive ? undefined : true}
          >
            <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
              {/* Copy */}
              <div className="order-2 md:order-1">
                <p className="text-xs uppercase tracking-[0.3em] text-crimson mb-4">
                  {slide.tagline}
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-ivory leading-[1.05] whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-ivory/80 leading-relaxed mt-5 max-w-md">
                  {slide.sub}
                </p>

                <div className="flex items-baseline gap-3 mt-6">
                  <span className="text-2xl text-crimson font-medium">{inr(slide.price)}</span>
                  {slide.mrp > slide.price && (
                    <>
                      <span className="text-lg text-ivory/40 line-through">{inr(slide.mrp)}</span>
                      {discount > 0 && (
                        <span className="text-xs uppercase tracking-widest bg-wine text-ivory px-2 py-1">
                          {discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Link
                    href={`/product/${slide.slug}`}
                    className="btn-primary rc-glow-btn cursor-pointer"
                    prefetch
                    tabIndex={tabIndex}
                  >
                    Shop this piece
                  </Link>
                  <Link
                    href="/shop"
                    className="btn-secondary cursor-pointer"
                    tabIndex={tabIndex}
                  >
                    See the drop
                  </Link>
                </div>
              </div>

              {/* Image */}
              <Link
                href={`/product/${slide.slug}`}
                prefetch
                aria-label={`View ${slide.name}`}
                tabIndex={tabIndex}
                className="order-1 md:order-2 relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-card ring-1 ring-white/[0.06] block cursor-pointer group"
              >
                <Image
                  src={slide.hero}
                  alt={slide.name}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.35), transparent)' }}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 pb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1 rounded-full transition-all cursor-pointer ${
                i === index ? 'bg-wine w-8' : 'bg-ivory/25 w-4 hover:bg-ivory/40'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}




