import { REVIEWS, daysAgoText } from '@/lib/reviews';
import { SITE } from '@/lib/constants';

export default function CustomerPhotos() {
  const featured = REVIEWS.slice(0, 6);

  return (
    <section className="container-x py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-[0.3em] text-wine">From actual orders</div>
        <h2 className="font-display text-3xl md:text-4xl mt-3 text-espresso">What they wrote back</h2>
        <p className="mt-3 text-sm text-espresso/70">
          Emails and DMs after wearing the set, lightly trimmed. Photos coming as buyers tag us.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {featured.map((r, i) => (
          <div key={i} className="p-6 bg-white border border-taupe/20 flex flex-col">
            <div className="text-wine text-sm tracking-widest">
              {"\u2605".repeat(r.rating)}{"\u2606".repeat(5 - r.rating)}
            </div>
            <p className="mt-3 text-espresso italic leading-relaxed text-sm flex-1">
              &ldquo;{r.text}&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-taupe/20">
              <div className="text-sm font-semibold text-espresso">{r.name}</div>
              <div className="text-[11px] text-espresso/60 mt-0.5">
                {r.city} &middot; Size {r.size} &middot; {r.occasion}
              </div>
              <div className="text-[10px] text-espresso/40 uppercase tracking-widest mt-2">
                Verified order &middot; {daysAgoText(r.daysAgo)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <p className="text-xs text-espresso/60">
          Wore yours somewhere? Tag <a href={SITE.instagram} target="_blank" rel="noopener" className="underline text-wine">@roseandco</a>. We&apos;ll ask before adding your photo here.
        </p>
      </div>
    </section>
  );
}
