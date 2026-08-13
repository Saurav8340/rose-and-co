// src/app/manifest.ts
// Replaces the old static public/manifest.json.
// This is a Next.js dynamic manifest — same pattern as sitemap.ts. It
// re-generates on each request, so the description line below always
// reflects whatever is actually live in your product catalog, with zero
// manual edits needed after uploading/removing products in admin.
//
// NOTE: The app icon itself is intentionally NOT tied to a specific
// product. Once someone adds your site to their home screen, that icon
// should stay stable — it's your brand mark, not a rotating product photo.
// Put your logo file at /public/brand/icon-512.png and icon-192.png once
// you have one (I can generate one for you if you want).

import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/lib/constants';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const activeCount = await prisma.product.count({ where: { active: true } });

  const description =
    activeCount > 0
      ? `Corsets, mesh, and chain-detailed pieces built with real hardware. ${activeCount} piece${activeCount === 1 ? '' : 's'} live now. Small batch, no restock.`
      : 'Corsets, mesh, and chain-detailed pieces built with real hardware. Small batch, no restock.';

  return {
    name: `${SITE.name} - Alt Fashion, Small Batch Drops`,
    short_name: SITE.name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#8B0000',
    orientation: 'portrait',
    icons: [
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
