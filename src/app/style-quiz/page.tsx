'use client';
import { useState } from 'react';
import Link from 'next/link';

type Answers = { occasion: string; style: string; body: string };

function recommendOutfit(a: Answers): string {
  if (a.occasion === 'engagement') {
    if (a.style === 'modern') return 'Amara satin co-ord in wine/rose tones. Small gold hoops. Wine block heels.';
    return 'Traditional Anarkali with light embroidery in muted tones. Cotton silk.';
  }
  if (a.occasion === 'cocktail') {
    if (a.style === 'bold') return 'Fitted bodycon dress + statement heels. Or Amara set + bold lip.';
    return 'Silk slip dress + oversized blazer. Nude heels.';
  }
  if (a.occasion === 'brunch') {
    return 'Amara top with jeans + white sneakers. Small hoops.';
  }
  return 'Amara satin co-ord + block heels + small hoops. Works for most Indian occasions.';
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
      <div className="text-xs uppercase tracking-[0.3em] text-wine">Style quiz</div>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">What should you wear?</h1>
      <p className="mt-3 text-sm text-espresso/70">3 questions. 30 seconds.</p>

      <div className="mt-10">
        {step === 0 && (
          <div>
            <div className="font-display text-2xl text-espresso mb-4">What&apos;s the occasion?</div>
            <div className="space-y-2">
              {[
                { v: 'engagement', l: 'Engagement, roka, or family function' },
                { v: 'cocktail', l: 'Cocktail party or evening event' },
                { v: 'brunch', l: 'Brunch, coffee, or casual meetup' },
                { v: 'other', l: 'Something else' },
              ].map(o => (
                <button key={o.v} onClick={() => set('occasion', o.v)} className="w-full p-4 border border-taupe/40 text-left hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="font-display text-2xl text-espresso mb-4">Your style?</div>
            <div className="space-y-2">
              {[
                { v: 'modern', l: 'Modern and contemporary' },
                { v: 'traditional', l: 'Classic and traditional' },
                { v: 'bold', l: 'Bold and statement' },
                { v: 'minimal', l: 'Minimal and quiet' },
              ].map(o => (
                <button key={o.v} onClick={() => set('style', o.v)} className="w-full p-4 border border-taupe/40 text-left hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="font-display text-2xl text-espresso mb-4">Comfort priority?</div>
            <div className="space-y-2">
              {[
                { v: 'yes', l: 'Yes, I want to be comfortable' },
                { v: 'medium', l: 'Balance of looks and comfort' },
                { v: 'looks', l: 'Looks first, comfort second' },
              ].map(o => (
                <button key={o.v} onClick={() => set('body', o.v)} className="w-full p-4 border border-taupe/40 text-left hover:border-wine hover:bg-blush/20 transition">
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-xs uppercase tracking-widest text-wine">We think you should wear</div>
            <div className="mt-3 p-6 bg-blush/30 border-l-4 border-wine text-lg text-espresso italic">
              {recommendOutfit(answers)}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={reset} className="btn-secondary">Redo</button>
              <Link href="/product/amara-marble-swirl-coord-set" className="btn-primary">See the Amara</Link>
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="mt-6 text-xs text-espresso/60">Step {step + 1} of 3</div>
        )}
      </div>
    </div>
  );
}
