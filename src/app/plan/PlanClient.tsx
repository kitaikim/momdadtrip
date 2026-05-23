'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { db } from '@/lib/supabase';
import ChecklistSection from './ChecklistSection';
import PlanMapView from './PlanMapView';

const DEVICE_KEY = 'momdadtrip_device_id';
const TRIP_CACHE_KEY = 'momdadtrip_trip_cache';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function saveTripCache(trip: Trip) {
  try { localStorage.setItem(TRIP_CACHE_KEY, JSON.stringify(trip)); } catch {}
}

function loadTripCache(): Trip | null {
  try {
    const raw = localStorage.getItem(TRIP_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
  mapx?: string;
  mapy?: string;
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
  departure?: string;
  days: TripDay[];
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function dayDistance(places: TripPlace[]): number {
  let total = 0;
  for (let i = 1; i < places.length; i++) {
    const a = places[i - 1], b = places[i];
    if (a.mapx && a.mapy && b.mapx && b.mapy) {
      total += haversine(parseFloat(a.mapy), parseFloat(a.mapx), parseFloat(b.mapy), parseFloat(b.mapx));
    }
  }
  return total;
}

function nearestNeighborSort(places: TripPlace[]): TripPlace[] {
  if (places.length <= 2) return places;
  const remaining = [...places.slice(1)];
  const result = [places[0]];
  while (remaining.length > 0) {
    const last = result[result.length - 1];
    if (!last.mapx || !last.mapy) { result.push(...remaining.splice(0, 1)); continue; }
    let nearestIdx = 0, minDist = Infinity;
    remaining.forEach((p, i) => {
      if (!p.mapx || !p.mapy) return;
      const d = haversine(parseFloat(last.mapy!), parseFloat(last.mapx!), parseFloat(p.mapy!), parseFloat(p.mapx!));
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });
    result.push(...remaining.splice(nearestIdx, 1));
  }
  return result;
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
  const { data, error } = await db.select('trips', { device_id: deviceId }, { order: 'updated_at.desc', limit: 1 });
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id as string,
    title: row.title as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    days: (row.days as TripDay[]).map((d: TripDay) => ({
      ...d,
      places: d.places.map(p => ({
        ...p,
        category: p.category ?? contentTypeToCategory(undefined),
      })),
    })),
  };
}

async function saveTripToDB(deviceId: string, trip: Trip): Promise<string | null> {
  const { error } = await db.upsert('trips', {
    id: trip.id,
    device_id: deviceId,
    title: trip.title,
    start_date: trip.startDate,
    end_date: trip.endDate,
    days: trip.days,
    updated_at: new Date().toISOString(),
  });
  return error ?? null;
}

async function deleteTripFromDB(tripId: string): Promise<void> {
  await db.delete('trips', { id: tripId });
}

export default function PlanClient() {
  const searchParams = useSearchParams();
  const addContentId = searchParams.get('add');

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [addingPlace, setAddingPlace] = useState<TripPlace | null>(null);
  const [deviceId, setDeviceId] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newDeparture, setNewDeparture] = useState('');
  const [courseDraft, setCourseDraft] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    days: { date: string; places: { contentId: string; title: string; address: string; category: string }[] }[];
  } | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    // 코스 draft 확인
    const draft = localStorage.getItem('course_draft');
    if (draft) {
      try { setCourseDraft(JSON.parse(draft)); } catch {}
      localStorage.removeItem('course_draft');
    }
    loadTripFromDB(id)
      .then((t) => {
        if (t) {
          // departure는 Supabase에 컬럼 없으므로 로컬 캐시에서 병합
          const cached = loadTripCache();
          if (cached && cached.id === t.id && cached.departure) {
            t.departure = cached.departure;
          }
          saveTripCache(t);
          setTrip(t);
        } else {
          const cached = loadTripCache();
          if (cached) setTrip(cached);
        }
      })
      .catch(() => {
        const cached = loadTripCache();
        if (cached) setTrip(cached);
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!addContentId || !loaded) return;
    fetch(`/api/place?contentid=${addContentId}`)
      .then(r => r.json())
      .then((data) => {
        if (!data.contentId) return;
        const place: TripPlace = {
          contentId: data.contentId,
          title: data.title,
          address: data.address,
          image: data.image ?? undefined,
          category: contentTypeToCategory(data.contentTypeId),
          mapx: data.mapx ?? undefined,
          mapy: data.mapy ?? undefined,
        };
        // Day 탭에서 "장소 추가" 눌렀을 때 자동으로 해당 날에 추가
        const targetDay = localStorage.getItem('plan_target_day');
        if (targetDay && trip) {
          const dayExists = trip.days.some(d => d.date === targetDay);
          if (dayExists) {
            localStorage.removeItem('plan_target_day');
            addPlaceToDay(place, targetDay);
            return;
          }
        }
        setAddingPlace(place);
      });
  }, [addContentId, loaded, trip]);

  const persistTrip = useCallback(async (updated: Trip) => {
    setTrip(updated);
    saveTripCache(updated); // 로컬 캐시에 즉시 저장
    setSaving(true);
    setSaveError(null);
    const currentDeviceId = getDeviceId();
    const err = await saveTripToDB(currentDeviceId, updated);
    if (err) setSaveError(err);
    setSaving(false);
  }, []);

  const createTrip = useCallback(async () => {
    if (!newTitle || !newStart || !newEnd) return;
    const dates = dateRange(newStart, newEnd);
    const newTrip: Trip = {
      id: Date.now().toString(),
      title: newTitle,
      startDate: newStart,
      endDate: newEnd,
      departure: newDeparture.trim() || undefined,
      days: dates.map(date => ({ date, places: [] })),
    };
    setShowNewTrip(false);
    await persistTrip(newTrip);
  }, [newTitle, newStart, newEnd, persistTrip]);

  const importCourse = useCallback(async () => {
    if (!courseDraft) return;
    const newTrip: Trip = {
      id: Date.now().toString(),
      title: courseDraft.title,
      startDate: courseDraft.startDate,
      endDate: courseDraft.endDate,
      days: courseDraft.days.map(d => ({
        date: d.date,
        places: d.places.map(p => ({
          contentId: p.contentId,
          title: p.title,
          address: p.address,
          category: (p.category as PlaceCategory) ?? 'attraction',
        })),
      })),
    };
    setCourseDraft(null);
    await persistTrip(newTrip);
  }, [courseDraft, persistTrip]);

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
    try { localStorage.removeItem(TRIP_CACHE_KEY); } catch {}
    setTrip(null);
  }, [trip]);

  const [dragging, setDragging] = useState<{ date: string; idx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ date: string; idx: number } | null>(null);

  const reorderPlace = useCallback(async (date: string, fromIdx: number, toIdx: number) => {
    if (!trip || fromIdx === toIdx) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d => {
        if (d.date !== date) return d;
        const places = [...d.places];
        const [moved] = places.splice(fromIdx, 1);
        places.splice(toIdx, 0, moved);
        return { ...d, places };
      }),
    };
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const movePlaceBetweenDays = useCallback(async (fromDate: string, fromIdx: number, toDate: string, toIdx: number) => {
    if (!trip) return;
    let moved: TripPlace | null = null;
    const stage1 = {
      ...trip,
      days: trip.days.map(d => {
        if (d.date !== fromDate) return d;
        const places = [...d.places];
        [moved] = places.splice(fromIdx, 1);
        return { ...d, places };
      }),
    };
    if (!moved) return;
    const movedPlace = moved;
    const updated: Trip = {
      ...stage1,
      days: stage1.days.map(d => {
        if (d.date !== toDate) return d;
        const places = [...d.places];
        places.splice(toIdx, 0, movedPlace);
        return { ...d, places };
      }),
    };
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const movePlaceToDay = useCallback(async (contentId: string, fromDayIdx: number, toDayIdx: number) => {
    if (!trip) return;
    let movedPlace: TripPlace | null = null;
    const stage1: Trip = {
      ...trip,
      days: trip.days.map((d, i) => {
        if (i !== fromDayIdx) return d;
        const places = [...d.places];
        const idx = places.findIndex(p => p.contentId === contentId);
        if (idx === -1) return d;
        [movedPlace] = places.splice(idx, 1);
        return { ...d, places };
      }),
    };
    if (!movedPlace) return;
    const fp = movedPlace;
    const updated: Trip = {
      ...stage1,
      days: stage1.days.map((d, i) => {
        if (i !== toDayIdx) return d;
        return { ...d, places: [...d.places, fp] };
      }),
    };
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const optimizeRoutes = useCallback(async () => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d => ({
        ...d,
        places: nearestNeighborSort(d.places),
      })),
    };
    await persistTrip(updated);
  }, [trip, persistTrip]);

  const [showMap, setShowMap] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareTrip = useCallback(() => {
    if (!trip) return;
    const payload = { title: trip.title, start: trip.startDate, end: trip.endDate, days: trip.days };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const url = `${window.location.origin}/trip?d=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
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
        {saveError && <span className="text-xs text-red-400 truncate max-w-48">{saveError}</span>}
      </div>

      <div className="pt-20 px-4">
        {/* 코스 import 배너 */}
        {courseDraft && (
          <div className="mb-4 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗺️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{courseDraft.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">이 코스로 일정을 바로 만들까요?</p>
                <div className="flex gap-2 mt-2.5">
                  <button onClick={importCourse}
                    className="flex-1 bg-sky-500 text-white py-2 rounded-xl text-xs font-bold">
                    일정으로 만들기
                  </button>
                  <button onClick={() => setCourseDraft(null)}
                    className="px-3 py-2 rounded-xl text-xs text-gray-400 border border-gray-200">
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">출발지 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 서울시청, 수원역"
                  value={newDeparture}
                  onChange={e => setNewDeparture(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
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
              {trip.departure && (
                <p className="text-xs opacity-70 mb-0.5">🏠 {trip.departure} 출발</p>
              )}
              <h2 className="text-lg font-bold leading-tight">{trip.title}</h2>
              <div className="flex gap-3 mt-2 flex-wrap">
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
              {(() => {
                const totalDist = trip.days.reduce((s, d) => s + dayDistance(d.places), 0);
                return totalDist > 0 ? (
                  <p className="text-xs opacity-70 mt-1">📍 총 이동거리 약 {totalDist.toFixed(0)}km</p>
                ) : null;
              })()}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setShowMap(true)}
                  className="flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-3 text-sm font-bold text-white active:bg-white/30"
                >
                  🗺️ 지도로 보기
                </button>
                <button
                  onClick={shareTrip}
                  className="flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-3 text-sm font-bold text-white active:bg-white/30"
                >
                  {shareCopied ? '✓ 복사됨!' : '🔗 링크 공유'}
                </button>
              </div>
              <button
                onClick={optimizeRoutes}
                className="mt-2 w-full flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-2.5 text-sm font-bold text-white active:bg-white/30"
              >
                ✨ AI 경로 최적화 (거리 기준)
              </button>
              <button onClick={deleteTrip} className="mt-1.5 text-xs text-white/40 text-right w-full py-1">
                일정 삭제
              </button>
            </div>

            {/* 날짜별 카드 */}
            {trip.days.map((day, dayIdx) => (
              <div key={day.date} className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">
                    Day {dayIdx + 1}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(day.date)}</span>
                  {(() => {
                    const dist = dayDistance(day.places);
                    return dist > 0 ? (
                      <span className="text-xs text-gray-400 ml-auto">{dist.toFixed(1)}km</span>
                    ) : null;
                  })()}
                </div>

                <div
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragging && dragging.date !== day.date) {
                      movePlaceBetweenDays(dragging.date, dragging.idx, day.date, day.places.length);
                    }
                    setDragging(null); setDragOver(null);
                  }}
                >
                  {day.places.length === 0 && (
                    <div className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-300">장소를 추가해보세요</p>
                    </div>
                  )}

                  {/* 드래그 정렬 플랫 리스트 */}
                  <div className="divide-y divide-gray-50">
                    {day.places.map((place, placeIdx) => {
                      const { emoji, color, label } = CATEGORY_META[place.category];
                      const isDragging = dragging?.date === day.date && dragging?.idx === placeIdx;
                      const isDragOver = dragOver?.date === day.date && dragOver?.idx === placeIdx;
                      return (
                        <div
                          key={place.contentId}
                          draggable
                          onDragStart={() => setDragging({ date: day.date, idx: placeIdx })}
                          onDragOver={e => { e.preventDefault(); setDragOver({ date: day.date, idx: placeIdx }); }}
                          onDrop={() => {
                            if (dragging) {
                              if (dragging.date === day.date) {
                                reorderPlace(day.date, dragging.idx, placeIdx);
                              } else {
                                movePlaceBetweenDays(dragging.date, dragging.idx, day.date, placeIdx);
                              }
                            }
                            setDragging(null); setDragOver(null);
                          }}
                          onDragEnd={() => { setDragging(null); setDragOver(null); }}
                          className={`flex items-center gap-2 px-3 py-3 transition-all ${isDragging ? 'opacity-40' : ''} ${isDragOver ? 'bg-sky-50 border-l-2 border-sky-400' : ''}`}
                        >
                          <span className="text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0 select-none text-base leading-none">⠿</span>
                          {place.image ? (
                            <img src={place.image} alt={place.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-base flex-shrink-0">{emoji}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{emoji} {label}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{place.title}</p>
                            <p className="text-xs text-gray-400 truncate">{place.address}</p>
                          </div>
                          <button onClick={() => removePlace(day.date, place.contentId)} className="text-gray-300 text-lg flex-shrink-0">×</button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-50">
                    <Link
                      href="/explore"
                      onClick={() => localStorage.setItem('plan_target_day', day.date)}
                      className="flex items-center justify-center gap-1 px-4 py-3 text-sm text-sky-500 font-medium"
                    >
                      + 장소 추가
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {/* 여행 준비 체크리스트 */}
            <ChecklistSection tripId={trip.id} />
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

      <BottomNav />

      {/* 지도 뷰 */}
      {showMap && trip && (
        <PlanMapView
          places={trip.days.flatMap((day, dayIdx) =>
            day.places.map((p, idxInDay) => ({
              title: p.title,
              address: p.address,
              mapx: p.mapx,
              mapy: p.mapy,
              dayIdx,
              idxInDay,
              category: p.category,
              contentId: p.contentId,
            }))
          )}
          dayCount={trip.days.length}
          departure={trip.departure}
          onClose={() => setShowMap(false)}
          onMoveToDay={movePlaceToDay}
        />
      )}
    </main>
  );
}
