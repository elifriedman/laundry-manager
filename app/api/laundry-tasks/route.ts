import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET() {
  const tasks = queries.getAllLaundryTasks().map((task) => ({
    ...task,
    claimed_loads: queries.getClaimedLoads(task.id),
  }));
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { total_loads, pickup_location, due_date } = await req.json();
  if (!total_loads || !pickup_location || !due_date) {
    return NextResponse.json({ error: 'total_loads, pickup_location, due_date required' }, { status: 400 });
  }
  const result = queries.createLaundryTask(Number(total_loads), pickup_location, due_date);
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
