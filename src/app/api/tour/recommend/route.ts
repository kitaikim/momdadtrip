import { NextRequest, NextResponse } from 'next/server';
import { getAreaBasedList, getLocationBasedList } from '@/lib/tourapi';
import type { TravelSearchParams } from '@/types';
import type { ContentType } from '@/lib/tourapi';

const THEME_TO_CONTENT_TYPE: Record<string, ContentType[]> = {
  nature: ['12', '28'],
  history: ['12', '14'],
  activity: ['28', '12'],
  culture: ['14', '15'],
  food: ['39'],
  beach: ['12', '28'],
  healing: ['12', '32'],
};

export async function POST(req: NextRequest) {
  try {
    const params: TravelSearchParams = await req.json();
    const { sigungu, themes, ageGroup } = params;

    const sigunguMap: Record<string, string> = {
      chuncheon: '1', wonju: '2', gangneung: '3', donghaee: '4',
      taebaek: '5', sokcho: '6', samcheok: '7', hongcheon: '8',
      hoengseong: '9', yeongwol: '10', pyeongchang: '11', jeongseon: '12',
      cheorwon: '13', hwacheon: '14', yanggu: '15', inje: '16',
      goseong: '17', yangyang: '18',
    };

    const allTypes = themes.length > 0
      ? themes.flatMap(t => THEME_TO_CONTENT_TYPE[t] ?? ['12' as ContentType])
      : ['12' as ContentType];
    const contentTypes = Array.from(new Set(allTypes));

    const results = await Promise.allSettled(
      contentTypes.slice(0, 3).map(ct =>
        getAreaBasedList({
          contentTypeId: ct,
          sigunguCode: sigungu ? sigunguMap[sigungu] : undefined,
          numOfRows: 15,
        })
      )
    );

    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message ?? 'unknown');

    const places = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .flatMap(r => r.value.items ?? [])
      .slice(0, 20);

    return NextResponse.json({ places, total: places.length, errors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '추천 데이터를 불러오지 못했어요.' }, { status: 500 });
  }
}
