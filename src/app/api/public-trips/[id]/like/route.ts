import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { deviceId } = await req.json() as { deviceId: string };
  const tripId = params.id;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'DB 미설정' }, { status: 500 });
  }

  const headers: HeadersInit = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  // 이미 좋아요 했는지 확인
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/trip_likes?trip_id=eq.${tripId}&device_id=eq.${deviceId}&select=trip_id`,
    { headers }
  );
  const existing: unknown[] = checkRes.ok ? await checkRes.json() : [];

  if (existing.length > 0) {
    // 좋아요 취소
    await fetch(
      `${SUPABASE_URL}/rest/v1/trip_likes?trip_id=eq.${tripId}&device_id=eq.${deviceId}`,
      { method: 'DELETE', headers }
    );
    return NextResponse.json({ liked: false });
  } else {
    // 좋아요 추가
    await fetch(`${SUPABASE_URL}/rest/v1/trip_likes`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ trip_id: tripId, device_id: deviceId }),
    });
    return NextResponse.json({ liked: true });
  }
}
