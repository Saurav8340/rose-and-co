import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const { sessionId, ...rest } = data;

    if (!sessionId) {
      return NextResponse.json({ ok: true });
    }

    const allowed: any = {};
    const fields = [
      'name', 'phone', 'email',
      'city', 'region', 'country', 'timezone', 'language',
      'pincode', 'state', 'addressLine1',
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
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
