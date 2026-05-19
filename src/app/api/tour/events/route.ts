import { NextResponse } from 'next/server';
import { getAreaBasedList } from '@/lib/tourapi';

export async function GET() {
  try {
    const { items } = await getAreaBasedList({ contentTypeId: '15', numOfRows: 6 });
    return NextResponse.json({ events: items }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
