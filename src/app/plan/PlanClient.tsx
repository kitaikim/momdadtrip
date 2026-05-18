'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const DEVICE_KEY = 'momdadtrip_device_id';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

type PlaceCategory = 'attraction' | 'dining' | 'accommodation' | 'shopping';

const CATEGORY_META: Record<PlaceCategory, { label: string; emoji: string; color: string }> = {
  attraction:    { label: '볼거리', emoji: '🏔️', color: 'bg-sky-50 text-sky-600' },
  dining:        { label: '식사',   emoji: '🍽️', color: 'bg-orange-50 text-orange-600' },
  accommodation: { label: '숙소',   emoji: '🏨', color: 'bg-purple-50 text-purple-600' },
  shopping:      { label: '쇼핑',   emoji: '🛍️', color: 'bg-pink-50 text-pink-600' },
};

const CATEGORY_ORDER: PlaceCategory[] = ['attraction', 'dining', 'accommodation', 'shopping'];

function contentTypeToCategory(contentTypeId?: string): PlaceCategory {
  switch (contentTypeId) {
    case '32': return 'accommodation';
    case '39': return 'dining';
    case '38': return 'shopping';
    default:   return 'attraction';
  }
}

interface TripPlace {
  contentId: string;
  title: string;
  address: string;
  image?: string;
  category: PlaceCategory;
}

interface TripDay {
  date: string;
  places: TripPlace[];
}

interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

async function loadTripFromDB(deviceId: string): Promise<Trip | null> {
  const { data } = await supabase
    .from('trips')
    .select('*')
    .eq('device_id', deviceId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    startDate: data.start_date,
    endDate: data.end_date,
    days: (data.days as TripDay[]).map(d => ({
      ...d,
      places: d.places.map(p => ({
        ...p,
        category: p.category ?? contentTypeToCategory(undefined),
      })),
    })),
  };
}

async function saveTripToDB(deviceId: string, trip: Trip): Promise<void> {
  await supabase.from('trips').upsert({
    id: trip.id,
    device_id: deviceId,
    title: trip.title,
    start_date: trip.startDate,
    end_date: trip.endDate,
    days: trip.days,
    updated_at: new Date().toISOString(),
  });
}

async function deleteTripFromDB(tripId: string): Promise<void> {
  await supabase.from('trips').delete().eq('id', tripId);
}

export default function PlanClient() {
  const searchParams = useSearchParams();
  const addContentId = searchParams.get('add');

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [addingPlace, setAddingPlace] = useState<TripPlace | null>(null);
  const [deviceId, setDeviceId] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadTripFromDB(id).then((t) => {
      setTrip(t);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!addContentId || !loaded) return;
    fetch(`/api/place?contentid=${addContentId}`)
      .then(r => r.json())
      .then((data) => {
        if (data.contentId) {
          setAddingPlace({
            contentId: data.contentId,
            title: data.title,
            address: data.address,
            image: data.image ?? undefined,
            category: contentTypeToCategory(data.contentTypeId),
          });
        }
      });
  }, [addContentId, loaded]);

  const persistTrip = useCallback(async (updated: Trip) => {
    setTrip(updated);
    setSaving(true);
    await saveTripToDB(deviceId, updated);
    setSaving(false);
  }, [deviceId]);

  const createTrip = useCallback(async () => {
    if (!newTitle || !newStart || !newEnd) return;
    const dates = dateRange(newStart, newEnd);
    const newTrip: Trip = {
      id: Date.now().toString(),
      title: newTitle,
      startDate: newStart,
      endDate: newEnd,
      days: dates.map(date => ({ date, places: [] })),
    };
    setShowNewTrip(false);
    await persistTrip(newTrip);
  }, [newTitle, newStart, newEnd, persistTrip]);

  const addPlaceToDay = useCallback(async (place: TripPlace, date: string) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d =>
        d.date === date ? { ...d, places: [...d.places, place] } : d
      ),
    };
    setAddingPlace(null);
    window.history.replaceState({}, '', '/plan');
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const removePlace = useCallback(async (date: string, contentId: string) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d =>
        d.date === date
          ? { ...d, places: d.places.filter(p => p.contentId !== contentId) }
          : d
      ),
    };
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const deleteTrip = useCallback(async () => {
    if (!trip) return;
    await deleteTripFromDB(trip.id);
    setTrip(null);
  }, [trip]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">여행 계획</h1>
        {saving && <span className="text-xs text-sky-400">저장 중...</span>}
      </div>

      <div className="pt-20 px-4">
        {/* 여행 없을 때 */}
        {!trip && !showNewTrip && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">📅</span>
            <p className="text-gray-500 text-sm text-center">
              아직 여행 계획이 없어요.<br />새 일정을 만들어 볼까요?
            </p>
            <button
              onClick={() => setShowNewTrip(true)}
              className="mt-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-sky-200"
            >
              + 새 일정 만들기
            </button>
          </div>
        )}

        {/* 새 일정 폼 */}
        {!trip && showNewTrip && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">새 일정 만들기</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">일정 이름</label>
                <input
                  type="text"
                  placeholder="예: 강릉 2박 3일 가족 여행"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium block mb-1">출발일</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium block mb-1">귀가일</label>
                  <input type="date" value={newEnd} min={newStart} onChange={e => setNewEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
              </div>
              <button onClick={createTrip} disabled={!newTitle || !newStart || !newEnd}
                className="w-full bg-sky-500 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-2xl font-semibold text-sm">
                일정 만들기
              </button>
              <button onClick={() => setShowNewTrip(false)} className="text-sm text-gray-400 text-center">취소</button>
            </div>
          </div>
        )}

        {/* 여행 있을 때 */}
        {trip && (
          <>
            {/* 여행 제목 카드 */}
            <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-5 text-white mb-4 shadow-md shadow-sky-200">
              <p className="text-xs opacity-80 mb-1">
                {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                <span className="ml-2">({trip.days.length}일)</span>
              </p>
              <h2 className="text-lg font-bold leading-tight">{trip.title}</h2>
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-3">
                  {CATEGORY_ORDER.map(cat => {
                    const count = trip.days.flatMap(d => d.places).filter(p => p.category === cat).length;
                    if (count === 0) return null;
                    const { emoji, label } = CATEGORY_META[cat];
                    return (
                      <span key={cat} className="text-xs opacity-80">
                        {emoji} {label} {count}
                      </span>
                    );
                  })}
                </div>
                <button onClick={deleteTrip} className="text-xs opacity-60 underline">일정 삭제</button>
              </div>
            </div>

            {/* 날짜별 카드 */}
            {trip.days.map((day, dayIdx) => {
              const byCategory = CATEGORY_ORDER.reduce<Record<PlaceCategory, TripPlace[]>>((acc, cat) => {
                acc[cat] = day.places.filter(p => p.category === cat);
                return acc;
              }, { attraction: [], dining: [], accommodation: [], shopping: [] });

              const hasAny = day.places.length > 0;

              return (
                <div key={day.date} className="mb-4">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">
                      Day {dayIdx + 1}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(day.date)}</span>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {!hasAny && (
                      <div className="px-4 py-5 text-center">
                        <p className="text-sm text-gray-300">장소를 추가해보세요</p>
                      </div>
                    )}

                    {/* 카테고리별 섹션 */}
                    {hasAny && CATEGORY_ORDER.map(cat => {
                      const places = byCategory[cat];
                      if (places.length === 0) return null;
                      const { label, emoji, color } = CATEGORY_META[cat];

                      return (
                        <div key={cat}>
                          {/* 카테고리 헤더 */}
                          <div className={`flex items-center gap-1.5 px-4 py-2 ${color}`}>
                            <span className="text-sm">{emoji}</span>
                            <span className="text-xs font-bold">{label}</span>
                          </div>

                          <div className="divide-y divide-gray-50">
                            {places.map((place) => (
                              <div key={place.contentId} className="flex items-center gap-3 px-4 py-3">
                                {place.image ? (
                                  <img src={place.image} alt={place.title}
                                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                                    {emoji}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{place.title}</p>
                                  <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
                                </div>
                                <button
                                  onClick={() => removePlace(day.date, place.contentId)}
                                  className="text-gray-300 text-lg ml-1 flex-shrink-0"
                                >×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-gray-50">
                      <Link
                        href={`/explore?day=${day.date}`}
                        className="flex items-center justify-center gap-1 px-4 py-3 text-sm text-sky-500 font-medium"
                      >
                        + 장소 추가
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 장소 추가 모달 */}
      {addingPlace && trip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-5 pb-10">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_META[addingPlace.category].color}`}>
                {CATEGORY_META[addingPlace.category].emoji} {CATEGORY_META[addingPlace.category].label}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">어느 날에 추가할까요?</h3>
            <p className="text-sm text-gray-500 mb-4">{addingPlace.title}</p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {trip.days.map((day, i) => (
                <button key={day.date} onClick={() => addPlaceToDay(addingPlace, day.date)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 text-left">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">Day {i + 1}</span>
                  <span className="text-sm text-gray-700">{formatDate(day.date)}</span>
                  <span className="text-xs text-gray-400 ml-auto">{day.places.length}개</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setAddingPlace(null); window.history.replaceState({}, '', '/plan'); }}
              className="mt-4 w-full text-sm text-gray-400 text-center">취소</button>
          </div>
        </div>
      )}

      {/* 장소 추가하려는데 일정 없는 경우 */}
      {addingPlace && !trip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-5 pb-10">
            <h3 className="text-base font-bold text-gray-900 mb-1">먼저 일정을 만들어 주세요</h3>
            <p className="text-sm text-gray-500 mb-4">{addingPlace.title}을 추가하려면 일정이 필요해요.</p>
            <button onClick={() => { setAddingPlace(null); setShowNewTrip(true); window.history.replaceState({}, '', '/plan'); }}
              className="w-full bg-sky-500 text-white py-3 rounded-2xl font-semibold text-sm">새 일정 만들기</button>
            <button onClick={() => { setAddingPlace(null); window.history.replaceState({}, '', '/plan'); }}
              className="mt-3 w-full text-sm text-gray-400 text-center">취소</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-0.5 ${href === '/plan' ? 'text-sky-500' : ''}`}>
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/plan' ? 'text-sky-500 font-semibold' : 'text-gray-500'}`}>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
