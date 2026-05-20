// 강원도 시군구 코드
export const GANGWON_SIGUNGU: Record<string, { code: string; name: string; lat: number; lng: number }> = {
  chuncheon: { code: '1', name: '춘천시', lat: 37.8813, lng: 127.7298 },
  wonju: { code: '2', name: '원주시', lat: 37.3422, lng: 127.9201 },
  gangneung: { code: '3', name: '강릉시', lat: 37.7519, lng: 128.8761 },
  donghaee: { code: '4', name: '동해시', lat: 37.5247, lng: 129.1142 },
  taebaek: { code: '5', name: '태백시', lat: 37.1642, lng: 128.9856 },
  sokcho: { code: '6', name: '속초시', lat: 38.2071, lng: 128.5919 },
  samcheok: { code: '7', name: '삼척시', lat: 37.4498, lng: 129.1658 },
  hongcheon: { code: '8', name: '홍천군', lat: 37.6972, lng: 127.8889 },
  hoengseong: { code: '9', name: '횡성군', lat: 37.4916, lng: 127.9847 },
  yeongwol: { code: '10', name: '영월군', lat: 37.1838, lng: 128.4614 },
  pyeongchang: { code: '11', name: '평창군', lat: 37.3703, lng: 128.3909 },
  jeongseon: { code: '12', name: '정선군', lat: 37.3801, lng: 128.6603 },
  cheorwon: { code: '13', name: '철원군', lat: 38.1472, lng: 127.3136 },
  hwacheon: { code: '14', name: '화천군', lat: 38.1061, lng: 127.7084 },
  yanggu: { code: '15', name: '양구군', lat: 38.1105, lng: 127.9897 },
  inje: { code: '16', name: '인제군', lat: 38.0714, lng: 128.1714 },
  goseong: { code: '17', name: '고성군', lat: 38.3803, lng: 128.4677 },
  yangyang: { code: '18', name: '양양군', lat: 38.0756, lng: 128.6194 },
};

// 아이 연령대
export type AgeGroup = 'infant' | 'toddler' | 'child' | 'tween';
export const AGE_GROUPS: Record<AgeGroup, { label: string; range: string }> = {
  infant: { label: '영아', range: '0~1세' },
  toddler: { label: '유아', range: '2~5세' },
  child: { label: '어린이', range: '6~9세' },
  tween: { label: '초등 고학년', range: '10~12세' },
};

// 여행 테마
export type TravelTheme = 'nature' | 'history' | 'activity' | 'culture' | 'food' | 'beach' | 'healing';
export const TRAVEL_THEMES: Record<TravelTheme, { label: string; emoji: string }> = {
  nature: { label: '자연·생태', emoji: '🌿' },
  history: { label: '역사·교육', emoji: '🏯' },
  activity: { label: '체험·액티비티', emoji: '🎯' },
  culture: { label: '문화·예술', emoji: '🎨' },
  food: { label: '음식·맛집', emoji: '🍜' },
  beach: { label: '바다·해변', emoji: '🏖️' },
  healing: { label: '힐링·휴양', emoji: '💆' },
};

// 이동 수단
export type Transport = 'car' | 'public';

// 여행 추천 요청
export interface TravelSearchParams {
  sigungu?: string;
  ageGroup: AgeGroup;
  themes: TravelTheme[];
  transport: Transport;
  nights: number; // 0 = 당일치기
  strollerRequired: boolean;
  parkingRequired?: boolean;
  restroomRequired?: boolean;
}

// 장소 (TourAPI + 자체 큐레이션 레이어)
export interface Place {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  contentTypeId: string;
  category: string;
  imageUrl?: string;
  tel?: string;
  overview?: string;
  // 자체 큐레이션
  ageMin?: number;
  ageMax?: number;
  strollerOk?: boolean;
  themes?: TravelTheme[];
  durationMin?: number; // 예상 체류 시간 (분)
}

// 여행 일정
export interface Itinerary {
  id: string;
  title: string;
  days: ItineraryDay[];
  createdAt: string;
}

export interface ItineraryDay {
  date: string;
  sigungu: string;
  places: ItineraryPlace[];
}

export interface ItineraryPlace {
  order: number;
  place: Place;
  memo?: string;
  photoUrl?: string;
  visitedAt?: string;
}

// 스탬프
export interface StampRecord {
  sigunguCode: string;
  sigunguName: string;
  achievedAt: string;
  photoUrl?: string;
}
