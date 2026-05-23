export interface FeedPlace {
  title: string;
  address: string;
  category: 'attraction' | 'dining' | 'accommodation';
  note?: string; // 작성자 메모
}

export interface FeedDay {
  label: string;
  places: FeedPlace[];
}

export interface FeedTrip {
  id: string;
  userName: string;
  userEmoji: string;
  childAgeLabel: string;
  tripTitle: string;
  region: string;
  daysCount: number;
  baseLikes: number;
  gradient: string;
  tags: string[];
  summary: string; // 여행 한줄 소감
  days: FeedDay[];
}

export const FEED_TRIPS: FeedTrip[] = [
  {
    id: 'feed_sokcho_baby',
    userName: '민지맘',
    userEmoji: '👩',
    childAgeLabel: '1살 아기',
    tripTitle: '아기랑 속초 2박3일 — 유모차도 OK!',
    region: '속초·양양',
    daysCount: 3,
    baseLikes: 24,
    gradient: 'from-sky-400 to-blue-500',
    tags: ['유모차 OK', '수유실 확인', '아기 첫 여행', '느긋한 일정'],
    summary: '1살 아기와의 첫 여행, 무리하지 않고 유모차 다닐 수 있는 곳 위주로 다녀왔어요 🍼',
    days: [
      {
        label: 'Day 1 — 속초 도착, 시장 구경',
        places: [
          {
            title: '청초호 수변공원',
            address: '강원특별자치도 속초시 조양동 1487',
            category: 'attraction',
            note: '넓은 산책로라 유모차 밀기 딱 좋아요! 풍경도 예쁘고 벤치도 많아서 수유하기 좋았어요',
          },
          {
            title: '속초관광수산시장',
            address: '강원특별자치도 속초시 중앙로147번길 16',
            category: 'dining',
            note: '아기 안고 순대랑 튀김 먹었어요. 실내라 날씨 걱정 없고 수유실은 2층에 있어요',
          },
          {
            title: '아바이마을',
            address: '강원특별자치도 속초시 청호동 아바이마을',
            category: 'attraction',
            note: '갯배 타는 게 은근 아기도 좋아해요 😂 오징어순대 사 먹으면서 여유롭게 구경',
          },
        ],
      },
      {
        label: 'Day 2 — 아쿠아리움 & 해변',
        places: [
          {
            title: '속초 씨사이드 아쿠아리움',
            address: '강원특별자치도 속초시 해오름로 7',
            category: 'attraction',
            note: '1살도 물고기 보면서 너무 좋아해요! 유모차 입장 가능하고 유아 입장료 없어요 ✨',
          },
          {
            title: '영금정 해안 산책로',
            address: '강원특별자치도 속초시 동명동 영금정로 105',
            category: 'attraction',
            note: '포장된 산책로라 유모차 밀기 편해요. 파도 소리 들으며 낮잠 재웠어요 💤',
          },
          {
            title: '속초해수욕장',
            address: '강원특별자치도 속초시 조양동 1407',
            category: 'attraction',
            note: '모래사장은 유모차 어렵지만 콘크리트 산책로에서 바다 구경만 했어요. 저녁 노을이 진짜 예뻐요',
          },
        ],
      },
      {
        label: 'Day 3 — 양양 낙산 경유 귀가',
        places: [
          {
            title: '낙산해수욕장',
            address: '강원특별자치도 양양군 강현면 해맞이길 2',
            category: 'attraction',
            note: '귀가 전 잠깐 들렀는데 모래가 고와서 아기 발 담그기 딱 좋아요',
          },
          {
            title: '낙산사',
            address: '강원특별자치도 양양군 강현면 낙산사로 100',
            category: 'attraction',
            note: '동해 바라보는 홍련암 코스는 짧아서 아기 안고 다녀올 수 있어요',
          },
          {
            title: '양양 수산항 횟집거리',
            address: '강원특별자치도 양양군 양양읍 수산리',
            category: 'dining',
            note: '귀가 전 마지막 해산물! 아기 이유식은 가져왔고 어른들만 회 먹었어요',
          },
        ],
      },
    ],
  },
  {
    id: 'feed_gangneung_child',
    userName: '준호아빠',
    userEmoji: '👨',
    childAgeLabel: '7살 아이',
    tripTitle: '7살 아이랑 강릉 2박3일 — 체험 가득 여행!',
    region: '강릉',
    daysCount: 3,
    baseLikes: 18,
    gradient: 'from-cyan-400 to-teal-500',
    tags: ['체험 위주', '레일바이크 강추', '정동진 일출', '초등 추천'],
    summary: '7살 아이가 레일바이크에서 눈이 반짝반짝 ✨ 아빠도 덩달아 신났던 강릉 여행',
    days: [
      {
        label: 'Day 1 — 강릉 도착, 과학체험',
        places: [
          {
            title: '강릉 과학체험관',
            address: '강원특별자치도 강릉시 남산초교길 12',
            category: 'attraction',
            note: '도착 직후 바로 갔는데 아이가 2시간 내내 안 나오려 해요 😅 물리·화학 체험 다 있어요',
          },
          {
            title: '경포해변',
            address: '강원특별자치도 강릉시 경포로 365',
            category: 'attraction',
            note: '체험관 끝나고 해변에서 모래성 만들기. 7살이면 혼자서도 신나게 놀아요 🏖️',
          },
          {
            title: '안목 커피거리',
            address: '강원특별자치도 강릉시 창해로14번길 20',
            category: 'dining',
            note: '저녁 해질녘에 커피 한 잔. 아이는 핫초코, 부모는 강릉 유명 커피. 뷰 맛집이에요',
          },
        ],
      },
      {
        label: 'Day 2 — 일출 & 레일바이크 (하이라이트!)',
        places: [
          {
            title: '정동진역',
            address: '강원특별자치도 강릉시 강동면 정동역길 17',
            category: 'attraction',
            note: '새벽 5시 기상이라 아이가 졸려했는데 막상 일출 보고 "아빠 너무 예뻐!" 했어요 🌅',
          },
          {
            title: '강릉 경강선 레일바이크',
            address: '강원특별자치도 강릉시 강동면 헌화로 990-1',
            category: 'attraction',
            note: '이번 여행 MVP! 바다 옆 레일바이크라 경치가 장난 아니에요. 예약 필수!!',
          },
          {
            title: '초당 두부마을',
            address: '강원특별자치도 강릉시 초당동',
            category: 'dining',
            note: '레일바이크 끝나고 순두부찌개. 아이도 잘 먹어요. 바다 내음 나는 두부가 신기하다고',
          },
        ],
      },
      {
        label: 'Day 3 — 역사 공부 & 마지막 물놀이',
        places: [
          {
            title: '오죽헌',
            address: '강원특별자치도 강릉시 율곡로 3139번길 24',
            category: 'attraction',
            note: '학교에서 신사임당·율곡 배웠는데 실제로 보니 신기해했어요. 5천원권 지폐 들고 사진 찰칵',
          },
          {
            title: '주문진 해수욕장',
            address: '강원특별자치도 강릉시 주문진읍 주문로 174-1',
            category: 'attraction',
            note: '마지막 물놀이. 경포보다 덜 붐벼서 좋아요. 아이가 모래 구덩이 파다가 1시간 보냄',
          },
          {
            title: '주문진 수산시장',
            address: '강원특별자치도 강릉시 주문진읍 주문북로 10',
            category: 'dining',
            note: '귀가 전 오징어·게 사서 집에 가져왔어요. 싱싱하고 저렴해요!',
          },
        ],
      },
    ],
  },
];
