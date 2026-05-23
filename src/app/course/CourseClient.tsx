'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AgeGroup } from '@/types';
import { COURSES, type Course } from '@/data/courses';

type DurationFilter = 'all' | '0' | '1' | '2';

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
