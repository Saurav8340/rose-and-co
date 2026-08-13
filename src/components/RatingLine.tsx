'use client';
import { REVIEWS } from '@/lib/reviews';

export default function RatingLine() {
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  const avgText = avg.toFixed(1);

  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-crimson">★★★★★</span>
      <span className="text-xs text-ivory/60">{avgText} from {REVIEWS.length} verified orders</span>
    </div>
  );
}



