'use client';

import { useEffect, useState, useCallback } from 'react';

type PickupTask = { id: number; location: string; time: string; assignee: string | null; status: string };
type LaundryTask = { id: number; total_loads: number; pickup_location: string; due_date: string; claimed_loads: number };

export default function AdminPage() {
  const [pickupTasks, setPickupTasks] = useState<PickupTask[]>([]);
  const [laundryTasks, setLaundryTasks] = useState<LaundryTask[]>([]);

  // Laundry form
  const [ltLoads, setLtLoads] = useState('');
  const [ltLocation, setLtLocation] = useState('');
  const [ltDue, setLtDue] = useState(() => {
    const d = new Date(Date.now() + 6 * 60 * 60 * 1000);
    d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Pickup form
  const [ptLocation, setPtLocation] = useState('');
  const [ptTime, setPtTime] = useState('');
  const [ptAssignee, setPtAssignee] = useState('');
  const [ptAddress, setPtAddress] = useState('');
  const [ptStatus, setPtStatus] = useState('not_collected');

  const fetchAll = useCallback(async () => {
    const [pt, lt] = await Promise.all([
      fetch('/api/pickup-tasks').then((r) => r.json()),
      fetch('/api/laundry-tasks').then((r) => r.json()),
    ]);
    setPickupTasks(pt);
    setLaundryTasks(lt);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function createLaundryTask(e: React.FormEvent) {
    e.preventDefault();
    if (!ltLoads || !ltLocation || !ltDue) return;
    await fetch('/api/laundry-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_loads: Number(ltLoads), pickup_location: ltLocation, due_date: ltDue }),
    });
    setLtLoads(''); setLtLocation(''); setLtDue('');
    fetchAll();
  }

  async function deleteLaundryTask(id: number) {
    await fetch(`/api/laundry-tasks/${id}`, { method: 'DELETE' });
    fetchAll();
  }

  async function createPickupTask(e: React.FormEvent) {
    e.preventDefault();
    if (!ptLocation) return;
    await fetch('/api/pickup-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: ptLocation, time: ptTime, assignee: ptAssignee || null, address: ptAddress || null, status: ptStatus }),
    });
    setPtLocation(''); setPtTime(''); setPtAssignee(''); setPtAddress(''); setPtStatus('not_collected');
    fetchAll();
  }

  async function deletePickupTask(id: number) {
    await fetch(`/api/pickup-tasks/${id}`, { method: 'DELETE' });
    fetchAll();
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">ניהול</h1>

      {/* Laundry task form — primary */}
      <section>
        <h2 className="text-lg font-bold mb-3">הוסף משימת כביסה</h2>
        <form onSubmit={createLaundryTask} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">מיקום איסוף</label>
            <input
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 teכמה עומסי כביסהxt-right"
              placeholder="לדוג׳ האשד 33"
              value={ltLocation}
              onChange={(e) => setLtLocation(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">כמה עומסי כביסה</label>
              <input
                required
                type="number"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right"
                placeholder="4"
                value={ltLoads}
                onChange={(e) => setLtLoads(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">זמן יעד</label>
              <input
                required
                type="time"
                step={900}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={ltDue}
                onChange={(e) => setLtDue(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold active:bg-blue-700"
          >
            הוסף משימת כביסה
          </button>
        </form>

        {laundryTasks.length > 0 && (
          <ul className="mt-3 space-y-2">
            {laundryTasks.map((t) => (
              <li key={t.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{t.pickup_location}</p>
                  <p className="text-xs text-gray-500">
                    {t.claimed_loads}/{t.total_loads} עומסים · עד {t.due_date}
                  </p>
                </div>
                <button
                  onClick={() => deleteLaundryTask(t.id)}
                  className="text-red-400 text-xl leading-none px-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

  {/* Pickup task form — secondary / de-emphasized 
      <section className="opacity-80">
        <h2 className="text-base font-semibold mb-1 text-gray-600">משימות איסוף <span className="text-xs font-normal text-gray-400">(אופציונלי)</span></h2>
        <form onSubmit={createPickupTask} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-gray-500">מיקום</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right bg-white"
                placeholder="מיקום"
                value={ptLocation}
                onChange={(e) => setPtLocation(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-gray-500">שעה (אופציונלי)</label>
              <input
                type="time"
                step={900}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                value={ptTime}
                onChange={(e) => setPtTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-gray-500">אחראי (אופציונלי)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right bg-white"
                placeholder="שם"
                value={ptAssignee}
                onChange={(e) => setPtAssignee(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-gray-500">כתובת (אופציונלי)</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right bg-white"
                placeholder="רחוב ומספר"
                value={ptAddress}
                onChange={(e) => setPtAddress(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-gray-500">סטטוס</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                value={ptStatus}
                onChange={(e) => setPtStatus(e.target.value)}
              >
                <option value="not_collected">עוד לא נאסף</option>
                <option value="come_collect">תבואו לאסוף ממני</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium active:bg-gray-300"
          >
            הוסף משימת איסוף
          </button>
        </form>

        {pickupTasks.length > 0 && (
          <ul className="mt-3 space-y-2">
            {pickupTasks.map((t) => (
              <li key={t.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium"><span className="font-normal">איסוף מ</span>{t.location}</p>
                  <p className="text-xs text-gray-500">
                    {t.time ?? ''}{t.assignee && `${t.time ? ' · ' : ''}${t.assignee}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.status === 'come_collect' ? 'תבואו לאסוף ממני' : 'עוד לא נאסף'}
                  </p>
                </div>
                <button
                  onClick={() => deletePickupTask(t.id)}
                  className="text-red-400 text-xl leading-none px-1"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
*/}
      <a href="/" className="block text-center text-sm text-blue-600 underline">חזרה לדף הבית</a>
    </div>
  );
}
