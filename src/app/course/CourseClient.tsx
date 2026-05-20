'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AgeGroup } from '@/types';

type DurationFilter = 'all' | '0' | '1' | '2';

interface CoursePlace {
  name: string;
  type: string;
  address: string;
}

interface Course {
  id: string;
  title: string;
  emoji: string;
  description: string;
  region: string;
  days: number; // 0=당일, 1=1박2일, 2=2박3일
  ageGroups: AgeGroup[];
  gradient: string;
  places: CoursePlace[];
}

const COURSES: Course[] = [
  {
    id: 'chuncheon-daytrip',
    title: '춘천 가족 나들이',
    emoji: '🦆',
    description: '레고랜드에서 신나는 하루, 의암호 수변 산책까지',
    region: '춘천',
    days: 0,
    ageGroups: ['toddler', 'child'],
    gradient: 'from-sky-400 to-blue-500',
    places: [
      { name: '레고랜드 코리아', type: '🎡 체험', address: '춘천시 하중도길 128' },
      { name: '의암호 스카이워크', type: '🌊 명소', address: '춘천시 서면 박사로 866' },
      { name: '춘천 닭갈비 거리', type: '🍗 맛집', address: '춘천시 명동길' },
      { name: '춘천 애니메이션박물관', type: '🎨 문화', address: '춘천시 서면 박사로 854' },
    ],
  },
  {
    id: 'gangneung-beach',
    title: '강릉 바다 당일치기',
    emoji: '🌊',
    description: '경포해변 모래놀이에 오죽헌 역사 탐방',
    region: '강릉',
    days: 0,
    ageGroups: ['child', 'tween'],
    gradient: 'from-cyan-400 to-teal-500',
    places: [
      { name: '경포해변', type: '🏖️ 해변', address: '강릉시 경포로 365' },
      { name: '오죽헌', type: '🏯 역사', address: '강릉시 율곡로 3139번길 24' },
      { name: '주문진항', type: '🐟 맛집', address: '강릉시 주문진읍 주문북로 10' },
      { name: '강릉 과학체험관', type: '🔬 체험', address: '강릉시 남산초교길 12' },
    ],
  },
  {
    id: 'sokcho-1night',
    title: '속초·고성 1박2일',
    emoji: '🏔️',
    description: '아쿠아리움, 설악산 케이블카, 고성 DMZ 체험',
    region: '속초·고성',
    days: 1,
    ageGroups: ['child', 'tween'],
    gradient: 'from-slate-500 to-blue-600',
    places: [
      { name: '속초 씨사이드 아쿠아리움', type: '🐠 체험', address: '속초시 해오름로 7' },
      { name: '설악산 케이블카', type: '🚡 명소', address: '속초시 설악산로 1091' },
      { name: '고성 DMZ 박물관', type: '🏛️ 역사', address: '고성군 현내면 금강산로 481' },
      { name: '아야진 해변', type: '🏖️ 해변', address: '고성군 토성면 아야진리' },
    ],
  },
  {
    id: 'pyeongchang-1night',
    title: '평창 자연 1박2일',
    emoji: '🐑',
    description: '대관령 양떼목장 체험, 하늘마루 전망, 알펜시아 숙박',
    region: '평창',
    days: 1,
    ageGroups: ['toddler', 'child'],
    gradient: 'from-green-400 to-emerald-500',
    places: [
      { name: '대관령 양떼목장', type: '🐑 체험', address: '평창군 대관령면 대관령마루길 483-32' },
      { name: '대관령 하늘마루', type: '🌿 명소', address: '평창군 대관령면 올림픽로 374' },
      { name: '알펜시아 리조트', type: '🏨 숙박', address: '평창군 대관령면 솔봉로 325' },
      { name: '허브나라 농원', type: '🌺 체험', address: '평창군 봉평면 창동리 576' },
    ],
  },
  {
    id: 'grand-2nights',
    title: '강원도 그랜드투어 2박3일',
    emoji: '🎯',
    description: '춘천-강릉-속초, 강원도 핵심 명소 완전 정복',
    region: '춘천·강릉·속초',
    days: 2,
    ageGroups: ['child', 'tween'],
    gradient: 'from-orange-400 to-rose-500',
    places: [
      { name: '레고랜드 코리아', type: '🎡 체험', address: '춘천시 하중도길 128' },
      { name: '경포해변', type: '🏖️ 해변', address: '강릉시 경포로 365' },
      { name: '정동진', type: '🌅 명소', address: '강릉시 강동면 정동역길' },
      { name: '속초 씨사이드 아쿠아리움', type: '🐠 체험', address: '속초시 해오름로 7' },
      { name: '설악산 케이블카', type: '🚡 명소', address: '속초시 설악산로 1091' },
    ],
  },
  {
    id: 'healing-2nights',
    title: '힐링 가족 여행 2박3일',
    emoji: '🌿',
    description: '유모차도 OK! 원주·횡성·평창에서 느리게 걷는 여행',
    region: '원주·횡성·평창',
    days: 2,
    ageGroups: ['infant', 'toddler'],
    gradient: 'from-emerald-400 to-teal-500',
    places: [
      { name: '뮤지엄 산 (뮤지엄SAN)', type: '🎨 문화', address: '원주시 지정면 오크밸리2길 260' },
      { name: '횡성 웰리힐리파크', type: '🎿 체험', address: '횡성군 둔내면 고래산로 215' },
      { name: '평창 월정사', type: '⛩️ 명소', address: '평창군 진부면 오대산로 374-8' },
      { name: '무이예술관', type: '🎨 문화', address: '평창군 봉평면 기풍리 203' },
    ],
  },
];

const AGE_LABEL: Record<AgeGroup, string> = {
  infant: '영아', toddler: '유아', child: '어린이', tween: '초등',
};

const DURATION_LABEL: Record<string, string> = {
  '0': '당일', '1': '1박2일', '2': '2박3일',
};

export default function CourseClient() {
  const router = useRouter();
  const [ageFilter, setAgeFilter] = useState<AgeGroup | 'all'>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');

  const filtered = COURSES.filter(c => {
    if (ageFilter !== 'all' && !c.ageGroups.includes(ageFilter)) return false;
    if (durationFilter !== 'all' && c.days !== parseInt(durationFilter)) return false;
    return true;
  });

  function startCourse(course: Course) {
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + course.days * 86400000).toISOString().slice(0, 10);

    // 장소를 날짜별로 분배
    const dayCount = course.days + 1;
    const days: { date: string; places: { contentId: string; title: string; address: string; category: string }[] }[] = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), places: [] });
    }
    course.places.forEach((p, idx) => {
      const dayIdx = idx % dayCount;
      days[dayIdx].places.push({
        contentId: `course_${course.id}_${idx}`,
        title: p.name,
        address: p.address,
        category: 'attraction',
      });
    });

    localStorage.setItem('course_draft', JSON.stringify({
      title: `${course.title} (${course.region})`,
      startDate,
      endDate,
      days,
    }));
    router.push('/plan?fromCourse=1');
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 pt-12 pb-3">
        <h1 className="text-lg font-bold text-gray-900">추천 코스</h1>
      </div>

      <div className="pt-20 px-4">
        {/* 필터: 나이 */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2">아이 나이</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'infant', 'toddler', 'child', 'tween'] as const).map(a => (
              <button
                key={a}
                onClick={() => setAgeFilter(a)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  ageFilter === a ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {a === 'all' ? '전체' : AGE_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        {/* 필터: 기간 */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2">여행 기간</p>
          <div className="flex gap-2">
            {(['all', '0', '1', '2'] as DurationFilter[]).map(d => (
              <button
                key={d}
                onClick={() => setDurationFilter(d)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  durationFilter === d ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {d === 'all' ? '전체' : DURATION_LABEL[d]}
              </button>
            ))}
          </div>
        </div>

        {/* 코스 카드 */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-5xl">🔍</span>
            <p className="text-sm text-gray-400">해당 조건의 코스가 없어요</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map(course => (
            <Card key={course.id} className="overflow-hidden border-gray-200 gap-0 py-0">
              {/* 상단 헤더 */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold h-5 px-2 bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {DURATION_LABEL[String(course.days)]}
                      </Badge>
                      {course.ageGroups.map(a => (
                        <Badge key={a} variant="outline" className="text-[10px] font-semibold h-5 px-2 text-gray-600">
                          {AGE_LABEL[a]}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{course.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">{course.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">📍 {course.region}</p>
                  </div>
                  <span className="text-3xl ml-3 flex-shrink-0">{course.emoji}</span>
                </div>
              </div>

              {/* 장소 목록 */}
              <CardContent className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  {course.places.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-gray-800 font-medium flex-1 truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{p.type}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => startCourse(course)}
                  className="mt-4 w-full rounded-xl py-3 h-auto font-semibold text-sm"
                >
                  이 코스로 일정 만들기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
