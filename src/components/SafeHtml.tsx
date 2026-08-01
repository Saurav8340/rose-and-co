// SafeHtml.tsx — drop-in replacement for raw dangerouslySetInnerHTML.
// Sanitizes HTML with DOMPurify so CMS/user/markdown content can't inject scripts.
//
// SETUP (one time):
//   npm i isomorphic-dompurify
//
// USE: replace this pattern
//     <div dangerouslySetInnerHTML={{ __html: post.body }} />
// with
//     <SafeHtml html={post.body} className="prose" />
//
// Where to apply (from your audit): faq/page.tsx, journal/[slug]/page.tsx,
// AnnouncementBar.tsx, InteractiveSizeChart.tsx.
//
// NOTE: You do NOT need this for JsonLd.tsx — JSON-LD is a trusted, server-built
// object and DOMPurify would strip it. Leave JsonLd.tsx as-is.

import DOMPurify from "isomorphic-dompurify";

type Props = {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // default "div"
};

export default function SafeHtml({ html, className, as: Tag = "div" }: Props) {
  const clean = DOMPurify.sanitize(html ?? "", {
    // allow normal rich text + links/images; block scripts, iframes, event handlers
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "span", "div",
      "a", "ul", "ol", "li", "blockquote", "code", "pre", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel", "width", "height"],
    ALLOW_DATA_ATTR: false,
  });
  // Force safe rel on any target=_blank links that survive sanitization
  const hardened = clean.replace(
    /<a\b([^>]*?)target=["']_blank["']([^>]*?)>/gi,
    (m, a, b) => (/\brel=/.test(m) ? m : `<a${a}target="_blank"${b} rel="noopener noreferrer">`)
  );
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: hardened }} />;
}
