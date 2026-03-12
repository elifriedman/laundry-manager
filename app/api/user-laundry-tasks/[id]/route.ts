import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const valid = ['pending', 'picked_up', 'laundering', 'clean', 'dropped_off'];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  queries.updateUserLaundryTaskStatus(Number(id), status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  queries.deleteUserLaundryTask(Number(id));
  return NextResponse.json({ ok: true });
}
