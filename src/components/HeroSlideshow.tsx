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
      {slides.map((slide, i) => {
        const firstName = slide.name.split(' ')[0];
        const discount = slide.mrp > slide.price
          ? Math.round(((slide.mrp - slide.price) / slide.mrp) * 100)
          : 0;
        return (
          <div
            key={slide.slug}
            className={`transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            aria-hidden={i === index ? undefined : true}
          >
            <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
              {/* Copy */}
              <div className="order-2 md:order-1">
                <p className="text-xs uppercase tracking-[0.3em] text-wine mb-4">
                  {slide.tagline}
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-espresso leading-[1.05] whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-espresso/80 leading-relaxed mt-5 max-w-md">
                  {slide.sub}
                </p>

                <div className="flex items-baseline gap-3 mt-6">
                  <span className="text-2xl text-wine font-medium">{inr(slide.price)}</span>
                  {slide.mrp > slide.price && (
                    <>
                      <span className="text-lg text-espresso/40 line-through">{inr(slide.mrp)}</span>
                      {discount > 0 && (
                        <span className="text-xs uppercase tracking-widest bg-wine text-ivory px-2 py-1">
                          {discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Link href={`/product/${slide.slug}`} className="btn-primary" prefetch>
                    Shop the {firstName}
                  </Link>
                  <Link href="/shop" className="btn-secondary">
                    See the collection
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 md:order-2 relative aspect-[3/4] w-full">
                <Image
                  src={slide.hero}
                  alt={slide.name}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top rounded-lg"
                />
              </div>
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