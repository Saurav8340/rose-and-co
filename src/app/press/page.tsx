import { SITE } from '@/lib/constants';

export const metadata = { title: 'Press', description: 'Media mentions and press coverage of Rose &amp; Co.' };

export default function PressPage() {
  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.3em] text-crimson">Press</div>
      <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">Mentions and coverage</h1>
      <p className="mt-4 text-ivory/70 leading-relaxed">
        Rosé & Co launched in early 2026. We&apos;re a new brand &mdash; most coverage will come as we grow. This page will be updated.
      </p>

      <div className="mt-12 p-8 bg-blush/30 border border-taupe/20 text-center">
        <h2 className="font-display text-2xl text-ivory mb-3">Press enquiries</h2>
        <p className="text-sm text-ivory/70">Working on a piece about Indian alt fashion? Reach us at:</p>
        <a href={`mailto:${SITE.email}`} className="mt-2 inline-block underline text-crimson">{SITE.email}</a>
        <p className="mt-4 text-xs text-ivory/60">
          Response usually within 4 hours (Gurugram working hours).
        </p>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl text-ivory mb-3">About Rosé & Co</h2>
        <div className="text-ivory/80 leading-relaxed space-y-3 text-sm">
          <p>
            Small-batch alt fashion brand launched in early 2026. Our first drop: corsets, mesh, and chain-detailed pieces built with real hardware.
          </p>
          <p>
            Studio in Sector 47, Gurugram. Production unit near Karol Bagh, Delhi.
          </p>
          <p>
            Founder: Aditi Sharma.
          </p>
        </div>
      </div>
    </div>
  );
}



