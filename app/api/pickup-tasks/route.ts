import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  const tasks = queries.getAllPickupTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { location, time, assignee, address, status } = await req.json();
  if (!location) {
    return NextResponse.json({ error: 'location required' }, { status: 400 });
  }
  const result = queries.createPickupTask(location, time ?? null, assignee ?? null, address ?? null, status ?? 'not_collected');
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
