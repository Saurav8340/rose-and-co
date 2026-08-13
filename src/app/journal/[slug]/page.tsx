import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/journal';
import { articleSchema, breadcrumbSchema } from '@/lib/schemas';
import { SITE } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}/journal/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      images: post.cover ? [{ url: `${SITE.url}${post.cover}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function JournalPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={[
        articleSchema({ slug: post.slug, title: post.title, excerpt: post.excerpt, date: post.date, coverImage: post.cover }),
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/journal' },
          { name: post.title, url: `/journal/${post.slug}` },
        ]),
      ]} />

      <article className="container-x py-10 md:py-16 max-w-3xl">
        <nav className="text-xs uppercase tracking-widest text-ivory/60 mb-6">
          <Link href="/">Home</Link> / <Link href="/journal">Journal</Link>
        </nav>

        <div className="text-xs uppercase tracking-widest text-ivory/60">
          {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {post.readingTime}
        </div>
        <h1 className="font-display text-3xl md:text-5xl text-ivory mt-3 leading-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-ivory/70 leading-relaxed">{post.excerpt}</p>

        {post.cover && (
          <div className="mt-8 relative aspect-[16/9] bg-blush/20">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              quality={85}
            />
          </div>
        )}

        <div className="mt-10 max-w-none journal-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.html) }} />

        <div className="mt-16 pt-8 border-t border-taupe/20">
          <div className="p-6 bg-blush/30 border border-taupe/20">
            <div className="text-xs uppercase tracking-[0.3em] text-crimson">New drop</div>
            <h3 className="font-display text-2xl text-ivory mt-2">Join the coven</h3>
            <p className="mt-2 text-sm text-ivory/70">
              Small pieces, real hardware. Once it&apos;s gone, it&apos;s gone.
            </p>
            <Link href="/shop" prefetch className="btn-primary mt-4">See the drop &rarr;</Link>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/journal" className="text-xs uppercase tracking-widest text-crimson underline">&larr; Back to Journal</Link>
        </div>
      </article>
    </>
  );
}


