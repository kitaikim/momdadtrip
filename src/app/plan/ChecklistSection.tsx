'use client';

import { useState, useEffect } from 'react';
import { getChildProfile } from '@/lib/childProfile';
import type { AgeGroup } from '@/types';

interface CheckItem {
  id: string;
  label: string;
  emoji: string;
}

interface Category {
  id: string;
  label: string;
  items: CheckItem[];
}

const CHECKLIST: Record<AgeGroup, Category[]> = {
  infant: [
    {
      id: 'baby',
      label: '유아 필수품',
      items: [
        { id: 'formula', label: '분유 및 젖병', emoji: '🍼' },
        { id: 'diaper', label: '기저귀 (충분한 수량)', emoji: '👶' },
        { id: 'wipes', label: '물티슈', emoji: '🧻' },
        { id: 'changing_pad', label: '기저귀 교환 패드', emoji: '📦' },
        { id: 'stroller', label: '유모차', emoji: '🛒' },
        { id: 'carseat', label: '카시트 장착 확인', emoji: '🚗' },
        { id: 'blanket', label: '아기 이불/침낭', emoji: '🛏️' },
      ],
    },
    {
      id: 'health',
      label: '건강·위생',
      items: [
        { id: 'thermometer', label: '체온계', emoji: '🌡️' },
        { id: 'medicine', label: '해열제 (영아용)', emoji: '💊' },
        { id: 'mosquito', label: '모기 기피제 (영아용)', emoji: '🦟' },
        { id: 'sunscreen', label: '선크림 (SPF50+)', emoji: '🧴' },
      ],
    },
    {
      id: 'clothing',
      label: '의류',
      items: [
        { id: 'clothes_extra', label: '여분 의류 (3벌 이상)', emoji: '👕' },
        { id: 'hat', label: '모자', emoji: '👒' },
        { id: 'socks_extra', label: '여분 양말', emoji: '🧦' },
      ],
    },
  ],
  toddler: [
    {
      id: 'baby',
      label: '유아 필수품',
      items: [
        { id: 'diaper', label: '기저귀/팬티형 기저귀', emoji: '👶' },
        { id: 'stroller', label: '유모차', emoji: '🛒' },
        { id: 'carseat', label: '카시트 확인', emoji: '🚗' },
        { id: 'favorite_toy', label: '좋아하는 장난감/인형', emoji: '🧸' },
        { id: 'water_bottle', label: '유아용 물병', emoji: '🍶' },
        { id: 'snack', label: '유아 간식', emoji: '🍪' },
      ],
    },
    {
      id: 'health',
      label: '건강·위생',
      items: [
        { id: 'thermometer', label: '체온계', emoji: '🌡️' },
        { id: 'medicine', label: '해열제·소화제', emoji: '💊' },
        { id: 'bandaid', label: '밴드/소독약', emoji: '🩹' },
        { id: 'mosquito', label: '모기 기피제', emoji: '🦟' },
        { id: 'sunscreen', label: '선크림 (어린이용)', emoji: '🧴' },
      ],
    },
    {
      id: 'clothing',
      label: '의류',
      items: [
        { id: 'clothes_extra', label: '여분 의류 (3벌)', emoji: '👕' },
        { id: 'hat', label: '모자', emoji: '👒' },
        { id: 'shoes', label: '편한 신발', emoji: '👟' },
        { id: 'raincoat', label: '우비/우산', emoji: '☂️' },
      ],
    },
  ],
  child: [
    {
      id: 'essentials',
      label: '필수 준비물',
      items: [
        { id: 'water_bottle', label: '물병', emoji: '💧' },
        { id: 'snack', label: '간식', emoji: '🍪' },
        { id: 'backpack', label: '아이 배낭', emoji: '🎒' },
        { id: 'carseat', label: '카시트/부스터 확인', emoji: '🚗' },
      ],
    },
    {
      id: 'health',
      label: '건강·위생',
      items: [
        { id: 'medicine', label: '해열제·소화제·멀미약', emoji: '💊' },
        { id: 'bandaid', label: '밴드/소독약', emoji: '🩹' },
        { id: 'mosquito', label: '모기 기피제', emoji: '🦟' },
        { id: 'sunscreen', label: '선크림', emoji: '🧴' },
        { id: 'hand_sanitizer', label: '손 소독제', emoji: '🧼' },
      ],
    },
    {
      id: 'activity',
      label: '활동·체험',
      items: [
        { id: 'camera', label: '카메라 (아이 체험용)', emoji: '📷' },
        { id: 'activity_book', label: '여행 활동지/스케치북', emoji: '📓' },
        { id: 'change_clothes', label: '여분 의류', emoji: '👕' },
        { id: 'hat', label: '모자', emoji: '👒' },
        { id: 'raincoat', label: '우비', emoji: '☂️' },
      ],
    },
  ],
  tween: [
    {
      id: 'essentials',
      label: '필수 준비물',
      items: [
        { id: 'water_bottle', label: '물병', emoji: '💧' },
        { id: 'snack', label: '간식', emoji: '🍪' },
        { id: 'backpack', label: '배낭', emoji: '🎒' },
        { id: 'id', label: '신분증 (학생증)', emoji: '🪪' },
      ],
    },
    {
      id: 'health',
      label: '건강·위생',
      items: [
        { id: 'medicine', label: '상비약 (해열제·멀미약)', emoji: '💊' },
        { id: 'bandaid', label: '밴드/소독약', emoji: '🩹' },
        { id: 'sunscreen', label: '선크림', emoji: '🧴' },
        { id: 'hand_sanitizer', label: '손 소독제', emoji: '🧼' },
      ],
    },
    {
      id: 'activity',
      label: '활동·기록',
      items: [
        { id: 'camera', label: '카메라/핸드폰', emoji: '📸' },
        { id: 'diary', label: '여행 일기장', emoji: '📒' },
        { id: 'change_clothes', label: '여분 의류', emoji: '👕' },
        { id: 'hat', label: '모자·선글라스', emoji: '🕶️' },
        { id: 'raincoat', label: '우비', emoji: '☂️' },
      ],
    },
  ],
};

// 나이대 무관한 공통 항목
const COMMON_CATEGORY: Category = {
  id: 'common',
  label: '공통 준비',
  items: [
    { id: 'booking_confirm', label: '숙소 예약 확인', emoji: '🏨' },
    { id: 'insurance', label: '여행자 보험', emoji: '🛡️' },
    { id: 'cash', label: '현금 준비', emoji: '💴' },
    { id: 'emergency_contact', label: '비상 연락처 메모', emoji: '📞' },
    { id: 'charger', label: '충전기', emoji: '🔌' },
    { id: 'map', label: '여행지 지도/경로 확인', emoji: '🗺️' },
  ],
};

function storageKey(tripId: string) {
  return `checklist_${tripId}`;
}

export default function ChecklistSection({ tripId }: { tripId: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('toddler');

  useEffect(() => {
    const profile = getChildProfile();
    if (profile) setAgeGroup(profile.ageGroup);

    const stored = localStorage.getItem(storageKey(tripId));
    if (stored) {
      try { setChecked(new Set(JSON.parse(stored))); } catch {}
    }
  }, [tripId]);

  function toggle(itemId: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      localStorage.setItem(storageKey(tripId), JSON.stringify(Array.from(next)));
      return next;
    });
  }

  const categories = [...CHECKLIST[ageGroup], COMMON_CATEGORY];
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = categories.reduce((s, c) => s + c.items.filter(i => checked.has(i.id)).length, 0);
  const allDone = checkedCount === totalItems;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
      {/* 헤더 (토글) */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{allDone ? '✅' : '🧳'}</span>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">여행 준비 체크리스트</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {checkedCount}/{totalItems} 완료
              {allDone && ' · 준비 완료! 🎉'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 진행도 바 */}
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalItems) * 100}%` }}
            />
          </div>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-50 px-4 pb-4">
          <div className="flex flex-col gap-4 mt-3">
            {categories.map(cat => (
              <div key={cat.id}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                  {cat.label}
                </p>
                <div className="flex flex-col gap-1">
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        checked.has(item.id) ? 'bg-sky-50' : 'bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked.has(item.id) ? 'bg-sky-500 border-sky-500' : 'border-gray-300'
                      }`}>
                        {checked.has(item.id) && <span className="text-white text-[10px] font-bold">✓</span>}
                      </span>
                      <span className="text-sm">{item.emoji}</span>
                      <span className={`text-sm ${checked.has(item.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {allDone && (
            <div className="mt-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-sky-600">🎉 모든 준비가 완료됐어요!</p>
              <p className="text-xs text-sky-400 mt-0.5">즐거운 여행 되세요 ✈️</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
