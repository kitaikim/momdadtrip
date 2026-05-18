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

type CompletedMap = Record<string, string>; // missionId → completedAt

type Category = 'nature' | 'food' | 'activity' | 'memory';

interface Mission {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  category: Category;
}

const CATEGORY_LABELS: Record<Category, { label: string; color: string }> = {
  nature:   { label: '자연 탐험', color: 'bg-green-50 text-green-600' },
  food:     { label: '맛집 탐방', color: 'bg-orange-50 text-orange-600' },
  activity: { label: '체험 활동', color: 'bg-purple-50 text-purple-600' },
  memory:   { label: '가족 추억', color: 'bg-pink-50 text-pink-600' },
};

const MISSIONS: Mission[] = [
  // 자연 탐험
  { id: 'm1',  emoji: '🌊', title: '동해 바다에서 발 담그기',        desc: '동해 해수욕장에서 아이와 함께 파도에 발을 담가보세요.',           category: 'nature' },
  { id: 'm2',  emoji: '🏔️', title: '설악산 케이블카 타기',           desc: '설악산 권금성 케이블카를 타고 강원도의 웅장한 경치를 감상하세요.', category: 'nature' },
  { id: 'm3',  emoji: '🌿', title: '계곡에서 물놀이하기',             desc: '강원도 청정 계곡에서 아이와 물놀이를 즐겨보세요.',               category: 'nature' },
  { id: 'm4',  emoji: '🌅', title: '동해 일출 보기',                  desc: '정동진이나 추암에서 아이와 함께 일출을 감상해보세요.',             category: 'nature' },
  { id: 'm5',  emoji: '🌲', title: '자연휴양림 숲길 걷기',            desc: '홍천·인제 자연휴양림 산책로를 아이 손잡고 걸어보세요.',           category: 'nature' },
  // 맛집 탐방
  { id: 'm6',  emoji: '🍗', title: '춘천 닭갈비 먹기',                desc: '춘천 명동 닭갈비 골목에서 불판에 닭갈비를 볶아 먹어보세요.',      category: 'food' },
  { id: 'm7',  emoji: '🦞', title: '속초 아바이 순대 먹기',           desc: '속초 아바이마을에서 명물 오징어 순대를 맛보세요.',                category: 'food' },
  { id: 'm8',  emoji: '☕', title: '강릉 카페에서 커피 한 잔',        desc: '커피 도시 강릉에서 아이는 음료, 부모님은 커피를 즐겨보세요.',     category: 'food' },
  { id: 'm9',  emoji: '🌽', title: '찰옥수수 길거리에서 사 먹기',     desc: '강원도 명물 찰옥수수를 노점에서 갓 쪄서 먹어보세요.',            category: 'food' },
  { id: 'm10', emoji: '🍜', title: '막국수 한 그릇 뚝딱',             desc: '춘천·홍천의 메밀 막국수 맛집에서 시원하게 한 그릇 해보세요.',    category: 'food' },
  // 체험 활동
  { id: 'm11', emoji: '🚂', title: '정선 레일바이크 타기',            desc: '폐철도를 달리는 정선 레일바이크로 아이와 특별한 추억을 만들어요.', category: 'activity' },
  { id: 'm12', emoji: '🎿', title: '스키·썰매 체험하기',              desc: '평창·정선 스키장에서 아이와 눈 썰매를 타보세요.',                category: 'activity' },
  { id: 'm13', emoji: '🎣', title: '낚시 체험하기',                   desc: '강이나 호수에서 아이와 함께 낚시를 즐겨보세요.',                  category: 'activity' },
  { id: 'm14', emoji: '🏕️', title: '강원도에서 캠핑 1박',             desc: '강원도 캠핑장에서 가족과 함께 별빛 아래 1박해보세요.',           category: 'activity' },
  { id: 'm15', emoji: '🎨', title: '도자기·공예 체험하기',            desc: '강원도 체험 공방에서 아이와 함께 도자기를 만들어보세요.',         category: 'activity' },
  // 가족 추억
  { id: 'm16', emoji: '📸', title: '가족 사진 3장 이상 찍기',         desc: '여행 중 가족 모두 나온 사진을 3장 이상 남겨보세요.',              category: 'memory' },
  { id: 'm17', emoji: '✏️', title: '아이와 여행 그림일기 쓰기',       desc: '숙소에서 아이와 함께 오늘 여행을 그림이나 글로 기록해보세요.',    category: 'memory' },
  { id: 'm18', emoji: '🌙', title: '별 보며 이야기 나누기',           desc: '도시 불빛 없는 강원도 밤하늘에서 아이와 별자리 이야기를 해보세요.', category: 'memory' },
  { id: 'm19', emoji: '💌', title: '엽서에 손편지 쓰기',              desc: '관광지 엽서에 아이와 함께 가족에게 손편지를 써보세요.',           category: 'memory' },
  { id: 'm20', emoji: '🏆', title: '아이가 고른 장소 방문하기',       desc: '아이가 직접 지도를 보고 가고 싶은 곳을 골라 방문해보세요.',       category: 'memory' },
];

const CATEGORIES: Category[] = ['nature', 'food', 'activity', 'memory'];

async function loadCompleted(deviceId: string): Promise<CompletedMap> {
  const { data } = await db.select('missions', { device_id: deviceId });
  if (!data || data.length === 0) return {};
  return (data[0].completed as CompletedMap) ?? {};
}

async function saveCompleted(deviceId: string, completed: CompletedMap): Promise<void> {
  await db.upsert('missions', { device_id: deviceId, completed, updated_at: new Date().toISOString() });
}

export default function MissionClient() {
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [popup, setPopup] = useState<Mission | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadCompleted(id)
      .then((c) => setCompleted(c))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const toggleMission = useCallback(async (mission: Mission) => {
    const isDone = !!completed[mission.id];
    const updated = { ...completed };
    if (isDone) {
      delete updated[mission.id];
    } else {
      updated[mission.id] = new Date().toISOString();
      setPopup(mission);
      setTimeout(() => setPopup(null), 2000);
    }
    setCompleted(updated);
    await saveCompleted(deviceId, updated);
  }, [completed, deviceId]);

  const completedCount = Object.keys(completed).length;

  const filtered = activeCategory === 'all'
    ? MISSIONS
    : MISSIONS.filter(m => m.category === activeCategory);

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
        <h1 className="text-lg font-bold text-gray-900">여행 미션</h1>
      </div>

      <div className="pt-20 px-4">
        {/* 진행도 카드 */}
        <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-5 text-white mb-4 shadow-md shadow-sky-200">
          <p className="text-xs opacity-80 mb-1">강원도 가족 여행 미션</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{completedCount}</span>
            <span className="text-base opacity-80 mb-0.5">/ {MISSIONS.length} 완료</span>
          </div>
          <div className="mt-3 bg-white/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-70 mt-2">
            {completedCount === 0 && '미션을 완료하며 강원도를 즐겨보세요!'}
            {completedCount > 0 && completedCount < 10 && '여행이 더 즐거워지고 있어요 🌿'}
            {completedCount >= 10 && completedCount < 20 && '절반 이상 달성! 대단해요 🎯'}
            {completedCount === MISSIONS.length && '모든 미션 완료! 강원도 가족 여행 마스터 🏆'}
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            전체 {MISSIONS.length}
          </button>
          {CATEGORIES.map(cat => {
            const { label, color } = CATEGORY_LABELS[cat];
            const count = MISSIONS.filter(m => m.category === cat).length;
            const doneCount = MISSIONS.filter(m => m.category === cat && completed[m.id]).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-sky-500 text-white'
                    : `bg-white text-gray-500 border border-gray-200`
                }`}
              >
                {label} {doneCount}/{count}
              </button>
            );
          })}
        </div>

        {/* 미션 목록 */}
        <div className="flex flex-col gap-3">
          {filtered.map(mission => {
            const isDone = !!completed[mission.id];
            const doneDate = completed[mission.id]
              ? new Date(completed[mission.id]).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : null;
            const { label, color } = CATEGORY_LABELS[mission.category];

            return (
              <button
                key={mission.id}
                onClick={() => toggleMission(mission)}
                className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm transition-all active:scale-98 ${
                  isDone ? 'border-2 border-sky-200' : 'border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-3xl flex-shrink-0 ${isDone ? '' : 'grayscale opacity-50'}`}>
                    {mission.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
                        {label}
                      </span>
                      {isDone && doneDate && (
                        <span className="text-[10px] text-sky-500">{doneDate} 완료</span>
                      )}
                    </div>
                    <p className={`text-sm font-bold ${isDone ? 'text-sky-700' : 'text-gray-800'}`}>
                      {mission.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {mission.desc}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    isDone ? 'bg-sky-500' : 'border-2 border-gray-200'
                  }`}>
                    {isDone && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 미션 완료 팝업 */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl flex flex-col items-center gap-2 animate-bounce-in">
            <span className="text-5xl">{popup.emoji}</span>
            <p className="text-base font-bold text-gray-900">미션 완료!</p>
            <p className="text-sm text-sky-500">{popup.title}</p>
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
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
