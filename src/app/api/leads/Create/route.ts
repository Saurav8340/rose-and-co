import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let sessionId = '';
  try {
    const data = await req.json().catch(() => ({}));
    sessionId = data.sessionId || '';
    const { sessionId: _, ...rest } = data;

    if (!sessionId) {
      console.log('[leads/create] no sessionId');
      return NextResponse.json({ ok: true });
    }

    // Only fields we KNOW exist in Prisma
    const safeData: any = {};

    // Basic contact
    if (typeof rest.name === 'string') safeData.name = rest.name.slice(0, 100);
    if (typeof rest.phone === 'string') safeData.phone = rest.phone.slice(0, 15);
    if (typeof rest.email === 'string') safeData.email = rest.email.slice(0, 200);

    // Geo
    if (typeof rest.city === 'string') safeData.city = rest.city.slice(0, 100);
    if (typeof rest.region === 'string') safeData.region = rest.region.slice(0, 100);
    if (typeof rest.country === 'string') safeData.country = rest.country.slice(0, 100);
    if (typeof rest.timezone === 'string') safeData.timezone = rest.timezone.slice(0, 50);
    if (typeof rest.language === 'string') safeData.language = rest.language.slice(0, 10);

    // Address (new v36 fields — will silently fail if schema not updated)
    if (typeof rest.pincode === 'string') safeData.pincode = rest.pincode.slice(0, 10);
    if (typeof rest.state === 'string') safeData.state = rest.state.slice(0, 100);
    if (typeof rest.addressLine1 === 'string') safeData.addressLine1 = rest.addressLine1.slice(0, 500);

    // Device
    if (typeof rest.deviceType === 'string') safeData.deviceType = rest.deviceType.slice(0, 20);
    if (typeof rest.screenWidth === 'number') safeData.screenWidth = rest.screenWidth;
    if (typeof rest.screenHeight === 'number') safeData.screenHeight = rest.screenHeight;
    if (typeof rest.userAgent === 'string') safeData.userAgent = rest.userAgent.slice(0, 500);

    // Source
    if (typeof rest.landingUrl === 'string') safeData.landingUrl = rest.landingUrl.slice(0, 500);
    if (typeof rest.referrer === 'string') safeData.referrer = rest.referrer.slice(0, 500);
    if (typeof rest.utmSource === 'string') safeData.utmSource = rest.utmSource.slice(0, 100);
    if (typeof rest.utmMedium === 'string') safeData.utmMedium = rest.utmMedium.slice(0, 100);
    if (typeof rest.utmCampaign === 'string') safeData.utmCampaign = rest.utmCampaign.slice(0, 200);
    if (typeof rest.utmTerm === 'string') safeData.utmTerm = rest.utmTerm.slice(0, 100);
    if (typeof rest.utmContent === 'string') safeData.utmContent = rest.utmContent.slice(0, 200);

    // Behavior
    if (typeof rest.visitCount === 'number') safeData.visitCount = rest.visitCount;
    if (typeof rest.isReturning === 'boolean') safeData.isReturning = rest.isReturning;
    if (typeof rest.hasAddress === 'boolean') safeData.hasAddress = rest.hasAddress;
    if (typeof rest.timeOnSite === 'number') safeData.timeOnSite = rest.timeOnSite;
    if (typeof rest.pagesViewed === 'number') safeData.pagesViewed = rest.pagesViewed;
    if (typeof rest.scrolled === 'boolean') safeData.scrolled = rest.scrolled;

    // Engagement
    if (typeof rest.optedIn === 'boolean') safeData.optedIn = rest.optedIn;
    if (typeof rest.chipDismissed === 'boolean') safeData.chipDismissed = rest.chipDismissed;
    if (typeof rest.couponCode === 'string') safeData.couponCode = rest.couponCode.slice(0, 50);
    if (typeof rest.couponPct === 'number') safeData.couponPct = rest.couponPct;
    if (typeof rest.segment === 'string') safeData.segment = rest.segment.slice(0, 50);

    // Cart
    if (typeof rest.cartAdded === 'boolean') safeData.cartAdded = rest.cartAdded;
    if (typeof rest.cartValue === 'number') safeData.cartValue = rest.cartValue;
    if (typeof rest.cartSummary === 'string') safeData.cartSummary = rest.cartSummary.slice(0, 500);
    if (typeof rest.cartAbandoned === 'boolean') safeData.cartAbandoned = rest.cartAbandoned;

    // Conversion
    if (typeof rest.orderNumber === 'string') safeData.orderNumber = rest.orderNumber.slice(0, 50);
    if (typeof rest.converted === 'boolean') safeData.converted = rest.converted;

    console.log('[leads/create]', sessionId, 'saving fields:', Object.keys(safeData).length);

    // Try full upsert first
    try {
      await prisma.lead.upsert({
        where: { sessionId },
        update: safeData,
        create: { sessionId, ...safeData },
      });
      return NextResponse.json({ ok: true });
    } catch (fullErr: any) {
      console.error('[leads/create] full upsert failed:', fullErr.message);

      // FALLBACK: strip new v36 fields and retry
      const { pincode, state, addressLine1, ...basic } = safeData;
      try {
        await prisma.lead.upsert({
          where: { sessionId },
          update: basic,
          create: { sessionId, ...basic },
        });
        console.warn('[leads/create] saved without new fields (schema needs update)');
        return NextResponse.json({ ok: true, note: 'saved without new fields' });
      } catch (basicErr: any) {
        console.error('[leads/create] basic upsert also failed:', basicErr.message);
        return NextResponse.json({ ok: false, error: basicErr.message }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('[leads/create] fatal error:', sessionId, err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'POST to log a lead' });
}
