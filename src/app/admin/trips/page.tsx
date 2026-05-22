'use client';

import { useEffect, useState } from 'react';

interface TripPlace {
  contentId: string;
  title: string;
}

interface TripDay {
  date: string;
  places: TripPlace[];
}

interface Trip {
  id: string;
  device_id: string;
  title: string;
  start_date: string;
  end_date: string;
  days: TripDay[];
  updated_at: string;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function shortId(id: string) {
  return id.slice(0, 8) + '...';
}

export default function AdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/trips')
      .then((r) => r.json())
      .then(setTrips)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 여행을 삭제할까요? 되돌릴 수 없어요.`)) return;
    setDeleting(id);
    await fetch('/api/admin/trips', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  };

  const totalPlaces = trips.reduce((sum, t) => {
    return sum + (t.days ?? []).reduce((s, d) => s + (d.places?.length ?? 0), 0);
  }, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">여행 목록</h2>
      <p className="text-sm text-gray-400 mb-6">총 {trips.length}개 여행 · {totalPlaces}개 장소</p>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          아직 생성된 여행이 없어요.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => {
            const places = (trip.days ?? []).flatMap((d) => d.places ?? []);
            return (
              <div key={trip.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(trip.start_date)} ~ {formatDate(trip.end_date)}
                      {' · '}{trip.days?.length ?? 0}일
                      {' · '}기기 {shortId(trip.device_id)}
                    </p>
                    <p className="text-xs text-gray-400">
                      마지막 수정 {formatDate(trip.updated_at)}
                    </p>
                    {places.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {places.slice(0, 6).map((p) => (
                          <span key={p.contentId} className="text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full">
                            {p.title}
                          </span>
                        ))}
                        {places.length > 6 && (
                          <span className="text-xs text-gray-400 px-1 py-0.5">+{places.length - 6}개</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(trip.id, trip.title)}
                    disabled={deleting === trip.id}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    {deleting === trip.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
