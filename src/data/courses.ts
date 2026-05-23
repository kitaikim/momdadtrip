import type { AgeGroup } from '@/types';

export interface CoursePlace {
  name: string;
  type: string;
  address: string;
}

export interface Course {
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

export const COURSES: Course[] = [
  // ── 춘천 ──
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
    id: 'chuncheon-1night',
    title: '남이섬·춘천 1박2일',
    emoji: '🍂',
    description: '남이섬 자연 산책, 소양강 스카이워크, 막국수 맛집까지',
    region: '춘천·가평',
    days: 1,
    ageGroups: ['toddler', 'child', 'tween'],
    gradient: 'from-green-400 to-teal-500',
    places: [
      { name: '남이섬', type: '🍂 명소', address: '가평군 가평읍 북한강변로 1024' },
      { name: '소양강 스카이워크', type: '🌊 명소', address: '춘천시 영서로 2663' },
      { name: '춘천막국수 닭갈비 골목', type: '🍗 맛집', address: '춘천시 명동길' },
      { name: '레고랜드 코리아', type: '🎡 체험', address: '춘천시 하중도길 128' },
    ],
  },

  // ── 강릉 ──
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
      { name: '주문진 해수욕장', type: '🐟 해변', address: '강릉시 주문진읍 주문로 174-1' },
      { name: '강릉 커피거리', type: '☕ 맛집', address: '강릉시 창해로14번길 20' },
    ],
  },
  {
    id: 'gangneung-1night',
    title: '강릉 정동진 1박2일',
    emoji: '🌅',
    description: '정동진 일출, 경포호 둘레길, 안목 커피 거리',
    region: '강릉',
    days: 1,
    ageGroups: ['child', 'tween'],
    gradient: 'from-orange-400 to-amber-500',
    places: [
      { name: '정동진', type: '🌅 명소', address: '강릉시 강동면 정동역길' },
      { name: '경포호 둘레길', type: '🌿 자연', address: '강릉시 저동 경포호' },
      { name: '안목 커피거리', type: '☕ 맛집', address: '강릉시 창해로14번길 20' },
      { name: '경포해변', type: '🏖️ 해변', address: '강릉시 경포로 365' },
    ],
  },

  // ── 속초·고성 ──
  {
    id: 'sokcho-daytrip',
    title: '속초 바다 당일치기',
    emoji: '🦀',
    description: '속초해수욕장, 영금정, 관광수산시장에서 싱싱한 해산물',
    region: '속초',
    days: 0,
    ageGroups: ['child', 'tween'],
    gradient: 'from-blue-400 to-sky-500',
    places: [
      { name: '속초해수욕장', type: '🏖️ 해변', address: '속초시 조양동 1407' },
      { name: '영금정', type: '🌊 명소', address: '속초시 동명동 영금정로 105' },
      { name: '속초관광수산시장', type: '🦀 맛집', address: '속초시 중앙로147번길 16' },
      { name: '청초호 수변공원', type: '🌿 공원', address: '속초시 조양동 1487' },
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

  // ── 평창 ──
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
    id: 'pyeongchang-daytrip',
    title: '평창 월정사 당일치기',
    emoji: '⛩️',
    description: '전나무 숲길 월정사, 이효석문화마을, 봉평 메밀꽃밭',
    region: '평창',
    days: 0,
    ageGroups: ['toddler', 'child', 'tween'],
    gradient: 'from-emerald-400 to-green-600',
    places: [
      { name: '월정사 전나무 숲길', type: '⛩️ 명소', address: '평창군 진부면 오대산로 374-8' },
      { name: '이효석문화마을', type: '🌸 명소', address: '평창군 봉평면 이효석길 33' },
      { name: '봉평 메밀꽃밭', type: '🌿 자연', address: '평창군 봉평면 창동리' },
      { name: '무이예술관', type: '🎨 문화', address: '평창군 봉평면 기풍리 203' },
    ],
  },

  // ── 삼척 ──
  {
    id: 'samcheok-daytrip',
    title: '삼척 해양 당일치기',
    emoji: '🚂',
    description: '해양레일바이크, 죽서루, 삼척해수욕장',
    region: '삼척',
    days: 0,
    ageGroups: ['child', 'tween'],
    gradient: 'from-indigo-400 to-blue-500',
    places: [
      { name: '삼척 해양레일바이크', type: '🚂 체험', address: '삼척시 근덕면 공양왕길 2' },
      { name: '죽서루', type: '🏯 역사', address: '삼척시 죽서루길 37' },
      { name: '삼척해수욕장', type: '🏖️ 해변', address: '삼척시 수로부인길 333' },
      { name: '장호항 투명 카약', type: '🛶 체험', address: '삼척시 근덕면 장호리' },
    ],
  },
  {
    id: 'samcheok-1night',
    title: '삼척 동굴·계곡 1박2일',
    emoji: '🦇',
    description: '환선굴 탐험, 덕풍계곡 물놀이, 장호항 스노클링',
    region: '삼척',
    days: 1,
    ageGroups: ['child', 'tween'],
    gradient: 'from-violet-400 to-purple-600',
    places: [
      { name: '환선굴', type: '🦇 탐험', address: '삼척시 신기면 환선로 800' },
      { name: '덕풍계곡', type: '💧 자연', address: '삼척시 가곡면 풍곡리' },
      { name: '장호항 스노클링', type: '🤿 체험', address: '삼척시 근덕면 장호리' },
      { name: '삼척 해양레일바이크', type: '🚂 체험', address: '삼척시 근덕면 공양왕길 2' },
    ],
  },

  // ── 영월 ──
  {
    id: 'yeongwol-daytrip',
    title: '영월 역사·별 당일치기',
    emoji: '⭐',
    description: '청령포 역사 탐방, 별마로천문대 별 관측',
    region: '영월',
    days: 0,
    ageGroups: ['child', 'tween'],
    gradient: 'from-slate-600 to-blue-700',
    places: [
      { name: '청령포', type: '🏯 역사', address: '영월군 남면 광천리 산67-1' },
      { name: '장릉 (단종릉)', type: '⛩️ 역사', address: '영월군 영월읍 단종로 190' },
      { name: '별마로천문대', type: '⭐ 체험', address: '영월군 영월읍 천문대길 397' },
      { name: '동강어라연', type: '🌿 자연', address: '영월군 영월읍 거운리' },
    ],
  },
  {
    id: 'yeongwol-1night',
    title: '영월 자연·동굴 1박2일',
    emoji: '🌿',
    description: '고씨동굴, 청령포, 곤충박물관에서 아이와 탐험',
    region: '영월',
    days: 1,
    ageGroups: ['child', 'tween'],
    gradient: 'from-teal-400 to-green-600',
    places: [
      { name: '고씨동굴', type: '🦇 탐험', address: '영월군 김삿갓면 고씨동굴길 6' },
      { name: '청령포', type: '🏯 역사', address: '영월군 남면 광천리 산67-1' },
      { name: '별마로천문대', type: '⭐ 체험', address: '영월군 영월읍 천문대길 397' },
      { name: '영월 곤충박물관', type: '🐛 체험', address: '영월군 영월읍 흥월리 1078-1' },
    ],
  },

  // ── 그랜드 투어 ──
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
