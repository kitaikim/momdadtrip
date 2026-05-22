import { NextRequest, NextResponse } from 'next/server';
import { GANGWON_SIGUNGU } from '@/types';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

export async function GET(req: NextRequest) {
  const excludeParam = req.nextUrl.searchParams.get('exclude') ?? '';
  const excluded = new Set(excludeParam ? excludeParam.split(',') : []);

  const [stampsRes, missionsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/stamps?select=*`, { headers: HEADERS }),
    fetch(`${SUPABASE_URL}/rest/v1/missions?select=*`, { headers: HEADERS }),
  ]);

  const allStamps = stampsRes.ok ? await stampsRes.json() : [];
  const allMissions = missionsRes.ok ? await missionsRes.json() : [];
  const stamps = excluded.size ? allStamps.filter((r: { device_id: string }) => !excluded.has(r.device_id)) : allStamps;
  const missions = excluded.size ? allMissions.filter((r: { device_id: string }) => !excluded.has(r.device_id)) : allMissions;

  // 지역별 스탬프 집계
  const sigunguCount: Record<string, number> = {};
  for (const row of stamps) {
    for (const code of Object.keys(row.visited ?? {})) {
      sigunguCount[code] = (sigunguCount[code] ?? 0) + 1;
    }
  }

  const sigunguStats = Object.values(GANGWON_SIGUNGU).map((sg) => ({
    code: sg.code,
    name: sg.name,
    count: sigunguCount[sg.code] ?? 0,
  })).sort((a, b) => b.count - a.count);

  // 미션별 집계
  const missionCount: Record<string, number> = {};
  for (const row of missions) {
    for (const missionId of Object.keys(row.completed ?? {})) {
      missionCount[missionId] = (missionCount[missionId] ?? 0) + 1;
    }
  }

  const missionStats = Object.entries(missionCount)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ sigunguStats, missionStats, totalDevices: stamps.length });
}
