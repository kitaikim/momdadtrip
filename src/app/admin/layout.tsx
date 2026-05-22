'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/trips', label: '여행 목록', icon: '🗺️' },
  { href: '/admin/users', label: '사용자', icon: '👥' },
  { href: '/admin/stamps', label: '스탬프·미션', icon: '🏅' },
  { href: '/admin/virtual', label: '가상유저', icon: '🤖' },
];

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      sessionStorage.setItem('admin_authed', '1');
      onLogin();
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? '오류가 발생했어요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">어드민 로그인</h1>
        <p className="text-sm text-gray-400 mb-6">엄마랑 아빠랑 관리자 페이지</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="비밀번호"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 mb-3"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !pw}
          className="w-full bg-sky-500 disabled:bg-gray-200 text-white py-3 rounded-xl text-sm font-semibold"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_authed') === '1');
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-5 py-6 border-b border-gray-100">
          <p className="text-xs text-gray-400">어드민</p>
          <h1 className="text-base font-bold text-gray-900">엄마랑 아빠랑</h1>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
