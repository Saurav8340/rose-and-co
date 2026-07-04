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
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative bg-blush/40 overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.slug}
          className={`transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-wine mb-4">{slide.tagline}</div>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-espresso whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="mt-6 text-lg text-espresso/70 max-w-md leading-relaxed">{slide.sub}</p>

              <div className="mt-8 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-wine">{inr(slide.price)}</span>
                <span className="text-base line-through text-espresso/40">{inr(slide.mrp)}</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Link href={`/product/${slide.slug}`} prefetch className="btn-primary">
                  Shop the {slide.name.split(' ')[0]}
                </Link>
                <Link href={`/product/${slide.slug}`} prefetch className="text-sm underline text-espresso">
                  See the set
                </Link>
              </div>
            </div>

            <div className="relative aspect-[3/4] md:aspect-[4/5] max-w-lg mx-auto w-full">
              <Image
                src={slide.hero}
                alt={slide.name}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1 rounded-full transition-all ${
                i === index ? 'bg-wine w-8' : 'bg-espresso/30 w-4'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
