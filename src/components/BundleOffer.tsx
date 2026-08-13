import Link from 'next/link';
import Image from 'next/image';

interface BundleOfferProps {
  currentSlug: string;
  otherSlug: string;
  otherName: string;
  otherImage: string;
  otherPrice: number;
  bundlePrice: number;
  savings: number;
}

export default function BundleOffer({
  currentSlug, otherSlug, otherName, otherImage, otherPrice, bundlePrice, savings,
}: BundleOfferProps) {
  return (
    <section className="container-x py-12 border-t border-taupe/10">
      <div className="max-w-4xl mx-auto bg-blush/40 p-6 md:p-10 rounded-lg">
        <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-2">Weekend set</div>
        <h2 className="font-display text-2xl md:text-3xl text-ivory mb-2">
          Take both. Save Rs {savings.toLocaleString('en-IN')}.
        </h2>
        <p className="text-sm text-ivory/70 mb-6 max-w-md">
          Two moods, two pieces, one bundle. Because we know which one you also love.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Link
            href={`/product/${otherSlug}`}
            prefetch
            className="group flex items-center gap-4 p-4 bg-blush hover:shadow-md transition rounded-lg"
          >
            <div className="relative w-20 h-24 bg-blush/20 flex-shrink-0 overflow-hidden rounded">
              <Image src={otherImage} alt={otherName} fill sizes="80px" className="object-cover object-top" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ivory/60">Add</div>
              <h3 className="font-display text-lg text-ivory group-hover:text-crimson transition">{otherName}</h3>
              <div className="text-sm text-crimson mt-1">Rs {otherPrice.toLocaleString('en-IN')}</div>
            </div>
          </Link>

          <div className="p-4 bg-blush border border-wine/30 flex flex-col justify-between rounded-lg">
            <div>
              <div className="text-xs uppercase tracking-widest text-crimson">Bundle price</div>
              <div className="text-2xl font-semibold text-crimson mt-1">
                Rs {bundlePrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-crimson/80 font-medium mt-1">
                You save Rs {savings.toLocaleString('en-IN')}
              </div>
            </div>
            <button className="mt-3 w-full bg-wine text-ivory py-2 uppercase tracking-widest text-xs hover:bg-wine/90 rc-glow-btn transition cursor-pointer rounded">
              Add both to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}




