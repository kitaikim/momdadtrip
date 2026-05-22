'use client';

import { useEffect, useState, useCallback } from 'react';
import { getExcluded, addExcluded, removeExcluded, getMyDeviceId } from '../excluded';

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
  const [excluded, setExcluded] = useState<string[]>([]);
  const [myDeviceId, setMyDeviceId] = useState<string | null>(null);

  const load = useCallback((excludedList: string[]) => {
    setLoading(true);
    const params = excludedList.length ? `?exclude=${excludedList.join(',')}` : '';
    fetch(`/api/admin/users${params}`)
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ex = getExcluded();
    const myId = getMyDeviceId();
    setExcluded(ex);
    setMyDeviceId(myId);
    load(ex);
  }, [load]);

  const handleExclude = (id: string) => {
    const updated = addExcluded(id);
    setExcluded(updated);
    load(updated);
  };

  const handleRestore = (id: string) => {
    const updated = removeExcluded(id);
    setExcluded(updated);
    load(updated);
  };

  const handleExcludeMyDevice = () => {
    if (!myDeviceId) return alert('이 브라우저에서 앱을 한 번 열어야 기기 ID가 생성돼요.\nmomdadtrip.vercel.app 에서 앱을 열고 다시 시도해보세요.');
    if (excluded.includes(myDeviceId)) return alert('이미 제외된 기기예요.');
    handleExclude(myDeviceId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">사용자 목록</h2>
        <p className="text-sm text-gray-400">
          총 {users.length}명 표시 중 · 로그인 없이 기기 ID로 구분해요
        </p>
      </div>

      {/* 이 기기 제외 버튼 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">이 기기 제외하기</p>
          <p className="text-xs text-blue-500 mt-0.5">
            {myDeviceId
              ? `기기 ID: ${shortId(myDeviceId)}`
              : '앱을 먼저 방문해야 기기 ID가 생성돼요'}
          </p>
        </div>
        <button
          onClick={handleExcludeMyDevice}
          disabled={!!myDeviceId && excluded.includes(myDeviceId)}
          className="flex-shrink-0 bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          {myDeviceId && excluded.includes(myDeviceId) ? '제외됨' : '제외하기'}
        </button>
      </div>

      {/* 제외된 기기 목록 */}
      {excluded.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">제외된 기기 ({excluded.length}개)</h3>
          <div className="flex flex-col gap-2">
            {excluded.map((id) => (
              <div key={id} className="flex items-center justify-between gap-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚫</span>
                  <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {shortId(id)}
                  </span>
                  {id === myDeviceId && (
                    <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">이 기기</span>
                  )}
                </div>
                <button
                  onClick={() => handleRestore(id)}
                  className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 px-3 py-1 rounded-lg transition-colors"
                >
                  복구
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">제외된 기기는 통계와 목록에서 모두 빠져요.</p>
        </div>
      )}

      {/* 사용자 목록 */}
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          표시할 사용자 데이터가 없어요.
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
                <th className="text-right px-4 py-3 font-medium">마지막 활동</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.deviceId} className="border-b border-gray-50 hover:bg-gray-50">
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
                  <td className="text-right px-4 py-3 text-xs text-gray-400">
                    {formatDate(u.lastSeen)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleExclude(u.deviceId)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                      title="이 기기 제외"
                    >
                      제외
                    </button>
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
