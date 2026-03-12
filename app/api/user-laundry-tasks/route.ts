import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user');
  if (user) {
    const tasks = queries.getUserLaundryTasksByUser(user);
    return NextResponse.json(tasks);
  }
  return NextResponse.json(queries.getAllUserLaundryTasks());
}

export async function POST(req: NextRequest) {
  const { laundry_task_id, user_name, loads } = await req.json();
  if (!laundry_task_id || !user_name || !loads) {
    return NextResponse.json({ error: 'laundry_task_id, user_name, loads required' }, { status: 400 });
  }

  // Check available loads
  const laundryTasks = queries.getAllLaundryTasks();
  const task = laundryTasks.find((t) => t.id === Number(laundry_task_id));
  if (!task) return NextResponse.json({ error: 'task not found' }, { status: 404 });

  const claimed = queries.getClaimedLoads(Number(laundry_task_id));
  const available = task.total_loads - claimed;
  if (Number(loads) > available) {
    return NextResponse.json({ error: `רק ${available} עומסים זמינים` }, { status: 400 });
  }

  const result = queries.createUserLaundryTask(Number(laundry_task_id), user_name, Number(loads));
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
