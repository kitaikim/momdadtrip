import { Suspense } from 'react';
import MissionClient from './MissionClient';

export default function MissionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    }>
      <MissionClient />
    </Suspense>
  );
}
