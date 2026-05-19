import { NextRequest, NextResponse } from 'next/server';

const SIGUNGU_CITY: Record<string, string> = {
  '1': 'Chuncheon', '2': 'Wonju', '3': 'Gangneung', '4': 'Donghae',
  '5': 'Taebaek', '6': 'Sokcho', '7': 'Samcheok', '8': 'Hongcheon',
  '9': 'Hoengseong', '10': 'Yeongwol', '11': 'Pyeongchang', '12': 'Jeongseon',
  '13': 'Cheorwon', '14': 'Hwacheon', '15': 'Yanggu', '16': 'Inje',
  '17': 'Goseong', '18': 'Yangyang',
};

function parseWeather(code: number): { emoji: string; desc: string; type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' } {
  if (code === 0)       return { emoji: '☀️', desc: '맑음', type: 'sunny' };
  if (code <= 3)        return { emoji: '⛅', desc: '구름', type: 'cloudy' };
  if (code <= 48)       return { emoji: '🌫️', desc: '안개', type: 'cloudy' };
  if (code <= 67)       return { emoji: '🌧️', desc: '비', type: 'rainy' };
  if (code <= 77)       return { emoji: '❄️', desc: '눈', type: 'snowy' };
  if (code <= 82)       return { emoji: '🌦️', desc: '소나기', type: 'rainy' };
  if (code <= 86)       return { emoji: '🌨️', desc: '눈소나기', type: 'snowy' };
  return { emoji: '⛈️', desc: '뇌우', type: 'rainy' };
}

export async function GET(req: NextRequest) {
  const sigungu = req.nextUrl.searchParams.get('sigungu') ?? '3';
  const city = SIGUNGU_CITY[sigungu] ?? 'Gangneung';

  try {
    const res = await fetch(`https://wttr.in/${city}?format=j1`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const cur = data.current_condition?.[0];
    if (!cur) throw new Error('no data');

    const weather = parseWeather(parseInt(cur.weatherCode));
    return NextResponse.json({ ...weather, temp: cur.temp_C, city });
  } catch {
    return NextResponse.json({ emoji: '🌤️', desc: '날씨 정보 없음', type: 'cloudy', temp: '--', city });
  }
}
