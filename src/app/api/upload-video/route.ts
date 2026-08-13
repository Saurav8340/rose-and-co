// src/app/api/upload-video/route.ts
// NEW FILE. Unlike /api/upload (images), this does NOT receive the actual
// video file through this route — video files are too large to pass
// through a Vercel serverless function's request body (capped around
// 4.5MB by default; even a short clip usually exceeds that).
//
// Instead this route only ISSUES A SECURE UPLOAD TOKEN. The admin's
// browser then uploads the video FILE DIRECTLY to Vercel Blob storage
// using that token — the video bytes never pass through this server at
// all, so there's no size limit problem. See ProductForm.tsx for the
// client-side half of this (the `upload()` call).
//
// Requires: `npm install @vercel/blob`, a Blob store created in the
// Vercel dashboard (Storage tab), and BLOB_READ_WRITE_TOKEN pulled into
// your local .env.local via `npx vercel env pull .env.local`.

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB cap per video

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Same admin check as the image upload route — only a logged-in
        // admin can request an upload token at all.
        if (!(await isAdmin())) {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Fires after the browser finishes uploading directly to Blob.
        // Nothing to do here for now — the client already gets the final
        // blob.url back directly from the upload() call and adds it to
        // the product's videos list itself.
        console.log('Video uploaded to Blob:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message || 'Could not authorize video upload.' },
      { status: 400 }
    );
  }
}
