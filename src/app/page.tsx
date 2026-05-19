import Link from 'next/link';
import { TRAVEL_THEMES, AGE_GROUPS } from '@/types';
import TripStatusBar from './TripStatusBar';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 히어로 */}
      <header className="bg-gradient-to-br from-sky-500 to-teal-400 px-5 pt-14 pb-8 text-white">
        <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-2">강원도 가족여행 플래너</p>
        <h1 className="text-3xl font-bold leading-tight mb-1">엄마랑 아빠랑</h1>
        <p className="text-sm opacity-80">아이와 함께한 여행, 추억이 콘텐츠가 되다 ✨</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {['☀️ 날씨 맞춤 코스', '🛒 유모차 접근성', '🗺️ 스탬프 투어', '✨ AI 여행일지'].map(tag => (
            <span key={tag} className="text-[11px] font-medium bg-white/20 rounded-full px-2.5 py-1">{tag}</span>
          ))}
        </div>
      </header>

      <div className="pt-5">
        {/* 내 여행 현황 */}
        <TripStatusBar />

        {/* 여행지 찾기 CTA */}
        <section className="px-5 mb-6">
          <Link
            href="/explore"
            className="block w-full bg-sky-500 text-white text-center py-4 rounded-2xl font-bold text-base shadow-md shadow-sky-200 active:scale-95 transition-transform"
          >
            여행지 찾기 →
          </Link>
        </section>

        {/* 테마 카드 */}
        <section className="px-5 mb-7">
          <h2 className="text-base font-bold text-gray-800 mb-3">테마로 찾기</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {Object.entries(TRAVEL_THEMES).map(([key, { label, emoji }]) => (
              <Link
                key={key}
                href={`/explore?theme=${key}`}
                className="flex flex-col items-center gap-1.5 bg-white rounded-2xl py-3 shadow-sm border border-gray-100 active:bg-sky-50 transition-colors"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 아이 나이로 찾기 */}
        <section className="px-5 mb-7">
          <h2 className="text-base font-bold text-gray-800 mb-3">아이 나이로 찾기</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {Object.entries(AGE_GROUPS).map(([key, { label, range }]) => (
              <Link
                key={key}
                href={`/explore?age=${key}`}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-center shadow-sm active:bg-sky-50"
              >
                <p className="font-bold text-gray-800 text-sm">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{range}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 스탬프 & 미션 배너 */}
        <section className="px-5 mb-5 flex gap-3">
          <Link href="/stamp" className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 active:scale-95 transition-transform">
            <p className="text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wide">스탬프 투어</p>
            <h3 className="font-bold text-gray-800 text-sm leading-snug mb-3">강원 18개 시군<br />완주 도전!</h3>
            <span className="inline-block bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-semibold">스탬프 보기</span>
          </Link>
          <Link href="/mission" className="flex-1 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-4 border border-violet-100 active:scale-95 transition-transform">
            <p className="text-[10px] font-bold text-violet-600 mb-1 uppercase tracking-wide">가족 미션</p>
            <h3 className="font-bold text-gray-800 text-sm leading-snug mb-3">20가지 미션으로<br />추억 만들기!</h3>
            <span className="inline-block bg-violet-500 text-white text-xs px-3 py-1.5 rounded-xl font-semibold">미션 보기</span>
          </Link>
        </section>

        {/* AI 여행일지 배너 */}
        <section className="px-5">
          <Link href="/journal" className="block bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl p-5 text-white active:scale-95 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-80 mb-1">AI 여행일지</p>
                <p className="font-bold text-base">여행 기록을 블로그·SNS로</p>
                <p className="text-xs opacity-70 mt-1">✨ 1클릭으로 콘텐츠 자동 생성</p>
              </div>
              <span className="text-4xl">📔</span>
            </div>
          </Link>
        </section>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 ${href === '/' ? 'text-sky-500' : ''}`}>
            <span className="text-xl">{emoji}</span>
            <span className={`text-xs ${href === '/' ? 'text-sky-500 font-semibold' : 'text-gray-500'}`}>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
