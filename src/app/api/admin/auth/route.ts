import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD 환경변수가 설정되지 않았어요.' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: '비밀번호가 틀렸어요.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
