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
 * - 1:1 pointer tracking that respects where you grabbed (§2)
 * - setPointerCapture so tracking continues off-element (§2)
 * - velocity captured from a short pointer-history (§2, §5)
 * - momentum projection: a flick throws to where it's going, then snaps (§6)
 * - velocity handoff into the spring — no seam between drag and settle (§5)
 * - fully interruptible: grab a moving slide and reverse it any time (§3)
 * - rubber-band at the first/last image instead of a hard stop (§9)
 * - reduced-motion aware (§14)
 * Transform is written straight to the DOM node each frame (no React re-render
 * per frame) and only `transform` is animated — compositor-friendly (§11).
 */
export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const safeImages = images.length > 0 ? images : ['/products/amara-front.webp'];
  const n = safeImages.length;

  const [active, setActive] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const width = useRef(0);
  const offset = useRef(0); // current px translate of the strip (0 or negative)
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

  /** Animate to an image index, optionally handing off gesture velocity. */
  const goTo = useCallback(
    (i: number, velocity = 0) => {
      const idx = clamp(i);
      if (idx !== activeRef.current) haptic(8); // snap into a new image (§13)
      activeRef.current = idx;
      setActive(idx);

      const to = -idx * width.current;
      stopSpring.current?.();

      if (prefersReducedMotion()) {
        paint(to);
        return;
      }
      // Bounce ONLY when a real flick carried it here (§4). A tap on a thumbnail
      // (velocity ~0) settles critically damped — no distracting overshoot.
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

  // ---- pointer gesture ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    stopSpring.current?.(); // grab the moving strip mid-flight (§3)
    stopSpring.current = null;
    drag.current = {
      active: true,
      startX: e.clientX,
      startOffset: offset.current, // start from the LIVE value, respect the grab (§2,3)
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
    // Progressive resistance past the ends instead of a hard wall (§9).
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

    // Velocity from the recent pointer history (px/s), not a single delta (§5).
    const hist = d.hist;
    const last = hist[hist.length - 1];
    let vel = 0;
    for (let i = hist.length - 2; i >= 0; i--) {
      const dt = last.t - hist[i].t;
      if (dt > 0) {
        vel = ((last.x - hist[i].x) / dt) * 1000;
        if (dt > 30) break; // ~last 30–50ms is the meaningful window
      }
    }

    // Project where the throw lands, then snap to the nearest image (§6).
    const projected = offset.current + project(vel);
    const target = clamp(Math.round(-projected / width.current));
    goTo(target, vel); // hand the velocity to the spring (§5)
  };

  // keyboard a11y
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
        style={{ touchAction: 'pan-y' }} // horizontal handled by us, vertical scrolls the page
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} images`}
        tabIndex={0}
      >
        <div
          ref={trackRef}
          className="flex h-full w-full will-change-transform"
          style={{ transform: 'translate3d(0,0,0)' }}
        >
          {safeImages.map((img, i) => (
            <div key={img} className="relative flex-none w-full h-full">
              <Image
                src={img}
                alt={i === 0 ? name : `${name} view ${i + 1}`}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : 'low'}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover pointer-events-none"
                draggable={false}
                quality={85}
              />
            </div>
          ))}
        </div>

        {/* Slide counter */}
        {n > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-espresso/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-ivory backdrop-blur-sm">
            {active + 1} / {n}
          </div>
        )}

        {/* Dots — hint current position, tap to jump */}
        {n > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {safeImages.map((img, i) => (
              <button
                key={`dot-${img}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
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
          {safeImages.map((img, i) => (
            <button
              key={img}
              type="button"
              onPointerDown={() => haptic(6)}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-lg bg-blush/20 border-2 transition active:scale-[0.96] ${
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
