'use client';

import { useState } from 'react';
import { AGE_GROUPS, type AgeGroup } from '@/types';
import { saveChildProfile } from '@/lib/childProfile';

const AGE_EMOJIS: Record<AgeGroup, string> = {
  infant: '👶',
  toddler: '🧒',
  child: '🏃',
  tween: '🎒',
};

interface Props {
  onComplete: () => void;
}

export default function ChildOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);

  const handleComplete = () => {
    if (!selectedAge) return;
    saveChildProfile({ name: name.trim() || '우리 아이', ageGroup: selectedAge });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sky-500 to-teal-400 flex flex-col items-center justify-center px-8 text-white">
      {step === 1 && (
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <span className="text-7xl mb-5">👨‍👩‍👧</span>
          <h2 className="text-2xl font-bold mb-2">안녕하세요!</h2>
          <p className="text-white/80 text-sm mb-8 leading-relaxed">
            강원도 여행을 아이에게 딱 맞게<br />
            준비해드릴게요. 먼저 아이 이름을 알려주세요.
          </p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
            placeholder="예: 민준, 서아, 하린..."
            className="w-full bg-white/20 backdrop-blur text-white placeholder-white/50 rounded-2xl px-5 py-4 text-lg text-center focus:outline-none focus:bg-white/30 mb-4"
            maxLength={10}
            autoFocus
          />
          <button
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="w-full bg-white text-sky-500 font-bold py-4 rounded-2xl text-base disabled:opacity-40 active:scale-95 transition-transform"
          >
            다음 →
          </button>
          <button onClick={onComplete} className="mt-4 text-white/50 text-xs underline">
            건너뛰기
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <span className="text-7xl mb-5">🎂</span>
          <h2 className="text-2xl font-bold mb-2">
            {name.trim() ? `${name.trim()}은(는)` : '아이는'} 몇 살이에요?
          </h2>
          <p className="text-white/80 text-sm mb-7">연령대에 맞는 여행지를 추천해드려요</p>
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            {(Object.entries(AGE_GROUPS) as [AgeGroup, { label: string; range: string }][]).map(([key, { label, range }]) => (
              <button
                key={key}
                onClick={() => setSelectedAge(key)}
                className={`rounded-2xl py-4 px-3 border-2 transition-all active:scale-95 ${
                  selectedAge === key
                    ? 'bg-white text-sky-600 border-white'
                    : 'bg-white/15 border-white/30 text-white'
                }`}
              >
                <span className="text-3xl block mb-1">{AGE_EMOJIS[key]}</span>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs opacity-70 mt-0.5">{range}</p>
              </button>
            ))}
          </div>
          <button
            onClick={handleComplete}
            disabled={!selectedAge}
            className="w-full bg-white text-sky-500 font-bold py-4 rounded-2xl text-base disabled:opacity-40 active:scale-95 transition-transform"
          >
            여행 시작하기 🎉
          </button>
          <button onClick={() => setStep(1)} className="mt-4 text-white/50 text-xs underline">
            ← 이름 다시 입력
          </button>
        </div>
      )}
    </div>
  );
}
