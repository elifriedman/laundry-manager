import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'laundry.db');

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (global.__db) return global.__db;
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pickup_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      time TEXT,
      assignee TEXT,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'not_collected'
    );

    CREATE TABLE IF NOT EXISTS laundry_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_loads INTEGER NOT NULL,
      pickup_location TEXT NOT NULL,
      due_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_laundry_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      laundry_task_id INTEGER NOT NULL REFERENCES laundry_tasks(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      loads INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // Migrate existing DBs
  const cols = db.prepare("PRAGMA table_info(pickup_tasks)").all() as { name: string }[];
  if (!cols.some((c) => c.name === 'status')) {
    db.exec("ALTER TABLE pickup_tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'not_collected'");
  }
  if (!cols.some((c) => c.name === 'address')) {
    db.exec("ALTER TABLE pickup_tasks ADD COLUMN address TEXT");
  }

  global.__db = db;
  return db;
}

export const db = getDb();

// Typed query helpers

export interface PickupTask {
  id: number;
  location: string;
  time: string | null;
  assignee: string | null;
  address: string | null;
  status: 'not_collected' | 'come_collect';
}

export interface LaundryTask {
  id: number;
  total_loads: number;
  pickup_location: string;
  due_date: string;
}

export interface UserLaundryTask {
  id: number;
  laundry_task_id: number;
  user_name: string;
  loads: number;
  status: 'pending' | 'picked_up' | 'laundering' | 'clean' | 'dropped_off';
}

export const queries = {
  // Pickup tasks
  getAllPickupTasks: () =>
    db.prepare<[], PickupTask>('SELECT * FROM pickup_tasks ORDER BY time').all(),
  createPickupTask: (location: string, time: string | null, assignee: string | null, address: string | null, status: string) =>
    db.prepare('INSERT INTO pickup_tasks (location, time, assignee, address, status) VALUES (?, ?, ?, ?, ?)')
      .run(location, time, assignee, address, status),
  updatePickupTaskStatus: (id: number, status: string) =>
    db.prepare('UPDATE pickup_tasks SET status = ? WHERE id = ?').run(status, id),
  updatePickupTaskAddress: (id: number, address: string | null) =>
    db.prepare('UPDATE pickup_tasks SET address = ? WHERE id = ?').run(address, id),
  deletePickupTask: (id: number) =>
    db.prepare('DELETE FROM pickup_tasks WHERE id = ?').run(id),
  assignPickupTask: (id: number, assignee: string | null) =>
    db.prepare('UPDATE pickup_tasks SET assignee = ? WHERE id = ?').run(assignee, id),

  // Laundry tasks
  getAllLaundryTasks: () =>
    db.prepare<[], LaundryTask>('SELECT * FROM laundry_tasks ORDER BY due_date').all(),
  createLaundryTask: (total_loads: number, pickup_location: string, due_date: string) =>
    db.prepare('INSERT INTO laundry_tasks (total_loads, pickup_location, due_date) VALUES (?, ?, ?)')
      .run(total_loads, pickup_location, due_date),
  deleteLaundryTask: (id: number) =>
    db.prepare('DELETE FROM laundry_tasks WHERE id = ?').run(id),
  getClaimedLoads: (laundry_task_id: number) => {
    const row = db.prepare<[number], { total: number }>(
      'SELECT COALESCE(SUM(loads), 0) as total FROM user_laundry_tasks WHERE laundry_task_id = ?'
    ).get(laundry_task_id);
    return row?.total ?? 0;
  },

  // User laundry tasks
  getAllUserLaundryTasks: () =>
    db.prepare<[], UserLaundryTask>('SELECT * FROM user_laundry_tasks ORDER BY id').all(),
  getUserLaundryTasksByUser: (user_name: string) =>
    db.prepare<[string], UserLaundryTask>(
      'SELECT * FROM user_laundry_tasks WHERE user_name = ? ORDER BY id'
    ).all(user_name),
  createUserLaundryTask: (laundry_task_id: number, user_name: string, loads: number) =>
    db.prepare(
      'INSERT INTO user_laundry_tasks (laundry_task_id, user_name, loads) VALUES (?, ?, ?)'
    ).run(laundry_task_id, user_name, loads),
  updateUserLaundryTaskStatus: (id: number, status: string) =>
    db.prepare('UPDATE user_laundry_tasks SET status = ? WHERE id = ?').run(status, id),
  deleteUserLaundryTask: (id: number) =>
    db.prepare('DELETE FROM user_laundry_tasks WHERE id = ?').run(id),
};
