import { NextRequest, NextResponse } from 'next/server';
import { searchKeyword } from '@/lib/tourapi';

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('q') ?? '';
  if (!keyword.trim()) return NextResponse.json({ places: [] });

  try {
    const items = await searchKeyword(keyword);
    return NextResponse.json({ places: items });
  } catch {
    return NextResponse.json({ error: '검색에 실패했어요.' }, { status: 500 });
  }
}
