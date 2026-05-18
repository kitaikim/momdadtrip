'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GANGWON_SIGUNGU } from '@/types';

const DEVICE_KEY = 'momdadtrip_device_id';

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// visited: { sigunguCode: "2026-05-18T..." }
type VisitedMap = Record<string, string>;

const SIGUNGU_LIST = Object.values(GANGWON_SIGUNGU);

// 지역 특색 이모지
const SIGUNGU_EMOJI: Record<string, string> = {
  '1': '🦆', '2': '🌿', '3': '🌊', '4': '⚓', '5': '🏔️',
  '6': '🦞', '7': '🌊', '8': '🌲', '9': '🐄', '10': '🕯️',
  '11': '🎿', '12': '🚂', '13': '🌾', '14': '🐟', '15': '🏕️',
  '16': '🦌', '17': '🌅', '18': '🏄',
};

async function loadStamps(deviceId: string): Promise<VisitedMap> {
  const { data } = await supabase
    .from('stamps')
    .select('visited')
    .eq('device_id', deviceId)
    .single();
  return (data?.visited as VisitedMap) ?? {};
}

async function saveStamps(deviceId: string, visited: VisitedMap): Promise<void> {
  await supabase.from('stamps').upsert({
    device_id: deviceId,
    visited,
    updated_at: new Date().toISOString(),
  });
}

export default function StampClient() {
  const [visited, setVisited] = useState<VisitedMap>({});
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [popup, setPopup] = useState<{ name: string; emoji: string } | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadStamps(id).then((v) => {
      setVisited(v);
      setLoaded(true);
    });
  }, []);

  const toggleStamp = useCallback(async (code: string, name: string) => {
    const isVisited = !!visited[code];
    const updated = { ...visited };

    if (isVisited) {
      delete updated[code];
    } else {
      updated[code] = new Date().toISOString();
      setPopup({ name, emoji: SIGUNGU_EMOJI[code] ?? '📍' });
      setTimeout(() => setPopup(null), 2000);
    }

    setVisited(updated);
    await saveStamps(deviceId, updated);
  }, [visited, deviceId]);

  const visitedCount = Object.keys(visited).length;

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
        <h1 className="text-lg font-bold text-gray-900">강원 스탬프</h1>
      </div>

      <div className="pt-20 px-4">
        {/* 진행도 카드 */}
        <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-5 text-white mb-5 shadow-md shadow-sky-200">
          <p className="text-xs opacity-80 mb-1">강원도 18개 시군</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{visitedCount}</span>
            <span className="text-base opacity-80 mb-0.5">/ 18 방문</span>
          </div>
          {/* 프로그레스 바 */}
          <div className="mt-3 bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(visitedCount / 18) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-70 mt-2">
            {visitedCount === 0 && '방문한 곳을 탭해서 스탬프를 모아보세요!'}
            {visitedCount > 0 && visitedCount < 9 && '강원도 여행을 즐기고 있군요 🌿'}
            {visitedCount >= 9 && visitedCount < 18 && '절반을 넘었어요! 계속 도전하세요 🎯'}
            {visitedCount === 18 && '강원도 18개 시군 완전 정복! 🏆'}
          </p>
        </div>

        {/* 스탬프 그리드 */}
        <div className="grid grid-cols-3 gap-3">
          {SIGUNGU_LIST.map((sg) => {
            const isVisited = !!visited[sg.code];
            const visitedDate = visited[sg.code]
              ? new Date(visited[sg.code]).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : null;

            return (
              <button
                key={sg.code}
                onClick={() => toggleStamp(sg.code, sg.name)}
                className={`relative flex flex-col items-center justify-center rounded-2xl p-4 aspect-square transition-all duration-200 active:scale-95 ${
                  isVisited
                    ? 'bg-white shadow-md shadow-sky-100 border-2 border-sky-200'
                    : 'bg-white shadow-sm border-2 border-dashed border-gray-200'
                }`}
              >
                <span className={`text-3xl mb-1 ${isVisited ? '' : 'grayscale opacity-40'}`}>
                  {SIGUNGU_EMOJI[sg.code] ?? '📍'}
                </span>
                <span className={`text-xs font-bold ${isVisited ? 'text-sky-600' : 'text-gray-300'}`}>
                  {sg.name}
                </span>
                {visitedDate && (
                  <span className="text-[10px] text-gray-400 mt-0.5">{visitedDate}</span>
                )}
                {isVisited && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5 pb-4">
          방문한 시군을 탭하면 스탬프가 찍혀요
        </p>
      </div>

      {/* 스탬프 획득 팝업 */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl flex flex-col items-center gap-2 animate-bounce-in">
            <span className="text-5xl">{popup.emoji}</span>
            <p className="text-base font-bold text-gray-900">{popup.name} 스탬프 획득!</p>
            <p className="text-xs text-sky-500">강원도 여행 기록이 쌓이고 있어요</p>
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
            className={`flex flex-col items-center gap-0.5 ${href === '/stamp' ? 'text-sky-500' : ''}`}
          >
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/stamp' ? 'text-sky-500 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
