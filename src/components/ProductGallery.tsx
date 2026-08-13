'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  animateSpring,
  project,
  rubberband,
  prefersReducedMotion,
  haptic,
} from '@/lib/motion';

/**
 * Fluid, gesture-driven product gallery.
 * (Original drag/spring/momentum system fully preserved.)
 *
 * FIX (PageSpeed Insights): the video in this gallery was measured
 * downloading its FULL file size TWICE before the customer even pressed
 * play — once from the main slide's <video> tag, and again from an
 * identical <video> tag in the thumbnail row, both using
 * preload="metadata". Raw video exports (e.g. straight off Instagram)
 * often store their metadata at the END of the file rather than the
 * front ("fast-start"), so a browser trying to read just the duration
 * ends up pulling the entire file to find it — and it was doing this
 * TWICE, once per <video> element pointing at the same URL.
 *
 * Fixed two ways:
 * 1. Thumbnails no longer render a real <video> element at all — just a
 *    static dark placeholder with a play icon. Zero network request.
 * 2. The main track only mounts a real <video> element for the
 *    CURRENTLY ACTIVE slide (conditional render, not just CSS-hidden).
 *    A video sitting later in the gallery (as videos always do here,
 *    appended after all photos) now costs nothing on initial page load
 *    — the browser only fetches it once the customer actually swipes
 *    or clicks to that slide. preload="none" reinforces this: even once
 *    mounted, the browser won't fetch anything until the customer
 *    presses play.
 */

type Media = { type: 'image' | 'video'; src: string };

export default function ProductGallery({
  images,
  name,
  videos = [],
}: {
  images: string[];
  name: string;
  videos?: string[];
}) {
  const safeImages = images.length > 0 ? images : ['/products/amara-front.webp'];

  const media: Media[] = [
    ...safeImages.map((src) => ({ type: 'image' as const, src })),
    ...videos.map((src) => ({ type: 'video' as const, src })),
  ];
  const n = media.length;

  const [active, setActive] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const width = useRef(0);
  const offset = useRef(0);
  const activeRef = useRef(0);
  const stopSpring = useRef<null | (() => void)>(null);

  const drag = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
    hist: [] as { t: number; x: number }[],
  });

  const clamp = (i: number) => Math.max(0, Math.min(n - 1, i));

  const paint = useCallback((px: number) => {
    offset.current = px;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${px}px,0,0)`;
    }
  }, []);

  const measure = useCallback(() => {
    if (!viewportRef.current) return;
    width.current = viewportRef.current.clientWidth;
    paint(-activeRef.current * width.current);
  }, [paint]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => {
      ro.disconnect();
      stopSpring.current?.();
    };
  }, [measure]);

  const goTo = useCallback(
    (i: number, velocity = 0) => {
      const idx = clamp(i);
      if (idx !== activeRef.current) haptic(8);
      activeRef.current = idx;
      setActive(idx);

      const to = -idx * width.current;
      stopSpring.current?.();

      if (prefersReducedMotion()) {
        paint(to);
        return;
      }
      const damping = Math.abs(velocity) > 60 ? 0.82 : 1.0;
      stopSpring.current = animateSpring(offset.current, to, {
        damping,
        response: 0.4,
        velocity,
        onUpdate: paint,
      });
    },
    [n, paint],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    if ((e.target as HTMLElement).closest('video')) return;

    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    stopSpring.current?.();
    stopSpring.current = null;
    drag.current = {
      active: true,
      startX: e.clientX,
      startOffset: offset.current,
      hist: [{ t: performance.now(), x: e.clientX }],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    let next = d.startOffset + dx;

    const min = -(n - 1) * width.current;
    const max = 0;
    if (next > max) next = rubberband(next - max, width.current);
    else if (next < min) next = min + rubberband(next - min, width.current);

    paint(next);

    d.hist.push({ t: performance.now(), x: e.clientX });
    if (d.hist.length > 6) d.hist.shift();
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;

    const hist = d.hist;
    const last = hist[hist.length - 1];
    let vel = 0;
    for (let i = hist.length - 2; i >= 0; i--) {
      const dt = last.t - hist[i].t;
      if (dt > 0) {
        vel = ((last.x - hist[i].x) / dt) * 1000;
        if (dt > 30) break;
      }
    }

    const projected = offset.current + project(vel);
    const target = clamp(Math.round(-projected / width.current));
    goTo(target, vel);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeRef.current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeRef.current - 1); }
  };

  return (
    <div className="space-y-3">
      {/* Main viewport */}
      <div
        ref={viewportRef}
        className="relative aspect-[3/4] bg-blush/20 overflow-hidden select-none rounded-2xl"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} media`}
        tabIndex={0}
      >
        <div
          ref={trackRef}
          className="flex h-full w-full will-change-transform"
          style={{ transform: 'translate3d(0,0,0)' }}
        >
          {media.map((m, i) => (
            <div key={`${m.type}-${m.src}`} className="relative flex-none w-full h-full">
              {m.type === 'image' ? (
                <Image
                  src={m.src}
                  alt={i === 0 ? name : `${name} view ${i + 1}`}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover pointer-events-none"
                  draggable={false}
                  quality={85}
                />
              ) : i === active ? (
                // Only the ACTIVE slide gets a real <video> element.
                // preload="none" means the browser fetches nothing at
                // all until the customer presses play — not even on
                // mount.
                <video
                  src={m.src}
                  className="w-full h-full object-cover bg-black"
                  controls
                  playsInline
                  preload="none"
                  aria-label={`${name} video`}
                />
              ) : (
                // Not yet visited — plain placeholder, zero network cost.
                <div className="w-full h-full bg-black" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {n > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-espresso/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-ivory backdrop-blur-sm">
            {active + 1} / {n}
          </div>
        )}

        {n > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {media.map((m, i) => (
              <button
                key={`dot-${m.type}-${m.src}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${m.type === 'video' ? 'video' : `image ${i + 1}`}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 bg-ivory' : 'w-1.5 bg-ivory/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {n > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {media.map((m, i) => (
            <button
              key={`thumb-${m.type}-${m.src}`}
              type="button"
              onPointerDown={() => haptic(6)}
              onClick={() => goTo(i)}
              aria-label={m.type === 'video' ? 'View video' : `View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-lg bg-blush/20 border-2 transition active:scale-[0.96] ${
                i === active ? 'border-wine' : 'border-transparent hover:border-taupe/40'
              }`}
            >
              {m.type === 'image' ? (
                <Image
                  src={m.src}
                  alt={`${name} view ${i + 1}`}
                  fill
                  sizes="80px"
                  loading="lazy"
                  className="object-cover"
                  quality={60}
                />
              ) : (
                // FIX: no <video> element here at all anymore — this used
                // to be a second <video src=... preload="metadata"> that
                // silently triggered its own full-file download alongside
                // the main slide's copy. A static placeholder with a play
                // icon costs zero bytes and still communicates clearly
                // that this thumbnail is a video.
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-espresso/60 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 0.5L9 5L1 9.5V0.5Z" fill="white" />
                    </svg>
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
