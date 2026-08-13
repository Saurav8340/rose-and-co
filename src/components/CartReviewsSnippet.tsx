import { REVIEWS } from '@/lib/reviews';

export default function CartReviewsSnippet() {
  // Take 3 short reviews for the cart
  const shortReviews = REVIEWS
    .filter(r => r.text.length < 180)
    .slice(0, 3);

  return (
    <div className="mt-6 p-4 bg-blush/40 border border-taupe/20 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-crimson text-xs">★★★★★</div>
        <div className="text-xs uppercase tracking-widest text-ivory/70">4.8 from {REVIEWS.length} verified buyers</div>
      </div>
      <ul className="space-y-3">
        {shortReviews.map((r, i) => (
          <li key={i} className="text-xs text-ivory/80 leading-relaxed">
            &ldquo;{r.text}&rdquo;
            <div className="text-[10px] text-ivory/50 mt-1">- {r.name}, {r.city}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}



