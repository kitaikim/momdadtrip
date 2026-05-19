'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GANGWON_SIGUNGU, TRAVEL_THEMES, AGE_GROUPS, type TravelTheme, type AgeGroup, type TravelSearchParams } from '@/types';

interface PlaceItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage?: string;
  cat2: string;
  mapx: string;
  mapy: string;
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
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(
    (searchParams.get('age') as AgeGroup) ?? 'toddler'
  );
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [strollerRequired, setStrollerRequired] = useState(false);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

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
      <header className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-3">← 뒤로</button>
        <h1 className="text-2xl font-bold text-gray-900">여행지 탐색</h1>
        <p className="text-sm text-gray-500 mt-1">강원도 18개 시군 · 아이 맞춤 추천</p>
      </header>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-100">
        {([
          { id: 'filter', label: '🔍 조건 검색' },
          { id: 'search', label: '✏️ 직접 검색' },
          { id: 'course', label: '🗺️ 추천 코스' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === t.id ? 'text-sky-500 border-b-2 border-sky-500' : 'text-gray-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 키워드 검색 */}
      {tab === 'search' && (
        <div className="px-5 py-4 bg-white mb-2 border-b border-gray-100">
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleKeywordSearch()}
              placeholder="여행지 이름으로 검색 (예: 속초, 낙산사)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              onClick={handleKeywordSearch}
              disabled={loading}
              className="bg-sky-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              검색
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['속초 해수욕장', '경포대', '오대산', '레일바이크', '닭갈비'].map(q => (
              <button
                key={q}
                onClick={() => { setKeyword(q); }}
                className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1.5"
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
                  <div className="w-24 h-20 rounded-xl bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center text-3xl flex-shrink-0">🗺️</div>
                )}
                <div className="flex-1 min-w-0 py-1">
                  <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.addr1}</p>
                  <span className="inline-block mt-2 text-[10px] bg-sky-50 text-sky-600 rounded-full px-2 py-0.5 font-medium">여행코스</span>
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
                    ? 'bg-sky-500 text-white border-sky-500'
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
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* 유모차 필터 */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setStrollerRequired(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${strollerRequired ? 'bg-sky-500' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${strollerRequired ? 'translate-x-4' : ''}`} />
          </button>
          <span className="text-sm text-gray-700">유모차 접근 가능한 곳만</span>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-sky-500 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? '검색 중...' : '여행지 찾기'}
        </button>
      </section>}

      {/* 결과 (필터·검색 탭) */}
      {tab !== 'course' && <section className="px-5 py-4">
        {!searched && (
          <p className="text-center text-gray-400 text-sm mt-8">
            {tab === 'filter' ? '조건을 선택하고 여행지를 찾아보세요' : '검색어를 입력해보세요'}
          </p>
        )}

        {searched && !loading && places.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">조건에 맞는 여행지가 없어요 😅<br />조건을 바꿔 다시 시도해보세요.</p>
        )}

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
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl">🏔️</div>
              )}
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{place.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{place.addr1}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>}

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/explore' ? 'text-sky-500 font-medium' : 'text-gray-500'}`}>{label}</span>
          </Link>
        ))}
      </nav>
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
