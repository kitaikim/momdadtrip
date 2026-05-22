import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function fetchAll(table: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function GET(req: NextRequest) {
  const excludeParam = req.nextUrl.searchParams.get('exclude') ?? '';
  const excluded = new Set(excludeParam ? excludeParam.split(',') : []);

  const [trips, journals, stamps, missions] = await Promise.all([
    fetchAll('trips'),
    fetchAll('journal_entries'),
    fetchAll('stamps'),
    fetchAll('missions'),
  ]);

  const filter = (r: { device_id: string }) => !excluded.has(r.device_id);

  const fTrips = trips.filter(filter);
  const fJournals = journals.filter(filter);
  const fStamps = stamps.filter(filter);
  const fMissions = missions.filter(filter);

  const deviceIds = new Set([
    ...fTrips.map((r: { device_id: string }) => r.device_id),
    ...fStamps.map((r: { device_id: string }) => r.device_id),
    ...fMissions.map((r: { device_id: string }) => r.device_id),
  ]);

  const totalStamps = fStamps.reduce((sum: number, r: { visited: Record<string, string> }) =>
    sum + Object.keys(r.visited ?? {}).length, 0);

  const totalMissions = fMissions.reduce((sum: number, r: { completed: Record<string, string> }) =>
    sum + Object.keys(r.completed ?? {}).length, 0);

  return NextResponse.json({
    devices: deviceIds.size,
    trips: fTrips.length,
    journals: fJournals.length,
    stamps: totalStamps,
    missions: totalMissions,
  });
}
