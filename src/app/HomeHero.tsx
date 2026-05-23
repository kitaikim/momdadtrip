'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, type User } from '@/lib/auth';

export default function HomeHero() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-gradient-to-br from-blue-600 to-blue-500 px-5 pt-14 pb-8 text-white relative">
      <Link
        href="/account"
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
      >
        {user ? (
          <span className="text-sm font-bold text-white">{user.email?.[0].toUpperCase()}</span>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </Link>

      <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-2">강원도 가족여행 플래너</p>
      <h1 className="text-3xl font-bold leading-tight mb-1">엄마랑 아빠랑</h1>
      <p className="text-sm opacity-80">아이와 함께한 여행, 추억이 콘텐츠가 되다 ✨</p>
    </header>
  );
}
