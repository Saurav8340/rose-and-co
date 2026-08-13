import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/journal';
import { breadcrumbSchema } from '@/lib/schemas';
import { SITE } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: 'Journal — notes on construction, fit, and dark fashion',
  description: 'Notes from the dark side. Construction, fit, and subculture history — no fluff. From Rosé & Co, Gurugram.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Journal | Rosé & Co',
    description: 'Notes from the dark side. No fluff.',
    url: `${SITE.url}/journal`,
    type: 'website',
  },
};

export default function JournalIndex() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Journal', url: '/journal' },
      ])} />

      <section className="container-x py-12 md:py-16 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.3em] text-crimson">The Journal</div>
        <h1 className="font-display text-4xl md:text-5xl text-ivory mt-3">
          Notes from the dark side.
        </h1>
        <p className="mt-4 text-ivory/70 max-w-2xl leading-relaxed">
          What we learned building a small-batch alt-fashion brand out of Gurugram &mdash; construction details we obsess over, styling that actually works, honest comparisons of what else exists.
        </p>

        <div className="mt-12 space-y-8">
          {posts.length === 0 ? (
            <p className="text-ivory/60">No posts yet.</p>
          ) : posts.map((post, idx) => (
            <article key={post.slug} className="border-b border-taupe/20 pb-8">
              <Link href={`/journal/${post.slug}`} prefetch={idx < 3} className="block group">
                <div className="grid md:grid-cols-3 gap-6">
                  {post.cover && (
                    <div className="relative aspect-[4/3] bg-blush/20 md:col-span-1">
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        className="object-cover"
                        quality={75}
                      />
                    </div>
                  )}
                  <div className={post.cover ? 'md:col-span-2' : 'md:col-span-3'}>
                    <div className="text-xs uppercase tracking-widest text-ivory/60">
                      {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {post.readingTime}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-ivory mt-2 group-hover:text-crimson transition">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-ivory/70 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 text-xs uppercase tracking-widest text-crimson">Read &rarr;</div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}



