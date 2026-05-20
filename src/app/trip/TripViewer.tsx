'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface TripPlace {
  contentId: string;
  title: string;
  address: string;
  image?: string;
  category: string;
}

interface TripDay {
  date: string;
  places: TripPlace[];
}

interface SharedTrip {
  title: string;
  start: string;
  end: string;
  days: TripDay[];
}

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  attraction:    { emoji: '🏔️', label: '볼거리',  color: 'bg-sky-50 text-sky-600' },
  dining:        { emoji: '🍽️', label: '맛집',    color: 'bg-orange-50 text-orange-600' },
  accommodation: { emoji: '🏨', label: '숙소',    color: 'bg-purple-50 text-purple-600' },
  shopping:      { emoji: '🛍️', label: '쇼핑',    color: 'bg-pink-50 text-pink-600' },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

// 주소에서 시군 추출
function extractSigungu(addr: string): string {
  const match = addr.match(/강원[\w]*\s+([\w]+시|[\w]+군)/);
  return match ? match[1] : '';
}

export default function TripViewer() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');
  const [copied, setCopied] = useState(false);

  let trip: SharedTrip | null = null;
  try {
    if (encoded) trip = JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {}

  if (!trip) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-8">
        <span className="text-6xl">😅</span>
        <p className="text-gray-500 text-sm text-center">유효하지 않은 공유 링크예요.</p>
        <Link href="/" className="bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-md shadow-sky-200">
          홈으로
        </Link>
      </main>
    );
  }

  const totalPlaces = trip.days.reduce((s, d) => s + d.places.length, 0);
  const allAddresses = trip.days.flatMap(d => d.places.map(p => extractSigungu(p.address)));
  const uniqueSigungu = Array.from(new Set(allAddresses.filter(Boolean)));

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 pt-12 pb-3 flex items-center justify-between">
        <Link href="/" className="text-gray-400 text-sm">← 홈</Link>
        <span className="text-xs text-gray-400">공유된 여행 계획</span>
        <button onClick={copyLink} className="text-xs text-sky-500 font-medium">
          {copied ? '✓ 복사됨' : '🔗 공유'}
        </button>
      </div>

      <div className="pt-20 px-4">
        {/* 메인 요약 카드 */}
        <div className="relative bg-gradient-to-br from-sky-500 via-sky-400 to-teal-400 rounded-3xl p-6 text-white mb-5 shadow-xl shadow-sky-200 overflow-hidden">
          {/* 배경 데코 */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-8 -translate-x-8" />

          <div className="relative">
            <p className="text-xs font-semibold opacity-80 mb-2 tracking-wide">✈️ 강원도 가족여행</p>
            <h1 className="text-2xl font-bold leading-tight mb-4">{trip.title}</h1>

            {/* 통계 행 */}
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{trip.days.length}</p>
                <p className="text-[10px] opacity-70 mt-0.5">일</p>
              </div>
              <div className="w-px bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-bold">{totalPlaces}</p>
                <p className="text-[10px] opacity-70 mt-0.5">장소</p>
              </div>
              {uniqueSigungu.length > 0 && (
                <>
                  <div className="w-px bg-white/30" />
                  <div className="text-center">
                    <p className="text-2xl font-bold">{uniqueSigungu.length}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">지역</p>
                  </div>
                </>
              )}
            </div>

            <p className="text-xs opacity-60 mt-3">
              {fmtShort(trip.start)} – {fmtShort(trip.end)}
            </p>
          </div>
        </div>

        {/* 방문 지역 배지 */}
        {uniqueSigungu.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {uniqueSigungu.map(sg => (
              <span key={sg} className="text-xs font-medium bg-white border border-gray-100 text-gray-600 rounded-full px-3 py-1 shadow-sm">
                📍 {sg}
              </span>
            ))}
          </div>
        )}

        {/* 날짜별 타임라인 */}
        <div className="flex flex-col gap-5">
          {trip.days.map((day, idx) => (
            <div key={day.date}>
              {/* Day 헤더 */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Day {idx + 1}</p>
                  <p className="text-xs text-gray-400">{fmt(day.date)}</p>
                </div>
              </div>

              {/* 장소 카드 */}
              <div className="ml-4 pl-4 border-l-2 border-sky-100">
                {day.places.length === 0 ? (
                  <div className="bg-white rounded-2xl px-4 py-4 shadow-sm text-sm text-gray-300 text-center">
                    등록된 장소 없음
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {day.places.map((place, pIdx) => {
                      const meta = CATEGORY_META[place.category] ?? { emoji: '📍', label: '기타', color: 'bg-gray-50 text-gray-500' };
                      return (
                        <div key={place.contentId} className="relative">
                          {/* 타임라인 점 */}
                          <div className="absolute -left-[22px] top-4 w-3 h-3 rounded-full bg-white border-2 border-sky-300" />

                          <Link
                            href={`/explore/${place.contentId}`}
                            className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-50 active:scale-95 transition-transform"
                          >
                            {place.image ? (
                              <img src={place.image} alt={place.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                                {meta.emoji}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.color}`}>
                                  {meta.emoji} {meta.label}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 truncate">{place.title}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
                            </div>
                            <span className="text-gray-300 text-xs flex-shrink-0">›</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 앱 홍보 CTA */}
        <div className="mt-8 bg-gradient-to-br from-sky-50 to-teal-50 rounded-3xl p-6 border border-sky-100 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
          <h2 className="text-base font-bold text-gray-900 mb-1">엄마랑 아빠랑</h2>
          <p className="text-xs text-gray-500 mb-1">강원도 자녀 동반 가족여행 플래너</p>
          <p className="text-[11px] text-gray-400 mb-4">
            아이 나이별 맞춤 추천 · 스탬프 투어 · 여행 일지
          </p>
          <Link
            href="/"
            className="inline-block bg-sky-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-md shadow-sky-200 active:scale-95 transition-transform"
          >
            나도 여행 계획 세우기 →
          </Link>
          <p className="text-[10px] text-gray-400 mt-3">
            홈 화면에 추가하면 앱처럼 사용 가능해요 📱
          </p>
        </div>
      </div>
    </main>
  );
}
