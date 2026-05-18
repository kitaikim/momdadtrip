'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TripPlace {
  contentId: string;
  title: string;
  address: string;
  image?: string;
}

interface TripDay {
  date: string; // YYYY-MM-DD
  places: TripPlace[];
}

interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
}

const STORAGE_KEY = 'momdadtrip_plan';

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

function loadTrip(): Trip | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTrip(trip: Trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}

export default function PlanClient() {
  const searchParams = useSearchParams();
  const addContentId = searchParams.get('add');

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [addingPlace, setAddingPlace] = useState<TripPlace | null>(null);
  const [selectedDay, setSelectedDay] = useState('');

  // 새 일정 폼 state
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  useEffect(() => {
    const stored = loadTrip();
    setTrip(stored);
    setLoaded(true);
  }, []);

  // ?add=contentid 처리
  useEffect(() => {
    if (!addContentId || !loaded) return;
    fetch(`/api/place?contentid=${addContentId}`)
      .then(r => r.json())
      .then((data) => {
        if (data.contentId) setAddingPlace(data);
      });
  }, [addContentId, loaded]);

  const createTrip = useCallback(() => {
    if (!newTitle || !newStart || !newEnd) return;
    const dates = dateRange(newStart, newEnd);
    const newTrip: Trip = {
      id: Date.now().toString(),
      title: newTitle,
      startDate: newStart,
      endDate: newEnd,
      days: dates.map(date => ({ date, places: [] })),
    };
    setTrip(newTrip);
    saveTrip(newTrip);
    setShowNewTrip(false);
  }, [newTitle, newStart, newEnd]);

  const addPlaceToDay = useCallback((place: TripPlace, date: string) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d =>
        d.date === date
          ? { ...d, places: [...d.places, place] }
          : d
      ),
    };
    setTrip(updated);
    saveTrip(updated);
    setAddingPlace(null);
    setSelectedDay('');
    // URL에서 ?add 파라미터 제거
    window.history.replaceState({}, '', '/plan');
  }, [trip]);

  const removePlace = useCallback((date: string, contentId: string) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d =>
        d.date === date
          ? { ...d, places: d.places.filter(p => p.contentId !== contentId) }
          : d
      ),
    };
    setTrip(updated);
    saveTrip(updated);
  }, [trip]);

  const movePlace = useCallback((date: string, index: number, dir: -1 | 1) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      days: trip.days.map(d => {
        if (d.date !== date) return d;
        const places = [...d.places];
        const target = index + dir;
        if (target < 0 || target >= places.length) return d;
        [places[index], places[target]] = [places[target], places[index]];
        return { ...d, places };
      }),
    };
    setTrip(updated);
    saveTrip(updated);
  }, [trip]);

  const deleteTrip = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTrip(null);
  }, []);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 pt-12 pb-3">
        <h1 className="text-lg font-bold text-gray-900">여행 계획</h1>
      </div>

      <div className="pt-20 px-4">
        {/* 여행 계획 없을 때 */}
        {!trip && !showNewTrip && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">📅</span>
            <p className="text-gray-500 text-sm text-center">
              아직 여행 계획이 없어요.<br />
              새 일정을 만들어 볼까요?
            </p>
            <button
              onClick={() => setShowNewTrip(true)}
              className="mt-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-sky-200"
            >
              + 새 일정 만들기
            </button>
          </div>
        )}

        {/* 새 일정 만들기 폼 */}
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
                  <input
                    type="date"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium block mb-1">귀가일</label>
                  <input
                    type="date"
                    value={newEnd}
                    min={newStart}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              <button
                onClick={createTrip}
                disabled={!newTitle || !newStart || !newEnd}
                className="w-full bg-sky-500 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-2xl font-semibold text-sm"
              >
                일정 만들기
              </button>
              <button
                onClick={() => setShowNewTrip(false)}
                className="text-sm text-gray-400 text-center"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 여행 계획 있을 때 */}
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
                <p className="text-xs opacity-70">
                  총 {trip.days.reduce((sum, d) => sum + d.places.length, 0)}개 장소
                </p>
                <button
                  onClick={deleteTrip}
                  className="text-xs opacity-60 underline"
                >
                  일정 삭제
                </button>
              </div>
            </div>

            {/* 날짜별 카드 */}
            {trip.days.map((day, dayIdx) => (
              <div key={day.date} className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">
                    Day {dayIdx + 1}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(day.date)}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {day.places.length === 0 ? (
                    <div className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-300">장소를 추가해보세요</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {day.places.map((place, idx) => (
                        <div key={place.contentId} className="flex items-center gap-3 px-4 py-3">
                          {place.image ? (
                            <img
                              src={place.image}
                              alt={place.title}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center text-2xl flex-shrink-0">
                              🏔️
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{place.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{place.address}</p>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <button
                              onClick={() => movePlace(day.date, idx, -1)}
                              disabled={idx === 0}
                              className="text-gray-300 disabled:opacity-20 text-xs px-1"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => movePlace(day.date, idx, 1)}
                              disabled={idx === day.places.length - 1}
                              className="text-gray-300 disabled:opacity-20 text-xs px-1"
                            >
                              ▼
                            </button>
                          </div>
                          <button
                            onClick={() => removePlace(day.date, place.contentId)}
                            className="text-gray-300 text-lg ml-1 flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

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
            ))}
          </>
        )}
      </div>

      {/* 장소 추가 모달 — ?add=contentid 처리 */}
      {addingPlace && trip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-5 pb-10">
            <h3 className="text-base font-bold text-gray-900 mb-1">어느 날에 추가할까요?</h3>
            <p className="text-sm text-gray-500 mb-4">{addingPlace.title}</p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {trip.days.map((day, i) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDay(day.date);
                    addPlaceToDay(addingPlace, day.date);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 text-left"
                >
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">
                    Day {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{formatDate(day.date)}</span>
                  <span className="text-xs text-gray-400 ml-auto">{day.places.length}개</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setAddingPlace(null);
                window.history.replaceState({}, '', '/plan');
              }}
              className="mt-4 w-full text-sm text-gray-400 text-center"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ?add인데 trip 없는 경우 */}
      {addingPlace && !trip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-5 pb-10">
            <h3 className="text-base font-bold text-gray-900 mb-1">먼저 일정을 만들어 주세요</h3>
            <p className="text-sm text-gray-500 mb-4">{addingPlace.title}을 추가하려면 일정이 필요해요.</p>
            <button
              onClick={() => {
                setAddingPlace(null);
                setShowNewTrip(true);
                window.history.replaceState({}, '', '/plan');
              }}
              className="w-full bg-sky-500 text-white py-3 rounded-2xl font-semibold text-sm"
            >
              새 일정 만들기
            </button>
            <button
              onClick={() => {
                setAddingPlace(null);
                window.history.replaceState({}, '', '/plan');
              }}
              className="mt-3 w-full text-sm text-gray-400 text-center"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 ${href === '/plan' ? 'text-sky-500' : ''}`}
          >
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/plan' ? 'text-sky-500 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
