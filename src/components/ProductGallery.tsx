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
 * (Original drag/spring/momentum system fully preserved — see inline
 * comments below for the fluid-motion notes, unchanged from before.)
 *
 * NEW: now also accepts an optional `videos` prop. Videos are appended
 * after all photos as additional slides in the same swipeable strip, each
 * rendered as a native <video> with controls instead of an <Image>.
 *
 * One deliberate exception to the drag system: when a pointer-down starts
 * ON the video element itself (e.g. tapping its native play/pause/scrub
 * controls), we skip starting a swipe-drag entirely and let the browser's
 * native video controls handle that interaction normally. Swiping to/from
 * a video slide still works fine via the thumbnails, dots, or dragging
 * from anywhere OUTSIDE the video's own control area.
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

  // Combined slide list: all photos first, then any videos appended after.
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

  // ---- pointer gesture ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (n < 2) return;

    // NEW: if the gesture starts on a <video> element (tapping its native
    // controls), don't hijack it into a swipe-drag — let the browser
    // handle play/pause/scrub normally. Swiping away from a video slide
    // still works via thumbnails/dots, or by starting the drag from
    // outside the video element (e.g. the space above/below it).
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
              ) : (
                <video
                  src={m.src}
                  className="w-full h-full object-cover bg-black"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${name} video`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Slide counter */}
        {n > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-espresso/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-ivory backdrop-blur-sm">
            {active + 1} / {n}
          </div>
        )}

        {/* Dots */}
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
                <>
                  <video
                    src={m.src}
                    className="w-full h-full object-cover bg-black"
                    muted
                    preload="metadata"
                  />
                  {/* Play icon overlay so a video thumbnail reads clearly
                      as a video, not just a static frame. */}
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-6 rounded-full bg-espresso/60 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 0.5L9 5L1 9.5V0.5Z" fill="white" />
                      </svg>
                    </span>
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}




