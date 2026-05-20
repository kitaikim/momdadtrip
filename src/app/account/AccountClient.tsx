'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, type User } from '@/lib/auth';
import { getChildProfile } from '@/lib/childProfile';

type Tab = 'signin' | 'signup';

export default function AccountClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const profile = typeof window !== 'undefined' ? getChildProfile() : null;

  useEffect(() => {
    auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (tab === 'signin') {
      const { error } = await auth.signIn(email, password);
      if (error) {
        setMessage({ type: 'error', text: '이메일 또는 비밀번호가 올바르지 않아요.' });
      } else {
        setMessage({ type: 'success', text: '로그인 되었어요!' });
        setTimeout(() => router.push('/'), 800);
      }
    } else {
      if (password.length < 6) {
        setMessage({ type: 'error', text: '비밀번호는 6자리 이상이어야 해요.' });
        setSubmitting(false);
        return;
      }
      const { error } = await auth.signUp(email, password);
      if (error) {
        setMessage({ type: 'error', text: error.message.includes('already') ? '이미 가입된 이메일이에요.' : '가입 중 오류가 발생했어요.' });
      } else {
        setMessage({ type: 'success', text: '가입 완료! 이메일로 확인 링크를 보냈어요. 확인 후 로그인해주세요.' });
        setTab('signin');
      }
    }

    setSubmitting(false);
  }

  async function handleSignOut() {
    await auth.signOut();
    setMessage({ type: 'success', text: '로그아웃 되었어요.' });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white pb-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <header className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-3">← 뒤로</button>
        <h1 className="text-xl font-bold text-gray-900">계정</h1>
      </header>

      <div className="px-4 py-6 max-w-sm mx-auto">

        {/* 로그인된 상태 */}
        {user ? (
          <div className="flex flex-col gap-4">
            <Card className="border-gray-200">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">가입일 {new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-sm rounded-xl"
                  onClick={handleSignOut}
                >
                  로그아웃
                </Button>
              </CardContent>
            </Card>

            {/* 아이 프로필 */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">아이 프로필</p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {profile ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{profile.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{profile.ageGroup}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-xs text-blue-600 h-8 px-3"
                      onClick={() => router.push('/')}
                    >
                      변경
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-xs text-blue-600 h-8 px-0"
                    onClick={() => router.push('/')}
                  >
                    + 아이 프로필 설정하기
                  </Button>
                )}
              </CardContent>
            </Card>

            {message && (
              <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-500' : 'text-blue-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        ) : (

          /* 로그아웃 상태 */
          <div className="flex flex-col gap-5">
            {/* 탭 */}
            <div className="flex border-b border-gray-200">
              {(['signin', 'signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setMessage(null); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'
                  }`}
                >
                  {t === 'signin' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">이메일</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  비밀번호 {tab === 'signup' && <span className="text-gray-400 font-normal">(6자리 이상)</span>}
                </label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              {message && (
                <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-blue-600'}`}>
                  {message.text}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl py-3 h-auto font-semibold mt-1"
              >
                {submitting ? '처리 중...' : tab === 'signin' ? '로그인' : '가입하기'}
              </Button>
            </form>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              가입하면 여행 일정, 스탬프, 여행일지가<br />기기를 바꿔도 유지돼요.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
