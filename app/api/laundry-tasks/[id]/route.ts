import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  queries.deleteLaundryTask(Number(id));
  return NextResponse.json({ ok: true });
}
