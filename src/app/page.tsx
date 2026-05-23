import Link from 'next/link';
import TripStatusBar from './TripStatusBar';
import HomeHero from './HomeHero';
import HomeSearch from './HomeSearch';
import HomeCourses from './HomeCourses';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-24">
      <HomeHero />

      <div className="pt-4">
        <HomeSearch />

        <TripStatusBar />

        <HomeCourses />

        {/* 추천 코스 */}
        <section className="px-4 mb-5">
          <Link href="/course">
            <div className="p-4 flex items-center justify-between border border-gray-200 rounded-2xl active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🗺️</div>
                <div>
                  <p className="text-[11px] text-blue-600 font-semibold mb-0.5">큐레이션 코스</p>
                  <p className="font-bold text-gray-900 text-sm">나이별 추천 코스 6가지</p>
                  <p className="text-xs text-gray-400 mt-0.5">당일·1박·2박 — 원탭 일정 완성</p>
                </div>
              </div>
              <span className="text-gray-300 text-xl font-light">›</span>
            </div>
          </Link>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
