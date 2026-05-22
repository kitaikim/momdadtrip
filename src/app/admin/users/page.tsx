'use client';

import { useEffect, useState } from 'react';

interface UserSummary {
  deviceId: string;
  firstSeen: string;
  lastSeen: string;
  trips: number;
  journals: number;
  stamps: number;
  missions: number;
}

function formatDate(str: string) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function shortId(id: string) {
  return id.slice(0, 12) + '...';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">사용자 목록</h2>
      <p className="text-sm text-gray-400 mb-6">
        총 {users.length}명 — 로그인 없이 기기 ID로 구분해요
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          아직 사용자 데이터가 없어요.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs">
                <th className="text-left px-5 py-3 font-medium">기기 ID</th>
                <th className="text-center px-4 py-3 font-medium">여행</th>
                <th className="text-center px-4 py-3 font-medium">일지</th>
                <th className="text-center px-4 py-3 font-medium">스탬프</th>
                <th className="text-center px-4 py-3 font-medium">미션</th>
                <th className="text-right px-5 py-3 font-medium">마지막 활동</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.deviceId} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? '' : ''}`}>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {shortId(u.deviceId)}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-semibold ${u.trips > 0 ? 'text-teal-600' : 'text-gray-300'}`}>{u.trips}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-semibold ${u.journals > 0 ? 'text-purple-600' : 'text-gray-300'}`}>{u.journals}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-semibold ${u.stamps > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{u.stamps}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-semibold ${u.missions > 0 ? 'text-green-600' : 'text-gray-300'}`}>{u.missions}</span>
                  </td>
                  <td className="text-right px-5 py-3 text-xs text-gray-400">
                    {formatDate(u.lastSeen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
