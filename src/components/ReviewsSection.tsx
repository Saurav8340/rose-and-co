'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  name: string;
  city?: string;
  title: string;
  body: string;
  photos: string[];
  size?: string;
  verified: boolean;
  createdAt: string;
}

interface Props {
  productSlug: string;
}

export default function ReviewsSection({ productSlug }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews/list?product=${productSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          if (data.reviews.length > 0) {
            const avg = data.reviews.reduce((s: number, r: Review) => s + r.rating, 0) / data.reviews.length;
            setAvgRating(avg);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return null;

  const displayed = showAll ? reviews : reviews.slice(0, 3);
  const withPhotos = reviews.filter((r) => r.photos && r.photos.length > 0);

  return (
    <section className="container-x py-16 border-t border-taupe/20" aria-labelledby="reviews-heading">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-wine">What they said</div>
            <h2 id="reviews-heading" className="font-display text-3xl md:text-4xl mt-2 text-ivory">
              {reviews.length} verified reviews
            </h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="flex text-wine">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} aria-hidden="true">
                    {n <= Math.round(avgRating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-lg font-semibold text-ivory">{avgRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-ivory/70 mt-1">
              Based on {reviews.length} verified {reviews.length === 1 ? 'buyer' : 'buyers'}
            </div>
          </div>
        </div>

        {/* Photo strip */}
        {withPhotos.length > 0 && (
          <div className="mb-8">
            <div className="text-xs uppercase tracking-widest text-ivory/70 mb-3">
              Photos from buyers
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {withPhotos.slice(0, 6).flatMap((r) => r.photos.slice(0, 1)).map((src, i) => (
                <div key={i} className="relative aspect-square bg-blush/20 overflow-hidden rounded">
                  <Image src={src} alt={`Customer photo ${i + 1}`} fill sizes="150px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div className="space-y-6">
          {displayed.map((r) => (
            <div key={r.id} className="border-b border-taupe/10 pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-wine text-sm">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} aria-hidden="true">{n <= r.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    {r.verified && (
                      <span className="text-xs bg-wine/15 text-wine border border-wine/30 px-2 py-0.5 rounded">
                        ✓ Verified purchase
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-ivory mt-2">{r.title}</h3>
                </div>
                <div className="text-xs text-ivory/60 text-right">
                  <div>{r.name}</div>
                  {r.city && <div>{r.city}</div>}
                  {r.size && <div className="mt-1">Size: {r.size}</div>}
                </div>
              </div>
              <p className="text-sm text-ivory/80 leading-relaxed">{r.body}</p>
              {r.photos && r.photos.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {r.photos.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 bg-blush/20 overflow-hidden rounded">
                      <Image src={src} alt={`Review photo ${i + 1}`} fill sizes="80px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-ivory/50 mt-2">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12 text-ivory/60 bg-blush/20 rounded-lg">
            <p className="mb-2">Be the first to review this piece.</p>
            <p className="text-xs">We send review requests via WhatsApp seven days after delivery.</p>
          </div>
        )}

        {reviews.length > 3 && !showAll && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm underline text-wine hover:text-ivory cursor-pointer transition"
            >
              Read all {reviews.length} reviews
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
