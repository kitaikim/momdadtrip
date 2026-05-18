import Link from 'next/link';
import { TRAVEL_THEMES, AGE_GROUPS } from '@/types';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-20">
      {/* 헤더 */}
      <header className="px-5 pt-12 pb-6">
        <p className="text-sm font-medium text-sky-500 mb-1">강원도 가족여행</p>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          엄마랑 아빠랑 👨‍👩‍👧
        </h1>
        <p className="mt-2 text-gray-500 text-sm">아이와 함께한 여행, 추억이 콘텐츠가 되다</p>
      </header>

      {/* 빠른 시작 */}
      <section className="px-5 mb-8">
        <Link
          href="/explore"
          className="block w-full bg-sky-500 text-white text-center py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-sky-200 active:scale-95 transition-transform"
        >
          여행지 찾기 →
        </Link>
      </section>

      {/* 테마 카드 */}
      <section className="px-5 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">테마로 찾기</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(TRAVEL_THEMES).map(([key, { label, emoji }]) => (
            <Link
              key={key}
              href={`/explore?theme=${key}`}
              className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:bg-sky-50"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-gray-600 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 연령별 추천 */}
      <section className="px-5 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">아이 나이로 찾기</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {Object.entries(AGE_GROUPS).map(([key, { label, range }]) => (
            <Link
              key={key}
              href={`/explore?age=${key}`}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-3 text-center shadow-sm active:bg-sky-50"
            >
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{range}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 배너 2개 나란히 */}
      <section className="px-5 mb-8 flex gap-3">
        <div className="flex-1 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
          <p className="text-[10px] font-medium text-green-600 mb-1">스탬프 투어</p>
          <h3 className="font-bold text-gray-800 text-sm mb-3">18개 시군 완주 도전!</h3>
          <Link
            href="/stamp"
            className="inline-block bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            스탬프 보기
          </Link>
        </div>
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-[10px] font-medium text-purple-600 mb-1">여행 미션</p>
          <h3 className="font-bold text-gray-800 text-sm mb-3">가족 미션 20개 도전!</h3>
          <Link
            href="/mission"
            className="inline-block bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            미션 보기
          </Link>
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
