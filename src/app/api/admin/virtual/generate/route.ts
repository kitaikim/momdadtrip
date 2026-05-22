import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates',
};

async function upsert(table: string, record: unknown) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(record),
  });
  return res.ok;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export async function POST(req: NextRequest) {
  const { persona, places, journalTemplates, missionIds, sigunguCode } = await req.json();
  const { deviceId, region } = persona;

  // 여행 1개 (2~3일) 생성
  const tripDays = journalTemplates.length;
  const startDate = randomDate(new Date('2026-03-01'), new Date('2026-05-01'));
  const endDate = addDays(startDate, tripDays - 1);

  const titleTemplate = persona.tripTitle as string;
  const tripTitle = titleTemplate.replace('{child}', persona.childName);

  const days = journalTemplates.map((_: unknown, i: number) => {
    const dayPlaces = places.slice(i * 2, i * 2 + 2).map((p: { contentId: string; title: string; address: string }) => ({
      contentId: p.contentId,
      title: p.title,
      address: p.address,
    }));
    return {
      date: fmt(addDays(startDate, i)),
      places: dayPlaces,
    };
  });

  const tripId = `virt_${deviceId.slice(5, 13)}_trip`;
  const now = new Date().toISOString();

  await upsert('trips', {
    id: tripId,
    device_id: deviceId,
    title: tripTitle,
    start_date: fmt(startDate),
    end_date: fmt(endDate),
    days,
    updated_at: now,
    created_at: now,
  });

  // 일지 생성
  for (let i = 0; i < journalTemplates.length; i++) {
    const tpl = journalTemplates[i];
    const date = fmt(addDays(startDate, i));
    const memo = (tpl.memo as string)
      .replace(/\{child\}/g, persona.childName)
      .replace(/\{region\}/g, region);
    const journalId = `${tripId}_${date}`;

    await upsert('journal_entries', {
      id: journalId,
      device_id: deviceId,
      trip_id: tripId,
      date,
      memo,
      mood: tpl.mood,
      child_quote: tpl.child_quote,
      updated_at: now,
    });
  }

  // 스탬프 생성
  const visited: Record<string, string> = {
    [sigunguCode]: randomDate(startDate, endDate).toISOString(),
  };
  await upsert('stamps', {
    device_id: deviceId,
    visited,
    updated_at: now,
  });

  // 미션 생성
  const completed: Record<string, string> = {};
  for (const mId of missionIds) {
    completed[mId] = randomDate(startDate, endDate).toISOString();
  }
  await upsert('missions', {
    device_id: deviceId,
    completed,
    updated_at: now,
  });

  return NextResponse.json({ ok: true, tripId, journals: journalTemplates.length });
}
