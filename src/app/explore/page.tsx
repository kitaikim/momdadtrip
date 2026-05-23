'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GANGWON_SIGUNGU, TRAVEL_THEMES, AGE_GROUPS, type TravelTheme, type AgeGroup, type TravelSearchParams } from '@/types';
import { getChildProfile } from '@/lib/childProfile';

interface PlaceItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage?: string;
  cat2?: string;
  mapx: string;
  mapy: string;
  parking?: string;
  restroom?: string;
  stroller?: string;
}

interface WeatherInfo {
  emoji: string;
  desc: string;
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temp: string;
  city: string;
}

const WEATHER_RECOMMEND: Record<string, { label: string; themes: TravelTheme[]; bg: string }> = {
  sunny: { label: '맑은 날 야외 코스', themes: ['nature', 'activity', 'beach'], bg: 'from-amber-400 to-orange-400' },
  cloudy: { label: '흐린 날 나들이 코스', themes: ['history', 'culture', 'food'], bg: 'from-slate-400 to-slate-500' },
  rainy: { label: '비 오는 날 실내 코스', themes: ['culture', 'food', 'healing'], bg: 'from-sky-500 to-indigo-500' },
  snowy: { label: '눈 오는 날 코스', themes: ['activity', 'healing', 'food'], bg: 'from-sky-300 to-blue-400' },
};

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<'filter' | 'search' | 'course'>('filter');
  const [keyword, setKeyword] = useState('');
  const [courses, setCourses] = useState<PlaceItem[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  const [selectedThemes, setSelectedThemes] = useState<TravelTheme[]>(
    searchParams.get('theme') ? [searchParams.get('theme') as TravelTheme] : []
  );
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(() => {
    if (searchParams.get('age')) return searchParams.get('age') as AgeGroup;
    const profile = getChildProfile();
    return profile?.ageGroup ?? 'toddler';
  });
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [strollerRequired, setStrollerRequired] = useState(false);
  const [parkingRequired, setParkingRequired] = useState(false);
  const [restroomRequired, setRestroomRequired] = useState(false);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // 홈 검색창에서 넘어온 q 파라미터 자동 검색
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    setTab('search');
    setKeyword(q);
    setLoading(true);
    setSearched(true);
    fetch(`/api/tour/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setPlaces(d.places ?? []))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sigungu = selectedSigungu || '3';
    fetch(`/api/weather?sigungu=${sigungu}`)
      .then(r => r.json())
      .then(setWeather)
      .catch(() => {});
  }, [selectedSigungu]);

  useEffect(() => {
    if (tab !== 'course' || coursesLoaded) return;
    const sigungu = selectedSigungu || '';
    fetch(`/api/tour/courses?sigungu=${sigungu}`)
      .then(r => r.json())
      .then(d => { setCourses(d.courses ?? []); setCoursesLoaded(true); })
      .catch(() => setCoursesLoaded(true));
  }, [tab, coursesLoaded, selectedSigungu]);

  const handleKeywordSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/tour/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setPlaces(data.places ?? []);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = (theme: TravelTheme) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const body: TravelSearchParams = {
        ageGroup: selectedAge,
        themes: selectedThemes,
        transport: 'car',
        nights: 1,
        strollerRequired,
        parkingRequired,
        restroomRequired,
        sigungu: selectedSigungu || undefined,
      };
      const res = await fetch('/api/tour/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setPlaces(data.places ?? []);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white px-4 pt-12 pb-0 border-b border-gray-100">
        <div className="flex items-center gap-2 pb-3">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 -ml-2 flex-shrink-0">
            <span className="text-gray-700 text-lg">←</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">여행지 탐색</h1>
        </div>

        {/* 탭 */}
        <div className="flex">
          {([
            { id: 'filter', label: '조건 검색' },
            { id: 'search', label: '직접 검색' },
            { id: 'course', label: '추천 코스' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 키워드 검색 */}
      {tab === 'search' && (
        <div className="px-4 py-4 bg-white mb-2 border-b border-gray-100">
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleKeywordSearch()}
              placeholder="여행지 검색 (예: 속초, 낙산사)"
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
            <Button
              onClick={handleKeywordSearch}
              disabled={loading}
              className="rounded-2xl px-5 text-sm font-bold h-auto py-3.5"
            >
              검색
            </Button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {['속초 해수욕장', '경포대', '오대산', '레일바이크', '닭갈비'].map(q => (
              <button
                key={q}
                onClick={() => setKeyword(q)}
                className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 추천 코스 탭 */}
      {tab === 'course' && (
        <section className="px-5 py-4">
          {!coursesLoaded && <p className="text-center text-gray-400 text-sm mt-8">코스 불러오는 중...</p>}
          {coursesLoaded && courses.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">코스 정보가 없어요 😅</p>
          )}
          <div className="flex flex-col gap-4">
            {courses.map(c => (
              <Link
                key={c.contentid}
                href={`/explore/${c.contentid}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex gap-3 p-3 active:scale-95 transition-transform"
              >
                {c.firstimage ? (
                  <img src={c.firstimage} alt={c.title} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-24 h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl flex-shrink-0">🗺️</div>
                )}
                <div className="flex-1 min-w-0 py-1">
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.addr1}</p>
                  <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 font-medium">여행코스</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 날씨 카드 (조건 검색 탭에만) */}
      {tab === 'filter' && weather && (
        <div className={`mx-5 mt-4 mb-2 rounded-2xl bg-gradient-to-r ${WEATHER_RECOMMEND[weather.type].bg} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">{weather.city} 현재 날씨</p>
              <p className="text-xl font-bold mt-0.5">
                {weather.emoji} {weather.desc} {weather.temp}°C
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedThemes(WEATHER_RECOMMEND[weather.type].themes);
              }}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 rounded-xl px-3 py-2 text-xs font-semibold text-right leading-snug"
            >
              {WEATHER_RECOMMEND[weather.type].label}<br />
              <span className="opacity-80">바로 검색 →</span>
            </button>
          </div>
        </div>
      )}

      {/* 필터 (조건 검색 탭에만) */}
      {tab === 'filter' && <section className="px-5 py-4 bg-white mb-2 border-b border-gray-100">
        {/* 지역 선택 */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">지역</label>
          <select
            value={selectedSigungu}
            onChange={e => setSelectedSigungu(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white"
          >
            <option value="">강원도 전체</option>
            {Object.entries(GANGWON_SIGUNGU).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        {/* 아이 나이 */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">아이 나이</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(AGE_GROUPS).map(([key, { label, range }]) => (
              <button
                key={key}
                onClick={() => setSelectedAge(key as AgeGroup)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedAge === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {label} <span className="text-xs opacity-70">{range}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 테마 */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">테마 (복수 선택)</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TRAVEL_THEMES).map(([key, { label, emoji }]) => (
              <button
                key={key}
                onClick={() => toggleTheme(key as TravelTheme)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedThemes.includes(key as TravelTheme)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* 편의시설 필터 */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">편의시설</label>
          <div className="flex flex-col gap-2">
            {[
              { state: strollerRequired, setter: setStrollerRequired, label: '🛒 유모차 접근 가능' },
              { state: parkingRequired, setter: setParkingRequired, label: '🅿️ 주차장 있음' },
              { state: restroomRequired, setter: setRestroomRequired, label: '🚻 화장실 있음' },
            ].map(({ state, setter, label }) => (
              <div key={label} className="flex items-center gap-2">
                <button
                  onClick={() => setter(v => !v)}
                  className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${state ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${state ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading}
          className="w-full rounded-xl py-3 font-semibold h-auto"
        >
          {loading ? '검색 중...' : '여행지 찾기'}
        </Button>
      </section>}

      {/* 결과 (필터·검색 탭) */}
      {tab !== 'course' && <section className="px-5 py-4">
        {/* 스켈레톤 로딩 */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <Skeleton className="w-full h-32" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !searched && (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-5xl">🗺️</span>
            <p className="text-sm text-gray-400 text-center">
              {tab === 'filter' ? '조건을 선택하고 여행지를 찾아보세요' : '검색어를 입력해보세요'}
            </p>
          </div>
        )}

        {!loading && searched && places.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-5xl">😅</span>
            <p className="text-sm text-gray-400 text-center">조건에 맞는 여행지가 없어요<br />조건을 바꿔 다시 시도해보세요.</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            {places.map(place => (
              <Link
                key={place.contentid}
                href={`/explore/${place.contentid}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                {place.firstimage ? (
                  <img
                    src={place.firstimage}
                    alt={place.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl">🏔️</div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{place.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{place.addr1}</p>
                  {(place.parking || place.restroom || place.stroller) && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {place.parking && place.parking !== '0' && place.parking !== 'N' && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 border-blue-100">🅿️ 주차</Badge>
                      )}
                      {place.restroom && place.restroom !== '0' && place.restroom !== 'N' && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-50 text-green-600 border-green-100">🚻 화장실</Badge>
                      )}
                      {place.stroller && place.stroller !== '0' && place.stroller !== 'N' && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 border-blue-100">🛒 유모차</Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>}
      <BottomNav />
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
