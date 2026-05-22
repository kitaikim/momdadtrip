import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function fetchAll(table: string, select = '*') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, { headers: HEADERS });
  if (!res.ok) return [];
  return res.json();
}

export async function GET() {
  const [trips, journals, stamps, missions] = await Promise.all([
    fetchAll('trips', 'device_id,title,created_at,updated_at'),
    fetchAll('journal_entries', 'device_id,created_at'),
    fetchAll('stamps', 'device_id,visited,updated_at'),
    fetchAll('missions', 'device_id,completed,updated_at'),
  ]);

  type DeviceMap = Record<string, {
    deviceId: string;
    firstSeen: string;
    lastSeen: string;
    trips: number;
    journals: number;
    stamps: number;
    missions: number;
  }>;

  const deviceMap: DeviceMap = {};

  const ensure = (id: string) => {
    if (!deviceMap[id]) {
      deviceMap[id] = { deviceId: id, firstSeen: '', lastSeen: '', trips: 0, journals: 0, stamps: 0, missions: 0 };
    }
  };

  for (const r of trips) {
    ensure(r.device_id);
    deviceMap[r.device_id].trips++;
    const t = r.updated_at ?? r.created_at ?? '';
    if (!deviceMap[r.device_id].lastSeen || t > deviceMap[r.device_id].lastSeen) deviceMap[r.device_id].lastSeen = t;
    if (!deviceMap[r.device_id].firstSeen || t < deviceMap[r.device_id].firstSeen) deviceMap[r.device_id].firstSeen = t;
  }

  for (const r of journals) {
    ensure(r.device_id);
    deviceMap[r.device_id].journals++;
  }

  for (const r of stamps) {
    ensure(r.device_id);
    deviceMap[r.device_id].stamps = Object.keys(r.visited ?? {}).length;
    const t = r.updated_at ?? '';
    if (t && (!deviceMap[r.device_id].lastSeen || t > deviceMap[r.device_id].lastSeen)) deviceMap[r.device_id].lastSeen = t;
  }

  for (const r of missions) {
    ensure(r.device_id);
    deviceMap[r.device_id].missions = Object.keys(r.completed ?? {}).length;
  }

  const users = Object.values(deviceMap).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
  return NextResponse.json(users);
}
