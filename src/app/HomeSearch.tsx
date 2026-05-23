'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_TAGS = [
  { label: '🌊 바다·해변', href: '/explore?q=해수욕장' },
  { label: '⛰️ 산·자연', href: '/explore?q=산' },
  { label: '🎡 체험·놀이', href: '/explore?q=체험' },
  { label: '🛒 유모차 OK', href: '/explore?stroller=1' },
  { label: '🌿 캠핑', href: '/explore?q=캠핑' },
];

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="px-4 pb-4">
      <form onSubmit={handleSubmit} className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="여행지 검색 (예: 강릉, 설악산...)"
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-blue-500"
        >
          🔍
        </button>
      </form>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {QUICK_TAGS.map(t => (
          <button
            key={t.href}
            onClick={() => router.push(t.href)}
            className="flex-shrink-0 text-xs font-medium bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 active:bg-gray-50"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
