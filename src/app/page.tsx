import Link from 'next/link';
import { TRAVEL_THEMES, AGE_GROUPS } from '@/types';
import TripStatusBar from './TripStatusBar';
import EventsSection from './EventsSection';
import HomeHero from './HomeHero';
import BottomNav from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-24">
      <HomeHero />

      <div className="pt-4">
        <TripStatusBar />

        {/* 여행지 찾기 CTA */}
        <section className="px-4 mb-5">
          <Link href="/explore">
            <Button className="w-full py-3.5 h-auto rounded-xl font-bold text-base">
              여행지 찾기
            </Button>
          </Link>
        </section>

        {/* 코스 추천 */}
        <section className="px-4 mb-6">
          <Link href="/course">
            <Card className="p-4 flex items-center justify-between border-gray-200 active:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🗺️</div>
                <div>
                  <p className="text-[11px] text-blue-600 font-semibold mb-0.5">큐레이션 코스</p>
                  <p className="font-bold text-gray-900 text-sm">나이별 추천 코스 6가지</p>
                  <p className="text-xs text-gray-400 mt-0.5">당일·1박·2박 — 원탭 일정 완성</p>
                </div>
              </div>
              <span className="text-gray-300 text-xl font-light">›</span>
            </Card>
          </Link>
        </section>

        {/* 테마로 찾기 */}
        <section className="px-4 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">테마로 찾기</h2>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(TRAVEL_THEMES).map(([key, { label, emoji }]) => (
              <Link key={key} href={`/explore?theme=${key}`}>
                <Card className="flex flex-col items-center gap-1 py-3 border-gray-100 active:bg-blue-50 transition-colors cursor-pointer">
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 아이 나이로 찾기 */}
        <section className="px-4 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">아이 나이로 찾기</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Object.entries(AGE_GROUPS).map(([key, { label, range }]) => (
              <Link key={key} href={`/explore?age=${key}`} className="flex-shrink-0">
                <Card className="px-4 py-3 text-center border-gray-200 active:bg-blue-50 cursor-pointer min-w-[80px] transition-colors">
                  <p className="font-bold text-gray-900 text-sm">{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{range}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 강원도 축제·행사 */}
        <EventsSection />

        {/* 스탬프 & 미션 */}
        <section className="px-4 mb-4 flex gap-3">
          <Link href="/stamp" className="flex-1">
            <Card className="p-4 border-gray-200 active:bg-gray-50 transition-colors h-full">
              <span className="text-2xl mb-2 block">🗺️</span>
              <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wide">스탬프 투어</p>
              <p className="font-bold text-gray-900 text-sm leading-snug">강원 18개 시군<br />완주 도전!</p>
            </Card>
          </Link>
          <Link href="/mission" className="flex-1">
            <Card className="p-4 border-gray-200 active:bg-gray-50 transition-colors h-full">
              <span className="text-2xl mb-2 block">🎯</span>
              <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wide">가족 미션</p>
              <p className="font-bold text-gray-900 text-sm leading-snug">20가지 미션으로<br />추억 만들기!</p>
            </Card>
          </Link>
        </section>

        {/* AI 여행일지 */}
        <section className="px-4 pb-2">
          <Link href="/journal">
            <Card className="p-4 flex items-center justify-between border-gray-200 active:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📔</div>
                <div>
                  <p className="text-[11px] text-blue-600 font-semibold mb-0.5">AI 여행일지</p>
                  <p className="font-bold text-gray-900 text-sm">여행 기록을 블로그·SNS로</p>
                  <p className="text-xs text-gray-400 mt-0.5">1클릭으로 콘텐츠 자동 생성</p>
                </div>
              </div>
              <span className="text-gray-300 text-xl font-light">›</span>
            </Card>
          </Link>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
