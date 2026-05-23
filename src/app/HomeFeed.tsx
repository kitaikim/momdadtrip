'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FeedTrip } from '@/data/feed';

const DEVICE_KEY = 'momdadtrip_device_id';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
  return id;
}

function CategoryEmoji({ cat }: { cat: string }) {
  if (cat === 'dining') return <span>🍽️</span>;
  if (cat === 'accommodation') return <span>🏨</span>;
  return <span>📍</span>;
}

export default function HomeFeed() {
  const router = useRouter();
  const [trips, setTrips] = useState<(FeedTrip & { likes: number })[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public-trips')
      .then(r => r.json())
      .then(d => setTrips(d.trips ?? []))
      .catch(() => {});
    // 내가 좋아요한 항목 복원
    try {
      const saved = JSON.parse(localStorage.getItem('feed_likes') ?? '[]') as string[];
      setLikedIds(new Set(saved));
    } catch {}
  }, []);

  async function toggleLike(tripId: string) {
    const deviceId = getDeviceId();
    const wasLiked = likedIds.has(tripId);

    // 낙관적 업데이트
    setLikedIds(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(tripId) : next.add(tripId);
      localStorage.setItem('feed_likes', JSON.stringify(Array.from(next)));
      return next;
    });
    setTrips(prev =>
      prev
        .map(t => t.id === tripId ? { ...t, likes: t.likes + (wasLiked ? -1 : 1) } : t)
        .sort((a, b) => b.likes - a.likes)
    );

    try {
      await fetch(`/api/public-trips/${tripId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
    } catch {}
  }

  function useAsTemplate(trip: FeedTrip & { likes: number }) {
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + (trip.daysCount - 1) * 86400000).toISOString().slice(0, 10);

    const days = trip.days.map((day, i) => ({
      date: new Date(today.getTime() + i * 86400000).toISOString().slice(0, 10),
      places: day.places.map((p, j) => ({
        contentId: `feed_${trip.id}_d${i}_p${j}`,
        title: p.title,
        address: p.address,
        category: p.category,
      })),
    }));

    localStorage.setItem('course_draft', JSON.stringify({
      title: trip.tripTitle,
      startDate,
      endDate,
      days,
    }));
    router.push('/plan?fromCourse=1');
  }

  if (trips.length === 0) return null;

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">다른 가족의 여행 일지</h2>
        <span className="text-xs text-gray-400">❤️ 좋아요 순</span>
      </div>

      <div className="flex flex-col gap-4">
        {trips.map(trip => {
          const isLiked = likedIds.has(trip.id);
          const isExpanded = expanded === trip.id;

          return (
            <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* 헤더 */}
              <div className={`bg-gradient-to-r ${trip.gradient} px-4 pt-4 pb-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-base">{trip.userEmoji}</span>
                  <div>
                    <p className="text-white text-xs font-bold leading-none">{trip.userName}</p>
                    <p className="text-white/70 text-[10px] mt-0.5">{trip.childAgeLabel} 부모</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                    <span className="text-[10px] text-white font-semibold">📍 {trip.region}</span>
                  </div>
                </div>
                <p className="text-white font-bold text-sm leading-snug">{trip.tripTitle}</p>
                <p className="text-white/75 text-xs mt-1 leading-relaxed">{trip.summary}</p>
              </div>

              {/* 태그 */}
              <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-gray-50">
                {trip.tags.map(tag => (
                  <span key={tag} className="flex-shrink-0 text-[10px] font-medium bg-gray-50 text-gray-500 rounded-full px-2.5 py-1 border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Day별 장소 */}
              <div className="px-4 py-3">
                {(isExpanded ? trip.days : trip.days.slice(0, 1)).map((day, dayIdx) => (
                  <div key={dayIdx} className="mb-3 last:mb-0">
                    <p className="text-[11px] font-bold text-blue-500 mb-1.5">{day.label}</p>
                    <div className="flex flex-col gap-1.5">
                      {day.places.map((place, pIdx) => (
                        <div key={pIdx} className="flex gap-2 items-start">
                          <span className="w-4 h-4 rounded-full bg-blue-50 text-[9px] font-bold text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {pIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 leading-tight">{place.title}</p>
                            {place.note && (
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">💬 {place.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {trip.days.length > 1 && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : trip.id)}
                    className="text-[11px] text-blue-500 font-medium mt-1"
                  >
                    {isExpanded ? '▲ 접기' : `▼ Day 2~${trip.days.length} 더 보기`}
                  </button>
                )}
              </div>

              {/* 푸터: 좋아요 + 일정 만들기 */}
              <div className="flex items-center gap-2 px-4 pb-4 pt-1 border-t border-gray-50">
                <button
                  onClick={() => toggleLike(trip.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isLiked
                      ? 'bg-red-50 text-red-500 border border-red-100'
                      : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}
                >
                  {isLiked ? '❤️' : '🤍'} {trip.likes}
                </button>
                <button
                  onClick={() => useAsTemplate(trip)}
                  className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-xl active:bg-blue-700"
                >
                  이 일정 참고해서 만들기 →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
