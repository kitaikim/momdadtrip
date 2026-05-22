'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  VirtualUser, AgeGroupKey, RegionKey, ThemeKey,
  PLACES_BY_REGION, REGION_SIGUNGU_CODE, JOURNAL_TEMPLATES,
  MISSIONS_BY_REGION, TRIP_TITLES,
  generateRandomPersona, randomItem,
  REGION_LABELS, THEME_LABELS, AGE_LABELS,
} from './content';

const STORAGE_KEY = 'admin_virtual_users';

function loadUsers(): VirtualUser[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function saveUsers(users: VirtualUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
function newDeviceId() {
  return 'virt-' + crypto.randomUUID();
}

const REGION_EMOJI: Record<RegionKey, string> = {
  sokcho: '🦞', gangneung: '☕', chuncheon: '🍗',
  pyeongchang: '🐑', jeongseon: '🚂', wonju: '🌉',
};
const THEME_EMOJI: Record<ThemeKey, string> = {
  nature: '🌿', beach: '🏖️', food: '🍜',
  activity: '🎯', history: '🏯', healing: '💆',
};
const AGE_EMOJI: Record<AgeGroupKey, string> = { toddler: '🍼', child: '🎒', tween: '🎧' };

interface ContentStats { trips: number; journals: number; stamps: number; missions: number; }

const EMPTY_FORM = (): Omit<VirtualUser, 'deviceId' | 'createdAt' | 'hasContent'> => ({
  name: '', childName: '', ageGroup: 'child', region: 'sokcho', theme: 'nature', homeCity: '서울', note: '',
});

export default function VirtualUsersPage() {
  const [users, setUsers] = useState<VirtualUser[]>([]);
  const [stats, setStats] = useState<Record<string, ContentStats>>({});
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM());
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchStats = useCallback(async (userList: VirtualUser[]) => {
    if (!userList.length) return;
    const ids = userList.map((u) => u.deviceId).join(',');
    const res = await fetch(`/api/admin/virtual?deviceIds=${ids}`);
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    const list = loadUsers();
    setUsers(list);
    fetchStats(list);
  }, [fetchStats]);

  const openCreate = () => { setForm(EMPTY_FORM()); setEditId(null); setShowModal(true); };
  const openEdit = (u: VirtualUser) => {
    setForm({ name: u.name, childName: u.childName, ageGroup: u.ageGroup, region: u.region, theme: u.theme, homeCity: u.homeCity, note: u.note });
    setEditId(u.deviceId);
    setShowModal(true);
  };

  const handleRandom = () => setForm((f) => ({ ...f, ...generateRandomPersona() }));

  const handleSave = () => {
    if (!form.name || !form.childName) return alert('이름과 아이 이름을 입력해주세요.');
    let updated: VirtualUser[];
    if (editId) {
      updated = users.map((u) => u.deviceId === editId ? { ...u, ...form } : u);
    } else {
      const newUser: VirtualUser = { ...form, deviceId: newDeviceId(), createdAt: new Date().toISOString(), hasContent: false };
      updated = [...users, newUser];
    }
    setUsers(updated);
    saveUsers(updated);
    setShowModal(false);
  };

  const handleGenerate = async (u: VirtualUser) => {
    setGenerating(u.deviceId);
    // 기존 컨텐츠 삭제
    await fetch('/api/admin/virtual', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: u.deviceId }),
    });

    const places = PLACES_BY_REGION[u.region];
    const templates = JOURNAL_TEMPLATES[u.region]?.[u.ageGroup] ?? JOURNAL_TEMPLATES['sokcho']['child'];
    const pickedTemplates = templates.slice(0, Math.min(templates.length, 2));
    const missionIds = MISSIONS_BY_REGION[u.region].slice(0, 3 + Math.floor(Math.random() * 2));
    const titles = TRIP_TITLES[u.region];
    const tripTitle = randomItem(titles);

    await fetch('/api/admin/virtual/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: { ...u, tripTitle },
        places: places.slice(0, pickedTemplates.length * 2),
        journalTemplates: pickedTemplates,
        missionIds,
        sigunguCode: REGION_SIGUNGU_CODE[u.region],
      }),
    });

    const updated = users.map((x) => x.deviceId === u.deviceId ? { ...x, hasContent: true } : x);
    setUsers(updated);
    saveUsers(updated);
    await fetchStats(updated);
    setGenerating(null);
  };

  const handleDeleteContent = async (deviceId: string) => {
    if (!confirm('이 가상유저의 모든 컨텐츠(여행·일지·스탬프·미션)를 삭제할까요?')) return;
    setDeleting(deviceId);
    await fetch('/api/admin/virtual', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const updated = users.map((u) => u.deviceId === deviceId ? { ...u, hasContent: false } : u);
    setUsers(updated);
    saveUsers(updated);
    setStats((prev) => ({ ...prev, [deviceId]: { trips: 0, journals: 0, stamps: 0, missions: 0 } }));
    setDeleting(null);
  };

  const handleDeleteUser = (deviceId: string, name: string) => {
    if (!confirm(`"${name}"을 완전히 삭제할까요? 컨텐츠도 함께 삭제됩니다.`)) return;
    fetch('/api/admin/virtual', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const updated = users.filter((u) => u.deviceId !== deviceId);
    setUsers(updated);
    saveUsers(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">가상유저 관리</h2>
          <p className="text-sm text-gray-400 mt-0.5">가상 사용자와 실감나는 여행 컨텐츠를 생성해요</p>
        </div>
        <button onClick={openCreate} className="bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
          + 새 가상유저
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400 text-sm">아직 가상유저가 없어요.</p>
          <button onClick={openCreate} className="mt-4 text-sky-500 text-sm font-semibold">+ 첫 번째 가상유저 만들기</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => {
            const s = stats[u.deviceId];
            const isExpanded = expandedId === u.deviceId;
            const isGenerating = generating === u.deviceId;
            const isDeleting = deleting === u.deviceId;

            return (
              <div key={u.deviceId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* 메인 카드 */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* 아바타 */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {REGION_EMOJI[u.region]}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{u.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{u.homeCity}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full">
                          {AGE_EMOJI[u.ageGroup]} {u.childName} · {AGE_LABELS[u.ageGroup]}
                        </span>
                        <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                          📍 {REGION_LABELS[u.region]}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                          {THEME_EMOJI[u.theme]} {THEME_LABELS[u.theme]}
                        </span>
                      </div>

                      {/* 컨텐츠 현황 */}
                      {s && (s.trips > 0 || s.journals > 0 || s.stamps > 0 || s.missions > 0) ? (
                        <div className="flex gap-3 mt-2">
                          {[
                            { icon: '🗺️', val: s.trips, label: '여행' },
                            { icon: '📔', val: s.journals, label: '일지' },
                            { icon: '🏅', val: s.stamps, label: '스탬프' },
                            { icon: '🎯', val: s.missions, label: '미션' },
                          ].map(({ icon, val, label }) => (
                            <span key={label} className="text-xs text-gray-500">
                              {icon} {val} {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300 mt-2">컨텐츠 없음 — 아래 버튼으로 생성하세요</p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleGenerate(u)}
                        disabled={isGenerating || isDeleting}
                        className="text-xs bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {isGenerating ? '생성 중...' : u.hasContent ? '재생성' : '컨텐츠 생성'}
                      </button>
                      <button onClick={() => openEdit(u)} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        수정
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : u.deviceId)}
                        className="text-xs border border-gray-200 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        {isExpanded ? '접기' : '상세'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 상세 패널 */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <div><span className="text-gray-400">기기 ID</span><br /><span className="font-mono text-gray-600">{u.deviceId.slice(0, 20)}...</span></div>
                      <div><span className="text-gray-400">생성일</span><br /><span>{new Date(u.createdAt).toLocaleDateString('ko-KR')}</span></div>
                      {u.note && <div className="col-span-2"><span className="text-gray-400">메모</span><br /><span>{u.note}</span></div>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      {u.hasContent && (
                        <button
                          onClick={() => handleDeleteContent(u.deviceId)}
                          disabled={isDeleting}
                          className="text-xs text-orange-500 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg"
                        >
                          {isDeleting ? '삭제 중...' : '컨텐츠만 삭제'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(u.deviceId, u.name)}
                        className="text-xs text-red-400 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg"
                      >
                        가상유저 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{editId ? '가상유저 수정' : '새 가상유저 생성'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <button
              onClick={handleRandom}
              className="w-full border-2 border-dashed border-sky-200 text-sky-500 text-sm font-semibold py-2.5 rounded-xl hover:bg-sky-50"
            >
              🎲 랜덤으로 채우기
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">가족 이름</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 이민준 가족"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">아이 이름</label>
                <input value={form.childName} onChange={(e) => setForm((f) => ({ ...f, childName: e.target.value }))}
                  placeholder="예: 민준"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">거주 도시</label>
                <input value={form.homeCity} onChange={(e) => setForm((f) => ({ ...f, homeCity: e.target.value }))}
                  placeholder="예: 서울"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">아이 연령대</label>
                <select value={form.ageGroup} onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value as AgeGroupKey }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                  <option value="toddler">유아 (2~5세)</option>
                  <option value="child">어린이 (6~9세)</option>
                  <option value="tween">초등고학년 (10~12세)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">선호 지역</label>
                <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value as RegionKey }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                  <option value="sokcho">속초시</option>
                  <option value="gangneung">강릉시</option>
                  <option value="chuncheon">춘천시</option>
                  <option value="pyeongchang">평창군</option>
                  <option value="jeongseon">정선군</option>
                  <option value="wonju">원주시</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">선호 테마</label>
                <select value={form.theme} onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value as ThemeKey }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                  <option value="nature">자연·생태</option>
                  <option value="beach">바다·해변</option>
                  <option value="food">음식·맛집</option>
                  <option value="activity">체험·액티비티</option>
                  <option value="history">역사·교육</option>
                  <option value="healing">힐링·휴양</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">메모 (선택)</label>
                <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="자유롭게 메모"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm">취소</button>
              <button onClick={handleSave} className="flex-1 bg-sky-500 text-white py-2.5 rounded-xl text-sm font-semibold">
                {editId ? '저장' : '가상유저 생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
