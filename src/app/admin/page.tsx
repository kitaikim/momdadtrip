'use client';

import { useEffect, useState } from 'react';

interface Stats {
  devices: number;
  trips: number;
  journals: number;
  stamps: number;
  missions: number;
}

const STAT_CARDS = [
  { key: 'devices', label: '총 사용자 (기기)', icon: '📱', color: 'bg-sky-50 text-sky-600' },
  { key: 'trips', label: '여행 계획', icon: '🗺️', color: 'bg-teal-50 text-teal-600' },
  { key: 'journals', label: '일지 기록', icon: '📔', color: 'bg-purple-50 text-purple-600' },
  { key: 'stamps', label: '스탬프 획득', icon: '🏅', color: 'bg-amber-50 text-amber-600' },
  { key: 'missions', label: '미션 완료', icon: '🎯', color: 'bg-green-50 text-green-600' },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">대시보드</h2>
      <p className="text-sm text-gray-400 mb-6">서비스 전체 현황</p>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, icon, color }) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>
                {icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.[key] ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">안내</h3>
        <ul className="text-sm text-gray-500 flex flex-col gap-2">
          <li>• 사용자는 로그인 없이 기기 ID로 구분돼요 — 같은 사람이 기기를 바꾸면 다른 사용자로 집계돼요.</li>
          <li>• 스탬프·미션은 강원도 18개 시군 방문 기록과 20개 미션 완료 현황이에요.</li>
          <li>• Supabase에 <code className="bg-gray-100 px-1 rounded">SUPABASE_SERVICE_KEY</code>를 설정하면 더 정확한 데이터를 볼 수 있어요.</li>
        </ul>
      </div>
    </div>
  );
}
