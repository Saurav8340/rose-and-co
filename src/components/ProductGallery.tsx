'use client';
import { useState } from 'react';
import Image from 'next/image';
import { clsx } from '@/lib/format';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={clsx('shrink-0 w-16 h-20 md:w-20 md:h-24 relative border', i === active ? 'border-wine' : 'border-taupe/30')}
          >
            <Image src={img} alt={`${name} view ${i+1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative flex-1 aspect-[3/4] bg-blush/20 overflow-hidden cursor-zoom-in select-none"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className={clsx('object-cover transition-transform duration-200', zoom && 'scale-[1.8]')}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        />
      </div>
    </div>
  );
}
