'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ['/products/amara-front.png'];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] bg-blush/20 overflow-hidden">
        <Image
          key={safeImages[active]}
          src={safeImages[active]}
          alt={name}
          fill
          priority={active === 0}
          fetchPriority={active === 0 ? 'high' : 'low'}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          quality={85}
        />
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square bg-blush/20 border-2 transition ${
                i === active ? 'border-wine' : 'border-transparent hover:border-taupe/40'
              }`}
            >
              <Image
                src={img}
                alt={`${name} view ${i + 1}`}
                fill
                sizes="80px"
                loading="lazy"
                className="object-cover"
                quality={60}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
