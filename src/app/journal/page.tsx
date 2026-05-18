import { Suspense } from 'react';
import JournalClient from './JournalClient';

export default function JournalPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </main>
    }>
      <JournalClient />
    </Suspense>
  );
}
