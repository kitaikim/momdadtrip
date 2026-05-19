'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EventItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage?: string;
}

export default function EventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('/api/tour/events')
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="px-5 mb-7">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">🎉 강원도 이달의 축제·행사</h2>
        <Link href="/explore?theme=culture" className="text-xs text-sky-500">더보기</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {events.map(ev => (
          <Link
            key={ev.contentid}
            href={`/explore/${ev.contentid}`}
            className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            {ev.firstimage ? (
              <img src={ev.firstimage} alt={ev.title} className="w-full h-24 object-cover" />
            ) : (
              <div className="w-full h-24 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl">🎊</div>
            )}
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{ev.title}</p>
              {ev.addr1 && <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{ev.addr1}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
