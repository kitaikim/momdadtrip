import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}&size=1`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  );

  if (!res.ok) return NextResponse.json({ error: 'kakao error' }, { status: 502 });

  const data = await res.json();
  const doc = data.documents?.[0];
  if (!doc) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({ x: doc.x, y: doc.y });
}
