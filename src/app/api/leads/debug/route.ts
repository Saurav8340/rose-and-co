import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: Can we reach Prisma?
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.checks.prisma_connection = 'OK';
  } catch (err: any) {
    results.checks.prisma_connection = 'FAIL: ' + err.message;
  }

  // Check 2: Does Lead model exist with correct fields?
  try {
    const testWrite = await prisma.lead.create({
      data: {
        sessionId: 'debug_' + Date.now(),
        name: 'DEBUG TEST',
        phone: '9999999999',
        email: 'debug@test.com',
        pincode: '110001',
        city: 'Debug City',
        state: 'Debug State',
        addressLine1: 'Debug address',
      },
    });
    results.checks.lead_write = 'OK - id: ' + testWrite.id;

    // Cleanup
    await prisma.lead.delete({ where: { id: testWrite.id } });
    results.checks.lead_cleanup = 'OK';
  } catch (err: any) {
    results.checks.lead_write = 'FAIL: ' + err.message;
  }

  // Check 3: How many leads exist?
  try {
    const count = await prisma.lead.count();
    results.checks.lead_count = count;
  } catch (err: any) {
    results.checks.lead_count = 'FAIL: ' + err.message;
  }

  // Check 4: Latest 3 leads
  try {
    const recent = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, name: true, phone: true, pincode: true, createdAt: true },
    });
    results.checks.recent_leads = recent;
  } catch (err: any) {
    results.checks.recent_leads = 'FAIL: ' + err.message;
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
