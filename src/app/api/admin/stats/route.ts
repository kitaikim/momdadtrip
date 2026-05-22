import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function fetchAll(table: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function GET() {
  const [trips, journals, stamps, missions] = await Promise.all([
    fetchAll('trips'),
    fetchAll('journal_entries'),
    fetchAll('stamps'),
    fetchAll('missions'),
  ]);

  const deviceIds = new Set([
    ...trips.map((r: { device_id: string }) => r.device_id),
    ...stamps.map((r: { device_id: string }) => r.device_id),
    ...missions.map((r: { device_id: string }) => r.device_id),
  ]);

  const totalStamps = stamps.reduce((sum: number, r: { visited: Record<string, string> }) => {
    return sum + Object.keys(r.visited ?? {}).length;
  }, 0);

  const totalMissions = missions.reduce((sum: number, r: { completed: Record<string, string> }) => {
    return sum + Object.keys(r.completed ?? {}).length;
  }, 0);

  return NextResponse.json({
    devices: deviceIds.size,
    trips: trips.length,
    journals: journals.length,
    stamps: totalStamps,
    missions: totalMissions,
  });
}
