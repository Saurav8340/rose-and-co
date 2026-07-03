import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/journal';
import { breadcrumbSchema } from '@/lib/schemas';
import { SITE } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal — guides on fabric, styling, and Indian D2C fashion',
  description: 'Honest guides on satin fabric, styling co-ord sets, and how small-batch Indian brands make things. From Rosé & Co, Gurugram.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Journal | Rosé & Co',
    description: 'Guides on satin, styling, and Indian D2C fashion.',
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
        <div className="text-xs uppercase tracking-[0.3em] text-wine">The Journal</div>
        <h1 className="font-display text-4xl md:text-5xl text-espresso mt-3">
          Notes on fabric, fit, and Indian D2C fashion.
        </h1>
        <p className="mt-4 text-espresso/70 max-w-2xl leading-relaxed">
          What we learned building a small-batch co-ord brand out of Gurugram — fabric details we obsess over, styling that actually works, honest comparisons of what else exists.
        </p>

        <div className="mt-12 space-y-8">
          {posts.length === 0 ? (
            <p className="text-espresso/60">No posts yet.</p>
          ) : posts.map(post => (
            <article key={post.slug} className="border-b border-taupe/20 pb-8">
              <Link href={`/journal/${post.slug}`} className="block group">
                <div className="grid md:grid-cols-3 gap-6">
                  {post.cover && (
                    <div className="relative aspect-[4/3] bg-blush/20 md:col-span-1">
                      <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    </div>
                  )}
                  <div className={post.cover ? 'md:col-span-2' : 'md:col-span-3'}>
                    <div className="text-xs uppercase tracking-widest text-espresso/60">
                      {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readingTime}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-espresso mt-2 group-hover:text-wine transition">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-espresso/70 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 text-xs uppercase tracking-widest text-wine">Read →</div>
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
