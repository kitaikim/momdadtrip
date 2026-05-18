const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
const BARRIER_FREE_URL = 'https://apis.data.go.kr/B551011/KorWithService2';
const SERVICE_KEY = process.env.TOUR_API_KEY!;

export type ContentType =
  | '12' // 관광지
  | '14' // 문화시설
  | '15' // 축제/공연/행사
  | '25' // 여행코스
  | '28' // 레포츠
  | '32' // 숙박
  | '38' // 쇼핑
  | '39'; // 음식점

export interface TourItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  mapx: string;
  mapy: string;
  firstimage?: string;
  firstimage2?: string;
  areacode: string;
  sigungucode?: string;
  cat1: string;
  cat2: string;
  cat3: string;
  tel?: string;
  readcount?: number;
}

interface TourApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: TourItem[] } | '';
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

async function fetchTour<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const searchParams = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const res = await fetch(`${BASE_URL}/${endpoint}?${searchParams}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TourAPI error: ${res.status}`);
  return res.json();
}

// 강원도 지역 기반 관광지 목록
export async function getAreaBasedList(params: {
  contentTypeId?: ContentType;
  sigunguCode?: string;
  pageNo?: number;
  numOfRows?: number;
}) {
  const data = await fetchTour<TourApiResponse>('areaBasedList2', {
    areaCode: '32', // 강원특별자치도
    contentTypeId: params.contentTypeId ?? '12',
    sigunguCode: params.sigunguCode ?? '',
    pageNo: params.pageNo ?? 1,
    numOfRows: params.numOfRows ?? 20,
  });

  const items = data.response.body.items;
  return {
    items: items === '' ? [] : items.item,
    total: data.response.body.totalCount,
  };
}

// 위치 기반 관광지 검색
export async function getLocationBasedList(params: {
  mapX: number;
  mapY: number;
  radius?: number;
  contentTypeId?: ContentType;
  numOfRows?: number;
}) {
  const data = await fetchTour<TourApiResponse>('locationBasedList2', {
    mapX: params.mapX,
    mapY: params.mapY,
    radius: params.radius ?? 5000,
    contentTypeId: params.contentTypeId ?? '12',
    numOfRows: params.numOfRows ?? 20,
    pageNo: 1,
  });

  const items = data.response.body.items;
  return items === '' ? [] : items.item;
}

// 키워드 검색
export async function searchKeyword(keyword: string, contentTypeId?: ContentType) {
  const data = await fetchTour<TourApiResponse>('searchKeyword2', {
    keyword,
    areaCode: '32',
    contentTypeId: contentTypeId ?? '',
    numOfRows: 20,
    pageNo: 1,
  });

  const items = data.response.body.items;
  return items === '' ? [] : items.item;
}

// 관광지 상세 정보
export async function getDetailCommon(contentId: string) {
  const data = await fetchTour<any>('detailCommon2', {
    contentId,
    numOfRows: 1,
    pageNo: 1,
  });

  const items = data.response.body.items;
  return items === '' ? null : items.item?.[0] ?? null;
}

// 반려동물 동반 가능 관광지
export async function getPetFriendlyList(sigunguCode?: string) {
  const data = await fetchTour<TourApiResponse>('detailPetTour2', {
    areaCode: '32',
    sigunguCode: sigunguCode ?? '',
    numOfRows: 20,
    pageNo: 1,
  });

  const items = data.response.body.items;
  return items === '' ? [] : items.item;
}

// 무장애 여행 정보 (수유실·유모차 접근성)
export interface BarrierFreeItem {
  contentid: string;
  title: string;
  addr1: string;
  mapx: string;
  mapy: string;
  firstimage?: string;
  stroller?: string;
  lactationroom?: string;
  babysparechair?: string;
  infantsfamilyetc?: string;
}

export async function getBarrierFreeList(params: {
  sigunguCode?: string;
  pageNo?: number;
  numOfRows?: number;
}) {
  const searchParams = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    areaCode: '32',
    sigunguCode: params.sigunguCode ?? '',
    pageNo: String(params.pageNo ?? 1),
    numOfRows: String(params.numOfRows ?? 30),
  });

  const res = await fetch(`${BARRIER_FREE_URL}/areaBasedList2?${searchParams}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`BarrierFree API error: ${res.status}`);
  const data = await res.json();
  const items = data.response?.body?.items;
  return {
    items: (items === '' || !items) ? [] : (items.item ?? []) as BarrierFreeItem[],
    total: data.response?.body?.totalCount ?? 0,
  };
}

export async function getBarrierFreeDetail(contentId: string) {
  const searchParams = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    contentId,
    numOfRows: '1',
    pageNo: '1',
  });

  const res = await fetch(`${BARRIER_FREE_URL}/detailWithTour2?${searchParams}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const items = data.response?.body?.items;
  if (!items || items === '') return null;
  return (items.item?.[0] ?? null) as BarrierFreeItem | null;
}
