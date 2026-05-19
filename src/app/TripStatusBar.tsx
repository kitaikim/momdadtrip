'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const DEVICE_KEY = 'momdadtrip_device_id';

interface TripStatus {
  hasTrip: boolean;
  title?: string;
  stampCount: number;
  missionCount: number;
}

export default function TripStatusBar() {
  const [status, setStatus] = useState<TripStatus | null>(null);

  useEffect(() => {
    const deviceId = localStorage.getItem(DEVICE_KEY);
    if (!deviceId) {
      setStatus({ hasTrip: false, stampCount: 0, missionCount: 0 });
      return;
    }

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!base || !key) { setStatus({ hasTrip: false, stampCount: 0, missionCount: 0 }); return; }

    const headers = { apikey: key, Authorization: `Bearer ${key}` };

    Promise.all([
      fetch(`${base}/rest/v1/trips?select=title&device_id=eq.${deviceId}&order=updated_at.desc&limit=1`, { headers }).then(r => r.json()),
      fetch(`${base}/rest/v1/stamps?select=visited&device_id=eq.${deviceId}`, { headers }).then(r => r.json()),
      fetch(`${base}/rest/v1/missions?select=completed&device_id=eq.${deviceId}`, { headers }).then(r => r.json()),
    ])
      .then(([trips, stamps, missions]) => {
        const trip = trips?.[0];
        const visited = stamps?.[0]?.visited ?? {};
        const completed = missions?.[0]?.completed ?? {};
        setStatus({
          hasTrip: !!trip,
          title: trip?.title,
          stampCount: Object.keys(visited).length,
          missionCount: Object.keys(completed).length,
        });
      })
      .catch(() => setStatus({ hasTrip: false, stampCount: 0, missionCount: 0 }));
  }, []);

  if (!status) return null;

  return (
    <section className="px-5 mb-6">
      {status.hasTrip ? (
        <Link href="/plan" className="block bg-gradient-to-r from-sky-500 to-teal-400 rounded-2xl p-4 text-white shadow-md shadow-sky-200">
          <p className="text-xs opacity-80 mb-0.5">진행 중인 여행</p>
          <p className="font-bold text-base">{status.title} ✈️</p>
          <div className="flex gap-4 mt-2 text-xs opacity-80">
            <span>🗺️ 스탬프 {status.stampCount}/18</span>
            <span>🏆 미션 {status.missionCount}/20</span>
          </div>
        </Link>
      ) : (
        <Link href="/plan" className="block bg-white border-2 border-dashed border-sky-200 rounded-2xl p-4 text-center">
          <p className="text-sky-500 font-semibold text-sm">+ 첫 여행 계획 만들기</p>
          <p className="text-xs text-gray-400 mt-1">일정을 만들면 여행이 더 풍성해져요</p>
        </Link>
      )}
    </section>
  );
}
