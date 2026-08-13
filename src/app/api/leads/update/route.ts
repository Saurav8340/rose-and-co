import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = cookies().get('admin_session')?.value;
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const { id, status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;

    await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'update failed' }, { status: 500 });
  }
}



