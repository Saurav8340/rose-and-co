import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  // Vercel provides these headers automatically at the edge
  const city = req.headers.get('x-vercel-ip-city');
  const country = req.headers.get('x-vercel-ip-country');
  const region = req.headers.get('x-vercel-ip-country-region');

  return NextResponse.json({
    city: city ? decodeURIComponent(city) : undefined,
    country: country || undefined,
    region: region || undefined,
  });
}




