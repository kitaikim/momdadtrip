import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/kakao';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const type = searchParams.get('type') as 'cafe' | 'restaurant' | null;

  if (!lat || !lng) {
    return NextResponse.json({ error: '위치 정보가 필요해요.' }, { status: 400 });
  }

  try {
    const [cafes, restaurants] = await Promise.all([
      type !== 'restaurant' ? getNearbyPlaces({ lat, lng, category: 'CE7', radius: 2000 }) : Promise.resolve([]),
      type !== 'cafe' ? getNearbyPlaces({ lat, lng, category: 'FD6', radius: 2000 }) : Promise.resolve([]),
    ]);

    return NextResponse.json({ cafes, restaurants });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '주변 장소를 불러오지 못했어요.' }, { status: 500 });
  }
}
