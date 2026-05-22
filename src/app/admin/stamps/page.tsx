'use client';

import { useEffect, useState } from 'react';
import { getExcluded } from '../excluded';

interface SigunguStat {
  code: string;
  name: string;
  count: number;
}

interface MissionStat {
  id: string;
  count: number;
}

interface StampsData {
  sigunguStats: SigunguStat[];
  missionStats: MissionStat[];
  totalDevices: number;
}

const MISSION_LABELS: Record<string, { emoji: string; title: string }> = {
  m1:  { emoji: '🌊', title: '동해 바다에서 발 담그기' },
  m2:  { emoji: '🏔️', title: '설악산 케이블카 타기' },
  m3:  { emoji: '🌿', title: '계곡에서 물놀이하기' },
  m4:  { emoji: '🌅', title: '동해 일출 보기' },
  m5:  { emoji: '🌲', title: '자연휴양림 숲길 걷기' },
  m6:  { emoji: '🍗', title: '춘천 닭갈비 먹기' },
  m7:  { emoji: '🦞', title: '속초 아바이 순대 먹기' },
  m8:  { emoji: '☕', title: '강릉 카페에서 커피 한 잔' },
  m9:  { emoji: '🌽', title: '찰옥수수 길거리에서 사 먹기' },
  m10: { emoji: '🍜', title: '막국수 한 그릇 뚝딱' },
  m11: { emoji: '🚂', title: '정선 레일바이크 타기' },
  m12: { emoji: '🎿', title: '스키·썰매 체험하기' },
  m13: { emoji: '🎣', title: '낚시 체험하기' },
  m14: { emoji: '🏕️', title: '강원도에서 캠핑 1박' },
  m15: { emoji: '🎨', title: '도자기·공예 체험하기' },
  m16: { emoji: '📸', title: '가족 사진 3장 이상 찍기' },
  m17: { emoji: '✏️', title: '아이와 여행 그림일기 쓰기' },
  m18: { emoji: '🌙', title: '별 보며 이야기 나누기' },
  m19: { emoji: '💌', title: '엽서에 손편지 쓰기' },
  m20: { emoji: '🏆', title: '아이가 고른 장소 방문하기' },
};

export default function AdminStamps() {
  const [data, setData] = useState<StampsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const excluded = getExcluded();
    const params = excluded.length ? `?exclude=${excluded.join(',')}` : '';
    fetch(`/api/admin/stamps${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400">불러오는 중...</p>;

  const maxStamp = data?.sigunguStats[0]?.count ?? 1;
  const maxMission = data?.missionStats[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">스탬프·미션</h2>
        <p className="text-sm text-gray-400 mb-6">
          스탬프 보유 사용자 {data?.totalDevices ?? 0}명
        </p>
      </div>

      {/* 지역별 스탬프 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">지역별 스탬프 획득 순위</h3>
        {!data?.sigunguStats.length ? (
          <p className="text-sm text-gray-300">데이터 없음</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.sigunguStats.map((sg, i) => (
              <div key={sg.code} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                <span className="text-sm text-gray-700 w-20 flex-shrink-0">{sg.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-sky-400 rounded-full h-2 transition-all"
                    style={{ width: `${(sg.count / maxStamp) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right">{sg.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 미션 완료 순위 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">미션 완료 순위</h3>
        {!data?.missionStats.length ? (
          <p className="text-sm text-gray-300">완료된 미션이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.missionStats.map((m, i) => {
              const info = MISSION_LABELS[m.id];
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                  <span className="text-base w-6 flex-shrink-0">{info?.emoji ?? '❓'}</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{info?.title ?? m.id}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-400 rounded-full h-2 transition-all"
                      style={{ width: `${(m.count / maxMission) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-8 text-right">{m.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
