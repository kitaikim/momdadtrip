const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY!;
const BASE_URL = 'https://dapi.kakao.com/v2/local';

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
  distance?: string;
}

interface KakaoResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

async function fetchKakao<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const searchParams = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );

  const res = await fetch(`${BASE_URL}/${endpoint}?${searchParams}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Kakao API error: ${res.status}`);
  return res.json();
}

// 반경 내 카페/음식점 검색
export async function getNearbyPlaces(params: {
  lat: number;
  lng: number;
  radius?: number;
  category: 'CE7' | 'FD6'; // CE7: 카페, FD6: 음식점
  page?: number;
}) {
  const data = await fetchKakao<KakaoResponse>('search/category.json', {
    category_group_code: params.category,
    x: params.lng,
    y: params.lat,
    radius: params.radius ?? 2000,
    sort: 'distance',
    page: params.page ?? 1,
    size: 15,
  });

  return data.documents;
}

// 키워드로 장소 검색
export async function searchPlaces(keyword: string, lat?: number, lng?: number) {
  const params: Record<string, string | number> = {
    query: keyword,
    size: 15,
  };

  if (lat && lng) {
    params.x = lng;
    params.y = lat;
    params.sort = 'distance';
  }

  const data = await fetchKakao<KakaoResponse>('search/keyword.json', params);
  return data.documents;
}
