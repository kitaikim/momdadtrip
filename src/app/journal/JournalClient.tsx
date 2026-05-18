'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/supabase';

const DEVICE_KEY = 'momdadtrip_device_id';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

interface TripPlace {
  contentId: string;
  title: string;
  address: string;
  image?: string;
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

interface JournalEntry {
  id: string;
  date: string;
  memo: string;
  photo_url?: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

async function loadTrip(deviceId: string): Promise<Trip | null> {
  const { data } = await db.select('trips', { device_id: deviceId }, { order: 'updated_at.desc', limit: 1 });
  if (!data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id as string,
    title: row.title as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    days: row.days as TripDay[],
  };
}

async function loadEntries(deviceId: string, tripId: string): Promise<JournalEntry[]> {
  const { data } = await db.select('journal_entries', { device_id: deviceId, trip_id: tripId });
  return (data ?? []).map(r => ({
    id: r.id as string,
    date: r.date as string,
    memo: (r.memo as string) ?? '',
    photo_url: r.photo_url as string | undefined,
  }));
}

async function saveEntry(deviceId: string, tripId: string, date: string, memo: string, existingId?: string): Promise<string> {
  const id = existingId ?? `${tripId}_${date}`;
  await db.upsert('journal_entries', {
    id,
    device_id: deviceId,
    trip_id: tripId,
    date,
    memo,
    updated_at: new Date().toISOString(),
  });
  return id;
}

interface AiContent {
  blog: string;
  sns: string;
}

export default function JournalClient() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [draftMemo, setDraftMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [aiContent, setAiContent] = useState<AiContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiTab, setAiTab] = useState<'blog' | 'sns'>('blog');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadTrip(id)
      .then(async (t) => {
        setTrip(t);
        if (t) {
          const list = await loadEntries(id, t.id);
          const map: Record<string, JournalEntry> = {};
          list.forEach(e => { map[e.date] = e; });
          setEntries(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const startEdit = useCallback((date: string) => {
    setEditingDate(date);
    setDraftMemo(entries[date]?.memo ?? '');
  }, [entries]);

  const generateAiContent = useCallback(async () => {
    if (!trip) return;
    setGenerating(true);
    setAiContent(null);
    const days = trip.days.map(d => ({
      date: d.date,
      places: d.places.map(p => ({ title: p.title, address: p.address })),
      memo: entries[d.date]?.memo ?? '',
    }));
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          days,
        }),
      });
      const data = await res.json();
      setAiContent(data);
    } catch {
      alert('콘텐츠 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  }, [trip, entries]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const saveMemo = useCallback(async () => {
    if (!trip || !editingDate) return;
    setSaving(true);
    const existing = entries[editingDate];
    const id = await saveEntry(deviceId, trip.id, editingDate, draftMemo, existing?.id);
    setEntries(prev => ({
      ...prev,
      [editingDate]: { id, date: editingDate, memo: draftMemo },
    }));
    setEditingDate(null);
    setSaving(false);
  }, [trip, editingDate, draftMemo, entries, deviceId]);

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
        <h1 className="text-lg font-bold text-gray-900">여행 일지</h1>
      </div>

      <div className="pt-20 px-4">
        {/* 여행 계획 없음 */}
        {!trip && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">📔</span>
            <p className="text-gray-500 text-sm text-center">
              여행 계획을 먼저 만들어야<br />일지를 쓸 수 있어요.
            </p>
            <Link
              href="/plan"
              className="mt-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-sky-200"
            >
              여행 계획 만들기
            </Link>
          </div>
        )}

        {/* 여행 있음 */}
        {trip && (
          <>
            {/* 여행 제목 */}
            <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-5 text-white mb-4 shadow-md shadow-sky-200">
              <p className="text-xs opacity-80 mb-1">{trip.days.length}일간의 여행</p>
              <h2 className="text-lg font-bold">{trip.title}</h2>
              <p className="text-xs opacity-70 mt-1">
                {Object.keys(entries).length}/{trip.days.length}일 기록 완료
              </p>
            </div>

            {/* AI 콘텐츠 생성 버튼 */}
            <button
              onClick={generateAiContent}
              disabled={generating}
              className="w-full mb-5 bg-gradient-to-r from-violet-500 to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin text-base">✨</span>
                  AI가 콘텐츠를 생성하고 있어요...
                </>
              ) : (
                <>
                  ✨ AI 블로그·SNS 콘텐츠 생성
                </>
              )}
            </button>

            {/* AI 생성 결과 */}
            {aiContent && (
              <div className="bg-white rounded-2xl shadow-sm mb-5 overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setAiTab('blog')}
                    className={`flex-1 py-3 text-sm font-semibold ${aiTab === 'blog' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-400'}`}
                  >
                    📝 블로그 초안
                  </button>
                  <button
                    onClick={() => setAiTab('sns')}
                    className={`flex-1 py-3 text-sm font-semibold ${aiTab === 'sns' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-400'}`}
                  >
                    📱 인스타 캡션
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {aiTab === 'blog' ? aiContent.blog : aiContent.sns}
                  </p>
                  <button
                    onClick={() => copyToClipboard(aiTab === 'blog' ? aiContent.blog : aiContent.sns)}
                    className="mt-3 w-full py-2.5 rounded-xl border border-purple-200 text-purple-600 text-sm font-semibold"
                  >
                    {copied ? '✓ 복사됨!' : '클립보드에 복사'}
                  </button>
                </div>
              </div>
            )}

            {/* 날짜별 일지 */}
            <div className="flex flex-col gap-4">
              {trip.days.map((day, idx) => {
                const entry = entries[day.date];
                const isEditing = editingDate === day.date;

                return (
                  <div key={day.date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* 날짜 헤더 */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5">
                        Day {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{formatDate(day.date)}</span>
                      {entry?.memo && !isEditing && (
                        <span className="ml-auto text-xs text-teal-500">✓ 기록됨</span>
                      )}
                    </div>

                    {/* 방문 장소 목록 */}
                    {day.places.length > 0 && (
                      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                        {day.places.map(place => (
                          <div
                            key={place.contentId}
                            className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5"
                          >
                            {place.image ? (
                              <img
                                src={place.image}
                                alt={place.title}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-sm">📍</span>
                            )}
                            <span className="text-xs text-gray-600 whitespace-nowrap">{place.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {day.places.length === 0 && !isEditing && (
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-300">추가된 장소가 없어요</p>
                      </div>
                    )}

                    {/* 메모 영역 */}
                    <div className="px-4 pb-4 pt-2">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={draftMemo}
                            onChange={e => setDraftMemo(e.target.value)}
                            placeholder="오늘 여행은 어땠나요? 아이의 반응, 기억에 남는 순간을 기록해보세요 ✏️"
                            rows={4}
                            autoFocus
                            className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveMemo}
                              disabled={saving}
                              className="flex-1 bg-sky-500 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold"
                            >
                              {saving ? '저장 중...' : '저장'}
                            </button>
                            <button
                              onClick={() => setEditingDate(null)}
                              className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-200"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(day.date)}
                          className="w-full text-left"
                        >
                          {entry?.memo ? (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              {entry.memo}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-300 py-1">
                              + 이 날의 기억을 기록해보세요
                            </p>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
            className={`flex flex-col items-center gap-0.5 ${href === '/journal' ? 'text-sky-500' : ''}`}
          >
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/journal' ? 'text-sky-500 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
