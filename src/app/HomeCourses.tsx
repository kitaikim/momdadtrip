'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COURSES } from '@/data/courses';

const DURATION_LABEL: Record<string, string> = { '0': '당일', '1': '1박2일', '2': '2박3일' };

export default function HomeCourses() {
  const router = useRouter();

  function startCourse(courseId: string) {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + course.days * 86400000).toISOString().slice(0, 10);
    const dayCount = course.days + 1;
    const days: { date: string; places: { contentId: string; title: string; address: string; category: string }[] }[] = [];
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), places: [] });
    }
    course.places.forEach((p, idx) => {
      days[idx % dayCount].places.push({
        contentId: `course_${course.id}_${idx}`,
        title: p.name,
        address: p.address,
        category: 'attraction',
      });
    });
    localStorage.setItem('course_draft', JSON.stringify({ title: `${course.title} (${course.region})`, startDate, endDate, days }));
    router.push('/plan?fromCourse=1');
  }

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">추천 여행 코스</h2>
        <Link href="/course" className="text-xs text-blue-500 font-medium">전체 보기 →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {COURSES.slice(0, 8).map(course => (
          <button
            key={course.id}
            onClick={() => startCourse(course.id)}
            className={`flex-shrink-0 w-44 rounded-2xl bg-gradient-to-br ${course.gradient} p-4 text-left text-white active:scale-95 transition-transform`}
          >
            <span className="text-2xl block mb-2">{course.emoji}</span>
            <p className="text-[10px] font-semibold opacity-80 mb-0.5">
              {DURATION_LABEL[String(course.days)]} · {course.region}
            </p>
            <p className="text-sm font-bold leading-snug line-clamp-2">{course.title}</p>
            <p className="text-[11px] opacity-70 mt-1.5 line-clamp-2">{course.description}</p>
            <div className="mt-2 text-[10px] bg-white/20 rounded-full px-2 py-0.5 inline-block font-medium">
              일정으로 만들기 →
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
