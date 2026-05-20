'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getChildProfile, nameParticle } from '@/lib/childProfile';
import { auth, type User } from '@/lib/auth';
import ChildOnboarding from './ChildOnboarding';

export default function HomeHero() {
  const [profile, setProfile] = useState<{ name: string; ageGroup: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const p = getChildProfile();
    if (p) {
      setProfile(p);
    } else {
      setShowOnboarding(true);
    }
    setLoaded(true);

    auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setProfile(getChildProfile());
  };

  if (!loaded) return (
    <header className="bg-gradient-to-br from-blue-600 to-blue-500 px-5 pt-14 pb-8 text-white">
      <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-2">강원도 가족여행 플래너</p>
      <h1 className="text-3xl font-bold leading-tight mb-1">엄마랑 아빠랑</h1>
    </header>
  );

  return (
    <>
      {showOnboarding && <ChildOnboarding onComplete={handleOnboardingComplete} />}

      <header className="bg-gradient-to-br from-blue-600 to-blue-500 px-5 pt-14 pb-8 text-white relative">
        {/* 계정 아이콘 */}
        <Link
          href="/account"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
        >
          {user ? (
            <span className="text-sm font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </span>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </Link>

        <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-2">강원도 가족여행 플래너</p>

        {profile ? (
          <>
            <h1 className="text-3xl font-bold leading-tight mb-1">
              {profile.name}{nameParticle(profile.name, '이랑', '랑')} 강원도 ✈️
            </h1>
            <p className="text-sm opacity-80">아이와 함께한 여행, 추억이 콘텐츠가 되다 ✨</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="mt-2 text-xs text-white/60 underline"
            >
              프로필 변경
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold leading-tight mb-1">엄마랑 아빠랑</h1>
            <p className="text-sm opacity-80">아이와 함께한 여행, 추억이 콘텐츠가 되다 ✨</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1.5 font-medium"
            >
              👶 아이 프로필 설정하기
            </button>
          </>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {['☀️ 날씨 맞춤 코스', '🛒 유모차 접근성', '🗺️ 스탬프 투어', '✨ AI 여행일지'].map(tag => (
            <span key={tag} className="text-[11px] font-medium bg-white/20 rounded-full px-2.5 py-1">{tag}</span>
          ))}
        </div>
      </header>
    </>
  );
}
