import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const { sessionId, ...rest } = data;

    if (!sessionId) {
      return NextResponse.json({ ok: true, note: 'no sessionId, ignored' });
    }

    // Only pass known fields to Prisma to avoid errors
    const allowed: any = {};
    const fields = [
      'name', 'phone', 'email',
      'city', 'region', 'country', 'timezone', 'language',
      'deviceType', 'screenWidth', 'screenHeight', 'userAgent',
      'landingUrl', 'referrer',
      'utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent',
      'visitCount', 'isReturning', 'hasAddress', 'timeOnSite', 'pagesViewed', 'scrolled',
      'optedIn', 'chipDismissed', 'couponCode', 'couponPct', 'segment',
      'cartAdded', 'cartValue', 'cartSummary', 'cartAbandoned',
      'orderNumber', 'converted',
      'status', 'notes',
    ];
    for (const f of fields) {
      if (rest[f] !== undefined) allowed[f] = rest[f];
    }

    await prisma.lead.upsert({
      where: { sessionId },
      update: allowed,
      create: { sessionId, ...allowed },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[leads/create] error:', err?.message || err);
    // Silent failure — do not block user experience
    return NextResponse.json({ ok: true, error: 'internal' });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'POST to log a lead' });
}
