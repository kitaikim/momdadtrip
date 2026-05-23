import { NextResponse } from 'next/server';
import { FEED_TRIPS } from '@/data/feed';

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const likesMap: Record<string, number> = {};

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trip_likes?select=trip_id`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const rows: { trip_id: string }[] = await res.json();
        rows.forEach(r => {
          likesMap[r.trip_id] = (likesMap[r.trip_id] ?? 0) + 1;
        });
      }
    } catch {}
  }

  const trips = FEED_TRIPS
    .map(t => ({ ...t, likes: t.baseLikes + (likesMap[t.id] ?? 0) }))
    .sort((a, b) => b.likes - a.likes);

  return NextResponse.json({ trips });
}
