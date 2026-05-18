import { NextRequest, NextResponse } from 'next/server';
import { getDetailCommon } from '@/lib/tourapi';

export async function GET(req: NextRequest) {
  const contentId = req.nextUrl.searchParams.get('contentid');
  if (!contentId) return NextResponse.json({ error: 'contentid required' }, { status: 400 });

  const place = await getDetailCommon(contentId);
  if (!place) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({
    contentId: place.contentid,
    title: place.title,
    address: place.addr1,
    image: place.firstimage ?? null,
  });
}
