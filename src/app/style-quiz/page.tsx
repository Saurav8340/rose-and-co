'use client';
import { useState } from 'react';
import Link from 'next/link';

type Answers = { occasion: string; style: string; body: string };

function recommendOutfit(a: Answers): string {
  if (a.occasion === 'concert') {
    if (a.style === 'bold') return 'Boned corset + plaid bottoms + platform boots. Layer chains over it.';
    return 'Mesh layer under a fitted top + black bottoms + boots.';
  }
  if (a.occasion === 'night-out') {
    if (a.style === 'bold') return 'Harness over a fitted top + bondage pants + hardware boots.';
    return 'Corset top + plaid skirt + fishnet stockings.';
  }
  if (a.occasion === 'daily') {
    return 'Mesh layer under an oversized top + jersey bottoms + chain belt.';
  }
  return 'Corset top + plaid bottoms + hardware boots. Works for most nights.';
}

export default function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ occasion: '', style: '', body: '' });

  const set = (key: keyof Answers, value: string) => {
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };
  const reset = () => { setAnswers({ occasion: '', style: '', body: '' }); setStep(0); };

  return (
    <div className="container-x py-16 max-w-2xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Style quiz</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">What should you wear?</h1>
      <p className="mt-3 text-sm text-ivory/70">3 questions. 30 seconds.</p>

      <div className="mt-10">
        {step === 0 && (
          <div>
            <div className="font-display text-2xl text-ivory mb-4">What&apos;s the occasion?</div>
            <div className="space-y-2">
              {[
                { v: 'concert', l: 'Concert or underground night' },
                { v: 'night-out', l: 'Night out, club, or party' },
                { v: 'daily', l: 'Daily wear or college' },
                { v: 'other', l: 'Something else' },
              ].map(o => (
                <button key={o.v} onClick={() => set('occasion', o.v)} className="w-full p-4 border border-taupe/40 text-left text-ivory hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="font-display text-2xl text-ivory mb-4">Your style?</div>
            <div className="space-y-2">
              {[
                { v: 'bold', l: 'Bold and statement' },
                { v: 'raw', l: 'Raw and unbothered' },
                { v: 'minimal', l: 'Minimal and quiet' },
                { v: 'layered', l: 'Layered and stacked' },
              ].map(o => (
                <button key={o.v} onClick={() => set('style', o.v)} className="w-full p-4 border border-taupe/40 text-left text-ivory hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="font-display text-2xl text-ivory mb-4">Comfort priority?</div>
            <div className="space-y-2">
              {[
                { v: 'yes', l: 'Yes, I want to be comfortable' },
                { v: 'medium', l: 'Balance of looks and comfort' },
                { v: 'looks', l: 'Looks first, comfort second' },
              ].map(o => (
                <button key={o.v} onClick={() => set('body', o.v)} className="w-full p-4 border border-taupe/40 text-left text-ivory hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-xs uppercase tracking-widest text-crimson">We think you should wear</div>
            <div className="mt-3 p-6 bg-blush/30 border-l-4 border-wine text-lg text-ivory italic">
              {recommendOutfit(answers)}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={reset} className="btn-secondary">Redo</button>
              <Link href="/shop" className="btn-primary">See the drop</Link>
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="mt-6 text-xs text-ivory/60">Step {step + 1} of 3</div>
        )}
      </div>
    </div>
  );
}




