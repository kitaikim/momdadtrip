'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

const CATEGORY_EMOJI: Record<string, string> = {
  attraction: '🏔️', dining: '🍽️', accommodation: '🏨', shopping: '🛍️',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function TripViewer() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('d');

  let trip: SharedTrip | null = null;
  try {
    if (encoded) trip = JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {}

  if (!trip) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-8">
        <span className="text-5xl">😅</span>
        <p className="text-gray-500 text-sm text-center">유효하지 않은 공유 링크예요.</p>
        <Link href="/" className="bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold">홈으로</Link>
      </main>
    );
  }

  const totalPlaces = trip.days.reduce((s, d) => s + d.places.length, 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 pt-12 pb-3 flex items-center gap-3">
        <Link href="/" className="text-gray-400 text-sm">← 홈</Link>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">공유된 여행 계획</span>
      </div>

      <div className="pt-20 px-4">
        {/* 여행 요약 카드 */}
        <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-5 text-white mb-5 shadow-md shadow-sky-200">
          <p className="text-xs opacity-80 mb-1">{fmt(trip.start)} ~ {fmt(trip.end)} · {trip.days.length}일</p>
          <h1 className="text-xl font-bold leading-tight">{trip.title}</h1>
          <p className="text-xs opacity-70 mt-2">총 {totalPlaces}개 장소</p>
        </div>

        {/* 날짜별 일정 */}
        {trip.days.map((day, idx) => (
          <div key={day.date} className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">Day {idx + 1}</span>
              <span className="text-xs text-gray-500">{fmt(day.date)}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {day.places.length === 0 ? (
                <p className="px-4 py-5 text-sm text-gray-300 text-center">등록된 장소 없음</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {day.places.map(place => (
                    <div key={place.contentId} className="flex items-center gap-3 px-4 py-3">
                      {place.image ? (
                        <img src={place.image} alt={place.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                          {CATEGORY_EMOJI[place.category] ?? '📍'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{place.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
                      </div>
                      <Link
                        href={`/explore/${place.contentId}`}
                        className="flex-shrink-0 text-xs text-sky-500 bg-sky-50 rounded-lg px-2 py-1"
                      >
                        상세
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 내 앱으로 열기 */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-800 mb-1">엄마랑 아빠랑으로 나도 계획 세우기</p>
          <p className="text-xs text-gray-400 mb-4">강원도 가족여행 플래너</p>
          <Link
            href="/explore"
            className="inline-block bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-sky-200"
          >
            여행지 탐색하기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
