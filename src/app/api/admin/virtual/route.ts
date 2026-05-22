import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function countByDevice(table: string, deviceId: string): Promise<number> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?device_id=eq.${deviceId}&select=device_id`,
    { headers: { ...HEADERS, Prefer: 'count=exact' } }
  );
  const count = res.headers.get('content-range')?.split('/')[1];
  return count ? parseInt(count) : 0;
}

// GET: 가상유저들의 컨텐츠 통계
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('deviceIds') ?? '';
  if (!idsParam) return NextResponse.json({});

  const deviceIds = idsParam.split(',');
  const stats: Record<string, { trips: number; journals: number; stamps: number; missions: number }> = {};

  await Promise.all(
    deviceIds.map(async (id) => {
      const [trips, journals, stamps, missions] = await Promise.all([
        countByDevice('trips', id),
        countByDevice('journal_entries', id),
        countByDevice('stamps', id),
        countByDevice('missions', id),
      ]);
      stats[id] = { trips, journals, stamps, missions };
    })
  );

  return NextResponse.json(stats);
}

// DELETE: 특정 가상유저의 모든 컨텐츠 삭제
export async function DELETE(req: NextRequest) {
  const { deviceId } = await req.json();
  if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 });

  const del = (table: string) =>
    fetch(`${SUPABASE_URL}/rest/v1/${table}?device_id=eq.${deviceId}`, {
      method: 'DELETE',
      headers: HEADERS,
    });

  await Promise.all([
    del('trips'),
    del('journal_entries'),
    del('stamps'),
    del('missions'),
  ]);

  return NextResponse.json({ ok: true });
}
