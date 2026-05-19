import { NextRequest, NextResponse } from 'next/server';
import { getAreaBasedList } from '@/lib/tourapi';

export async function GET(req: NextRequest) {
  const sigungu = req.nextUrl.searchParams.get('sigungu') ?? '';
  try {
    const { items } = await getAreaBasedList({
      contentTypeId: '25',
      sigunguCode: sigungu || undefined,
      numOfRows: 10,
    });
    return NextResponse.json({ courses: items });
  } catch {
    return NextResponse.json({ courses: [] });
  }
}
