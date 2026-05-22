export type AgeGroupKey = 'toddler' | 'child' | 'tween';
export type RegionKey = 'sokcho' | 'gangneung' | 'chuncheon' | 'pyeongchang' | 'jeongseon' | 'wonju';
export type ThemeKey = 'nature' | 'beach' | 'food' | 'activity' | 'history' | 'healing';

export interface VirtualUser {
  deviceId: string;
  name: string;
  childName: string;
  ageGroup: AgeGroupKey;
  region: RegionKey;
  theme: ThemeKey;
  homeCity: string;
  note: string;
  createdAt: string;
  hasContent: boolean;
}

// ─── 지역별 실제 장소 ───────────────────────────────────────────────────────
export const PLACES_BY_REGION: Record<RegionKey, Array<{ contentId: string; title: string; address: string }>> = {
  sokcho: [
    { contentId: 'vp_s1', title: '속초해수욕장', address: '강원특별자치도 속초시 해수욕장길 173' },
    { contentId: 'vp_s2', title: '설악산 권금성 케이블카', address: '강원특별자치도 속초시 설악산로 1085' },
    { contentId: 'vp_s3', title: '아바이마을', address: '강원특별자치도 속초시 청호동 1-65' },
    { contentId: 'vp_s4', title: '속초 중앙시장', address: '강원특별자치도 속초시 중앙로 147번길 12' },
    { contentId: 'vp_s5', title: '외옹치 바다향기로', address: '강원특별자치도 속초시 외옹치1길 49' },
  ],
  gangneung: [
    { contentId: 'vp_g1', title: '경포해수욕장', address: '강원특별자치도 강릉시 창해로 514' },
    { contentId: 'vp_g2', title: '강릉 안목 커피거리', address: '강원특별자치도 강릉시 창해로14번길 20' },
    { contentId: 'vp_g3', title: '정동진 해돋이 해수욕장', address: '강원특별자치도 강릉시 강동면 정동진리' },
    { contentId: 'vp_g4', title: '오죽헌', address: '강원특별자치도 강릉시 율곡로 3139번길 24' },
    { contentId: 'vp_g5', title: '강릉 선교장', address: '강원특별자치도 강릉시 운정길 63' },
  ],
  chuncheon: [
    { contentId: 'vp_c1', title: '남이섬', address: '강원특별자치도 춘천시 남산면 남이섬길 1' },
    { contentId: 'vp_c2', title: '춘천 닭갈비 골목', address: '강원특별자치도 춘천시 명동길 38' },
    { contentId: 'vp_c3', title: '소양강 스카이워크', address: '강원특별자치도 춘천시 영서로 2663' },
    { contentId: 'vp_c4', title: '제이드가든 수목원', address: '강원특별자치도 춘천시 남산면 햇골길 80' },
    { contentId: 'vp_c5', title: '강촌 레일파크', address: '강원특별자치도 춘천시 신동면 증리 568-1' },
  ],
  pyeongchang: [
    { contentId: 'vp_p1', title: '대관령 양떼목장', address: '강원특별자치도 평창군 대관령면 대관령마루길 483-32' },
    { contentId: 'vp_p2', title: '오대산 월정사', address: '강원특별자치도 평창군 진부면 오대산로 374-8' },
    { contentId: 'vp_p3', title: '알펜시아 리조트', address: '강원특별자치도 평창군 대관령면 올림픽로 715' },
    { contentId: 'vp_p4', title: '이효석 문화마을', address: '강원특별자치도 평창군 봉평면 이효석길 33-9' },
    { contentId: 'vp_p5', title: '발왕산 관광케이블카', address: '강원특별자치도 평창군 대관령면 올림픽로 715' },
  ],
  jeongseon: [
    { contentId: 'vp_j1', title: '정선 레일바이크', address: '강원특별자치도 정선군 여량면 여량리 400' },
    { contentId: 'vp_j2', title: '아우라지 나루터', address: '강원특별자치도 정선군 여량면 아우라지길 12' },
    { contentId: 'vp_j3', title: '정선 5일장', address: '강원특별자치도 정선군 정선읍 정선로 1359' },
    { contentId: 'vp_j4', title: '화암동굴', address: '강원특별자치도 정선군 화암면 화암동굴길 21' },
    { contentId: 'vp_j5', title: '하이원 스키리조트', address: '강원특별자치도 정선군 고한읍 하이원길 424' },
  ],
  wonju: [
    { contentId: 'vp_w1', title: '뮤지엄 산', address: '강원특별자치도 원주시 지정면 월송리 산16' },
    { contentId: 'vp_w2', title: '소금산 출렁다리', address: '강원특별자치도 원주시 지정면 간현리 산6' },
    { contentId: 'vp_w3', title: '치악산 국립공원', address: '강원특별자치도 원주시 소초면 치악로 461' },
    { contentId: 'vp_w4', title: '원주 한지테마파크', address: '강원특별자치도 원주시 한지공원길 151' },
    { contentId: 'vp_w5', title: '간현관광지 짚트랙', address: '강원특별자치도 원주시 지정면 간현리 576' },
  ],
};

// ─── 지역 → Supabase 시군구 코드 ─────────────────────────────────────────────
export const REGION_SIGUNGU_CODE: Record<RegionKey, string> = {
  sokcho: '6',
  gangneung: '3',
  chuncheon: '1',
  pyeongchang: '11',
  jeongseon: '12',
  wonju: '2',
};

// ─── 여행 제목 템플릿 ─────────────────────────────────────────────────────────
export const TRIP_TITLES: Record<RegionKey, string[]> = {
  sokcho: ['{child}이랑 속초 바다 여행', '여름 속초 2박 3일', '설악산·속초 가족 여행', '속초에서 만난 동해 바다'],
  gangneung: ['{child}이랑 강릉 커피·바다 여행', '정동진 일출 보러 강릉 가족 여행', '강릉 경포대 2박 3일', '강릉 힐링 가족 여행'],
  chuncheon: ['남이섬·춘천 당일치기', '{child}이 첫 남이섬 나들이', '춘천 닭갈비 먹으러 떠난 여행', '봄 춘천 제이드가든 가족 여행'],
  pyeongchang: ['대관령 양떼목장 가족 여행', '{child}이랑 평창 힐링 여행', '오대산 전나무 숲 당일 여행', '평창 알펜시아 겨울 여행'],
  jeongseon: ['정선 레일바이크 가족 나들이', '{child}이 첫 레일바이크 도전', '정선 5일장·레일바이크 1박 2일', '정선에서 즐기는 강원 진미'],
  wonju: ['소금산 출렁다리 가족 여행', '원주 뮤지엄 산 나들이', '{child}이랑 원주 당일치기', '원주 자연 힐링 가족 여행'],
};

// ─── 일지 템플릿 ─────────────────────────────────────────────────────────────
interface JournalTemplate {
  memo: string;
  mood: string;
  child_quote: string;
}

export const JOURNAL_TEMPLATES: Record<RegionKey, Record<AgeGroupKey, JournalTemplate[]>> = {
  sokcho: {
    toddler: [
      {
        memo: '드디어 속초 도착! 고속도로에서 {child}이가 내내 자더니 차 세우자마자 눈 번쩍 뜨고 일어났어요 😂 해수욕장 모래 밟자마자 앉아서 모래 파기 시작. 파도 소리 들으면서 아이스크림 먹었는데 이게 행복이구나 싶었어요. 저녁은 숙소 근처 해산물 식당에서 새우랑 가리비 구워 먹었는데 {child}이가 새우는 안 먹고 밥만 먹었어요 ㅋㅋ',
        mood: '🤩',
        child_quote: '모래모래! 더 해줘!',
      },
      {
        memo: '오늘은 아바이마을 갔어요. 갯배 타는 거 {child}이가 엄청 신기해하더라고요. 아바이 순대 먹으러 갔는데 아이가 냄새 맡더니 손으로 밀쳐서 웃겼어요. 결국 어른들만 먹고 {child}이는 떡볶이 하나 사줬어요. 오후에는 설악산 자락 따라 드라이브만 했는데 창문 열고 바람 맞으면서 조용히 잠들었어요. 이렇게 평화로운 날도 있구나 ❤️',
        mood: '🥹',
        child_quote: '배배 타! 배배!',
      },
    ],
    child: [
      {
        memo: '속초 첫날! 경치 좋다는 외옹치 바다향기로 산책했는데 {child}이가 걷기 싫다고 투덜대다가 바다 보이자마자 달리기 시작했어요 😂 해수욕장에서 파도에 발 담그고 놀았는데 파도 올 때마다 소리 지르면서 도망가고를 반복. 저녁은 속초 중앙시장에서 닭강정이랑 튀김 잔뜩 사 먹었어요. {child}이가 닭강정 다섯 개 혼자 다 먹었어요...',
        mood: '😊',
        child_quote: '파도가 나 잡으러 온다!',
      },
      {
        memo: '오늘 드디어 설악산 케이블카! {child}이가 올라가면서 "엄마 나 떨어지면 어떡해"를 연발해서 옆에서 손 꼭 잡고 있었는데, 정상 도착하니까 "와 진짜 높다 나 최고다!" 로 바뀜 ㅋㅋㅋ 권금성에서 바라본 경치 진짜 웅장했어요. 내려와서 아바이마을 갯배 타고 순대 먹었는데 {child}이가 의외로 잘 먹어서 깜짝 놀랐어요. 마지막 날이라 아쉬운 마음에 해수욕장에서 해 질 때까지 놀았어요.',
        mood: '🤩',
        child_quote: '또 오고 싶어! 다음에 또 와도 돼?',
      },
    ],
    tween: [
      {
        memo: '속초 여행 첫날. {child}이가 숙소 들어가자마자 "와 뷰 미쳤다" 라고 해서 웃겼어요. 요즘 많이 컸구나 싶었어요. 저녁에 중앙시장 야시장 구경했는데 {child}이가 닭강정이랑 물회 사달라고 해서 먹었는데 의외로 물회도 잘 먹더라고요. 밤에 숙소 테라스에서 파도 소리 들으면서 셋이 수다 떨었는데 이 순간이 오래 기억에 남을 것 같아요.',
        mood: '🥹',
        child_quote: '엄마 나 여기서 살고 싶어',
      },
      {
        memo: '설악산 케이블카 타러 갔는데 줄이 너무 길어서 30분 기다렸어요. {child}이가 처음에 지루하다고 했는데 케이블카 탔더니 진짜 좋아했어요. 권금성에서 사진 진짜 많이 찍었어요. {child}이가 폰으로 릴스 찍겠다고 이리저리 찍던 거 귀여웠어요 ㅋㅋ 내려와서 아바이마을 갯배 탔는데 갯배 위에서 셀카 열심히 찍었어요. 마지막 밤에 야시장에서 쫄면 먹으면서 이번 여행 최고였다고 말해줬어요.',
        mood: '😊',
        child_quote: '이 여행 인스타 올려도 돼요?',
      },
    ],
  },
  gangneung: {
    toddler: [
      {
        memo: '강릉 도착! 경포해수욕장 넓다는 말은 들었는데 이렇게 넓을 줄은 몰랐어요. {child}이가 한참 동안 그냥 멍하니 바다 바라봤어요. 처음 보는 바다라 무서운가 싶었는데 조금 있다가 달려나가더라고요 😊 모래 가지고 놀다가 과자 먹다가 낮잠 자다가 즐거운 하루였어요. 저녁은 회센터에서 광어회 먹었는데 {child}이는 계란찜만 먹었어요 ㅎㅎ',
        mood: '😊',
        child_quote: '파도 무서워! 엄마 안아줘',
      },
      {
        memo: '안목 커피거리에서 커피 한 잔 했어요. 아이 데리고 카페 가는 게 쉽지 않은데 테라스에서 바다 보면서 마시니까 너무 좋았어요. {child}이는 딸기 라떼 마셨는데 빨대로 쭉쭉 다 마시더라고요. 오후에 정동진 잠깐 들렀는데 모래시계 공원에서 {child}이가 시계 가리키면서 뭐라고 말하려는 게 귀여웠어요. 오늘 하루도 수고했어요 우리 셋 ❤️',
        mood: '🥹',
        child_quote: '커피! 커피! (달라고)',
      },
    ],
    child: [
      {
        memo: '강릉 첫날 경포해수욕장! {child}이가 튜브 타고 싶다고 해서 튜브 빌려서 한참 놀았어요. 파도에 밀려오고 나가고를 반복하면서 진짜 신나했어요. 오후에 오죽헌 갔는데 {child}이가 율곡 이이 설명 들으면서 "진짜 공부 천재였어요?" 하고 눈 동그랗게 뜨던 거 기억에 남아요 😊 저녁은 강릉 순두부 찌개 먹었는데 {child}이가 순두부가 진짜 맛있다고 두 그릇 먹었어요.',
        mood: '🤩',
        child_quote: '율곡 이이가 나보다 공부 잘했어요?',
      },
      {
        memo: '정동진 일출 보러 새벽 4시에 일어났어요. {child}이가 졸려서 투덜댔는데 해 뜨는 거 보더니 "우와" 소리 질렀어요. 해가 수평선 위로 올라오는 그 순간 셋이 손 잡고 봤는데 진짜 감동이었어요. 안목 커피거리에서 아침 커피 마시면서 {child}이는 핫초코 마셨어요. 바다 보면서 마시는 커피 최고예요.',
        mood: '🥹',
        child_quote: '엄마 해가 바다에서 나와요! 신기해!',
      },
    ],
    tween: [
      {
        memo: '강릉 첫날. {child}이가 커피거리 보더니 "엄마 나 카페 라떼 먹어봐도 돼요?" 물어봐서 결국 허락했어요 ㅋㅋ 경포해수욕장에서 저녁까지 놀았는데 {child}이가 친구들한테 자랑할 사진 엄청 찍었어요. 밤에 숙소에서 치킨 시켜 먹으면서 여행 사진 같이 보는데 우리 셋 진짜 많이 웃었어요.',
        mood: '😊',
        child_quote: '강릉 카페 진짜 감성적이다',
      },
      {
        memo: '정동진 새벽 일출 미션 성공! {child}이가 새벽에 일어나기 싫다고 했는데 일출 보더니 폰 들고 연신 찍어댔어요. SNS 올린다고 ㅋㅋ 낮에는 오죽헌이랑 선교장 구경했는데 {child}이가 역사 이야기 들으면서 진지하게 듣더라고요. 조금 컸구나 싶었어요. 강릉 여행 진짜 알차게 했어요.',
        mood: '🥹',
        child_quote: '일출 보니까 진짜 뭔가 충전되는 느낌이에요',
      },
    ],
  },
  chuncheon: {
    toddler: [
      {
        memo: '남이섬 첫 방문! 배 타고 들어가는 거 {child}이가 너무 신나했어요. 타타타타 소리 내면서 배 흔드는 거 무서워서 꼭 잡고 있었는데 본인은 무서운 줄도 모르고 좋아하더라고요. 섬 들어가서 나무 터널 산책했는데 {child}이가 낙엽 줍느라 10분에 5m도 못 갔어요 😂 닭갈비 골목에서 저녁 먹었는데 {child}이는 밥이랑 계란 부쳐 먹었어요.',
        mood: '🤩',
        child_quote: '배배! 물물! 나무나무!',
      },
    ],
    child: [
      {
        memo: '남이섬 왔어요! 나미나라 공화국이라고 나라인 척 하는 게 {child}이한테 설명해줬더니 "진짜 나라예요?" 하고 눈 동그랗게 뜨던 거 귀여웠어요. 자전거 빌려서 섬 한 바퀴 돌았는데 {child}이가 신나서 너무 빨리 달려서 따라가느라 힘들었어요 ㅋㅋ 저녁은 닭갈비 골목 가서 불판에 볶는 닭갈비 먹었는데 {child}이가 밥 볶는 거 도와주겠다고 나서서 같이 볶았어요.',
        mood: '😊',
        child_quote: '나도 닭갈비 볶을 수 있어!',
      },
      {
        memo: '소양강 스카이워크 갔어요. 투명 유리 바닥이라 {child}이가 처음엔 무섭다고 가장자리만 걸었는데 나중에는 가운데로 걷고 심지어 발로 쿵쿵 밟기까지 했어요 😂 강촌 레일파크도 갔는데 레일바이크 타면서 {child}이가 "내가 더 빨리 할게요!" 하면서 페달 열심히 밟았어요. 완전 날씨 좋은 날 타서 경치가 진짜 예뻤어요.',
        mood: '🤩',
        child_quote: '유리 바닥 걸어도 안 떨어지죠?',
      },
    ],
    tween: [
      {
        memo: '춘천 당일치기. {child}이가 남이섬은 너무 관광지 같다고 했는데 막상 가니까 사진 진짜 많이 찍었어요 ㅋㅋ 제이드가든 수목원도 갔는데 유럽 느낌이라 {child}이가 "여기 외국 같아요"하면서 좋아했어요. 닭갈비는 이미 알고 있었는지 저녁 뭐 먹냐고 물으니까 바로 닭갈비 라고 해서 웃겼어요. 잘 먹어서 다행이에요.',
        mood: '😊',
        child_quote: '춘천은 생각보다 감성 있는데요',
      },
    ],
  },
  pyeongchang: {
    toddler: [
      {
        memo: '대관령 양떼목장 왔어요! 양들이 이렇게 많은 줄 몰랐어요. {child}이가 양 보더니 처음에는 신기해서 다가가려다가 양이 "매에에~" 소리 내자마자 제 품으로 달려왔어요 ㅋㅋ 그래도 용기 내서 먹이 주기 도전했는데 떨리는 손으로 풀 내밀었어요. 양이 쪽쪽 먹는 거 느끼고 처음에 움츠러들다가 나중엔 웃었어요. 바람이 시원하고 초원이 넓어서 너무 좋았어요.',
        mood: '😮',
        child_quote: '양이 내 손 먹었어! (놀라서)',
      },
      {
        memo: '오대산 월정사 전나무 숲길 걸었어요. 산림욕 하는 기분이었어요. {child}이가 전나무 냄새 좋다고 킁킁거렸는데 귀여웠어요. 숲길에 돌멩이 있어서 {child}이가 돌 주울 때마다 챙겨줬더니 나중에 주머니 가득 채워왔어요 😂 조용하고 평화로운 하루였어요. 저녁은 평창 두부 요리 먹었어요.',
        mood: '🌿',
        child_quote: '냄새 좋아! (코 킁킁)',
      },
    ],
    child: [
      {
        memo: '양떼목장! {child}이가 양한테 먹이 주면서 "나 농부 할래요"라고 했어요 😂 드넓은 초원에서 사진 찍었는데 배경이 너무 예뻐서 가족사진 진짜 잘 나왔어요. 바람이 시원해서 뛰어다니기 딱 좋았어요. 점심은 메밀 국수 먹었는데 {child}이가 메밀 향 특이하다면서 다 먹었어요.',
        mood: '😊',
        child_quote: '엄마 나 양 키우고 싶어요',
      },
      {
        memo: '이효석 문화마을 갔어요. 메밀꽃 필 무렵 이야기 {child}이한테 설명해줬는데 진지하게 들었어요. 메밀밭이 하얗게 펼쳐져 있는 게 진짜 예뻐서 사진 엄청 찍었어요. 발왕산 케이블카 타러 갔는데 {child}이가 올라가면서 숲이 계속 펼쳐지는 거 보고 "나무가 이렇게 많아요?" 했어요. 전망대에서 간식 먹으면서 멍하니 경치 봤어요.',
        mood: '🥹',
        child_quote: '하늘에서 보니까 다 작아 보여요',
      },
    ],
    tween: [
      {
        memo: '평창 힐링 여행. {child}이가 양떼목장에서 양한테 먹이 주면서 제일 좋아했어요. 초원에서 뛰어다니다가 지쳐서 잔디에 드러누웠는데 그 사진이 진짜 예쁘게 나왔어요. 저녁에 숙소에서 별 보려고 나갔는데 도시에서는 못 보던 별이 가득해서 셋이 한참 올려다봤어요. {child}이가 오늘 진짜 좋았다고 먼저 말해줬어요.',
        mood: '🌙',
        child_quote: '별이 이렇게 많은지 몰랐어요',
      },
    ],
  },
  jeongseon: {
    toddler: [
      {
        memo: '정선 레일바이크! {child}이 데리고 탔는데 처음에 무서워할 줄 알았는데 달리는 순간부터 좋아했어요. 터널 들어갈 때 어두워지니까 잠깐 울다가 나오니까 다시 까르르 웃고 ㅋㅋ 강 따라 달리는 경치가 진짜 예뻤어요. 내리고 나서 또 타자고 해서 한 번 더 탔어요. 정선 5일장도 잠깐 들렀는데 찰옥수수 사 먹었는데 {child}이가 옥수수 잘 먹었어요.',
        mood: '🚂',
        child_quote: '빠빠! 기차 빠빠! (레일바이크 달릴 때)',
      },
    ],
    child: [
      {
        memo: '정선 레일바이크 드디어 탔어요! {child}이가 페달 열심히 밟으면서 "내가 더 빨리 할게요!" 했어요. 터널 통과할 때 "우와 진짜 어두워!" 소리 질렀는데 무섭다기보다 신나는 것 같았어요. 강변 따라 달리는 경치 진짜 좋았어요. 정선 5일장 구경도 했는데 할머니들이 직접 가져온 야채들 구경하는 재미가 있었어요. 찰옥수수 쪄서 먹었는데 달달하고 맛있었어요.',
        mood: '😊',
        child_quote: '레일바이크 진짜 재밌어요! 한 번 더 타요!',
      },
    ],
    tween: [
      {
        memo: '정선 레일바이크. {child}이가 처음에는 좀 유치한 거 아니냐고 했는데 타면서 완전 신나했어요 ㅋㅋ 터널에서 형광별 빛나는 거 예쁘다고 사진 찍겠다고 했는데 어두워서 잘 안 찍혔어요 ㅋ 화암동굴도 갔는데 동굴 안 종유석들 진짜 신기했어요. {child}이가 지구 생긴 게 신기하다면서 진지하게 설명 읽었어요.',
        mood: '😊',
        child_quote: '동굴이 자연이 만든 거라고요? 신기하다',
      },
    ],
  },
  wonju: {
    toddler: [
      {
        memo: '원주 소금산 출렁다리! {child}이 데리고 갔는데 다리 위에서 흔들리니까 꼭 안고 건넜어요. 높아서 저도 좀 무서웠어요 😂 {child}이는 무서운지 뭔지 모르고 그냥 주변 경치 구경하더라고요. 뮤지엄 산도 갔는데 넓은 잔디밭에서 {child}이 마음껏 뛰어다니게 놔뒀어요. 제임스 터렐 미술관은 어두워서 {child}이가 무서워할 것 같아 패스했어요.',
        mood: '😮',
        child_quote: '흔들흔들! (다리 위에서)',
      },
    ],
    child: [
      {
        memo: '소금산 출렁다리 왔어요. {child}이가 오르막길 걸어 올라가면서 "얼마나 더 가야 해요"를 다섯 번 물어봤는데 다리 딱 보이니까 바로 달려갔어요 ㅋㅋ 다리 위에서 일부러 흔들어보면서 신나했어요. 뮤지엄 산은 건물이 예쁘다고 사진 엄청 찍었어요. 안도 타다오 건축물이라고 설명해줬는데 {child}이가 건축가 되고 싶다고 했어요.',
        mood: '🤩',
        child_quote: '출렁다리 흔드는 사람이 나야!',
      },
      {
        memo: '간현관광지 짚트랙 도전! {child}이가 처음에 엄청 무서워했는데 일단 출발하니까 "우와아아!"를 연발했어요. 내리고 나서 바로 "한 번 더요!" 했어요 ㅋㅋㅋ 한지테마파크에서 한지 공예 체험도 했는데 {child}이가 집중해서 꾸미는 거 보고 기특했어요. 원주 여행 알차게 잘 했어요.',
        mood: '🎯',
        child_quote: '짚트랙 무섭지만 또 타고 싶어요!',
      },
    ],
    tween: [
      {
        memo: '원주 뮤지엄 산. {child}이가 미술관 별로 안 좋아하는데 여기는 건물 자체가 예쁘다고 좋아했어요. 제임스 터렐 하늘 작품 보는 공간에서 누워서 하늘 봤는데 {child}이가 한참 조용히 보더니 "뭔가 힐링된다"고 했어요. 소금산 출렁다리도 걸었는데 겁 없이 잘 걷더라고요. 같이 걸으면서 이런저런 이야기 많이 했어요.',
        mood: '🥹',
        child_quote: '여기 인스타 성지 맞죠?',
      },
    ],
  },
};

// ─── 미션 배분 ────────────────────────────────────────────────────────────────
export const MISSIONS_BY_REGION: Record<RegionKey, string[]> = {
  sokcho: ['m1', 'm2', 'm7', 'm16', 'm18'],
  gangneung: ['m1', 'm4', 'm8', 'm16', 'm17'],
  chuncheon: ['m6', 'm10', 'm13', 'm16', 'm20'],
  pyeongchang: ['m5', 'm16', 'm17', 'm18', 'm19'],
  jeongseon: ['m9', 'm11', 'm16', 'm20', 'm3'],
  wonju: ['m3', 'm15', 'm16', 'm20', 'm13'],
};

// ─── 랜덤 데이터 ──────────────────────────────────────────────────────────────
const FAMILY_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const FIRST_NAMES_PARENT = ['민수', '지훈', '수진', '유리', '현우', '지영', '성민', '미래', '재원', '소현'];
const CHILD_NAMES = ['민준', '서연', '지우', '예린', '하준', '수아', '이준', '지아', '도현', '나은', '시후', '채원'];
const HOME_CITIES = ['서울', '성남', '수원', '인천', '대전', '대구', '부산', '광주', '울산', '용인', '고양', '청주'];

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomPersona(): Omit<VirtualUser, 'deviceId' | 'createdAt' | 'hasContent'> {
  const familyName = randomItem(FAMILY_NAMES);
  const firstName = randomItem(FIRST_NAMES_PARENT);
  const regions: RegionKey[] = ['sokcho', 'gangneung', 'chuncheon', 'pyeongchang', 'jeongseon', 'wonju'];
  const themes: ThemeKey[] = ['nature', 'beach', 'food', 'activity', 'history', 'healing'];
  const ageGroups: AgeGroupKey[] = ['toddler', 'child', 'tween'];

  return {
    name: `${familyName}${firstName} 가족`,
    childName: randomItem(CHILD_NAMES),
    ageGroup: randomItem(ageGroups),
    region: randomItem(regions),
    theme: randomItem(themes),
    homeCity: randomItem(HOME_CITIES),
    note: '',
  };
}

export const REGION_LABELS: Record<RegionKey, string> = {
  sokcho: '속초시', gangneung: '강릉시', chuncheon: '춘천시',
  pyeongchang: '평창군', jeongseon: '정선군', wonju: '원주시',
};

export const THEME_LABELS: Record<ThemeKey, string> = {
  nature: '자연·생태', beach: '바다·해변', food: '음식·맛집',
  activity: '체험·액티비티', history: '역사·교육', healing: '힐링·휴양',
};

export const AGE_LABELS: Record<AgeGroupKey, string> = {
  toddler: '유아 (2~5세)', child: '어린이 (6~9세)', tween: '초등고학년 (10~12세)',
};
