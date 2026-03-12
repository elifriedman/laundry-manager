import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  queries.deletePickupTask(Number(id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if ('assignee' in body) queries.assignPickupTask(Number(id), body.assignee ?? null);
  if ('status' in body) queries.updatePickupTaskStatus(Number(id), body.status);
  if ('address' in body) queries.updatePickupTaskAddress(Number(id), body.address ?? null);
  return NextResponse.json({ ok: true });
}
