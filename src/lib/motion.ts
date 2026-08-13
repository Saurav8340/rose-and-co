// src/lib/motion.ts
// Tiny, self-contained fluid-motion toolkit for Rosé & Co.
// Implements Apple's "Designing Fluid Interfaces" primitives on the web:
//  - spring that animates from the LIVE presentation value (interruptible)
//  - velocity handoff (gesture velocity becomes the spring's initial velocity)
//  - momentum projection (project a flick to where it's going)
//  - rubber-banding at boundaries
// No dependencies. ~2KB. Runs on requestAnimationFrame (the web's display clock).

export interface SpringOptions {
  /** Damping ratio. 1.0 = critically damped (no overshoot). <1 bounces. */
  damping?: number;
  /** Response in seconds — how quickly it reaches target. Lower = snappier. NOT a fixed duration. */
  response?: number;
  /** Initial velocity in px/s (hand off the gesture's release velocity here). */
  velocity?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Animate `from` -> `to` with a spring. Returns a stop() function.
 * Always start it from the element's CURRENT on-screen value so an interrupt
 * doesn't jump (§3). Substeps internally for stability at any frame rate.
 */
export function animateSpring(from: number, to: number, opts: SpringOptions): () => void {
  const damping = opts.damping ?? 1;
  const response = opts.response ?? 0.4;
  const omega = (2 * Math.PI) / response;
  const target = to;
  let x = from;
  let v = opts.velocity ?? 0;
  let raf = 0;
  let stopped = false;
  let last = performance.now();

  const restDelta = 0.4; // px
  const restSpeed = 0.4; // px/s

  const tick = (now: number) => {
    if (stopped) return;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 1 / 30) dt = 1 / 30; // clamp big gaps (tab switches)

    // semi-implicit Euler with fixed substeps -> stable & frame-rate independent
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const a = -(omega * omega) * (x - target) - 2 * damping * omega * v;
      v += a * h;
      x += v * h;
    }

    opts.onUpdate(x);

    if (Math.abs(x - target) < restDelta && Math.abs(v) < restSpeed) {
      opts.onUpdate(target); // land exactly
      stopped = true;
      opts.onComplete?.();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}

/**
 * Apple's momentum projection (from the Designing Fluid Interfaces sample code).
 * Returns the distance a flick will travel from its release point.
 * NOT the v²/(2·decel) textbook form — this is the exponential-decay form Apple ships.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
}

/**
 * Progressive resistance past a boundary. The further you drag past the edge,
 * the less the element follows — real things slow before they stop (§9).
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Respect the OS "reduce motion" setting (§14). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/** One-shot haptic on a meaningful commit (§13). No-ops where unsupported. */
export function haptic(ms = 10): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported — silent */
  }
}




