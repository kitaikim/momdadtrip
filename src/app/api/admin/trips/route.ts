import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
  const excludeParam = req.nextUrl.searchParams.get('exclude') ?? '';
  const excluded = new Set(excludeParam ? excludeParam.split(',') : []);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/trips?select=*&order=updated_at.desc`,
    { headers: HEADERS }
  );
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const data = await res.json();
  const filtered = excluded.size ? data.filter((r: { device_id: string }) => !excluded.has(r.device_id)) : data;
  return NextResponse.json(filtered);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/trips?id=eq.${id}`,
    { method: 'DELETE', headers: HEADERS }
  );
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  return NextResponse.json({ ok: true });
}
