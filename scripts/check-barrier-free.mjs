// 강원도 무장애 여행 API 데이터 커버리지 검증 스크립트
const BARRIER_FREE_URL = 'https://apis.data.go.kr/B551011/KorWithService2';
const SERVICE_KEY = '9d69a3cd515550957648b6cb0200605d2c3eaffd690e421d54b551bed065d7cb';

const SIGUNGU = [
  { code: '1', name: '춘천시' },
  { code: '2', name: '원주시' },
  { code: '3', name: '강릉시' },
  { code: '4', name: '동해시' },
  { code: '5', name: '태백시' },
  { code: '6', name: '속초시' },
  { code: '7', name: '삼척시' },
  { code: '8', name: '홍천군' },
  { code: '9', name: '횡성군' },
  { code: '10', name: '영월군' },
  { code: '11', name: '평창군' },
  { code: '12', name: '정선군' },
  { code: '13', name: '철원군' },
  { code: '14', name: '화천군' },
  { code: '15', name: '양구군' },
  { code: '16', name: '인제군' },
  { code: '17', name: '고성군' },
  { code: '18', name: '양양군' },
];

async function fetchBarrierFree(sigunguCode, pageNo = 1) {
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    areaCode: '32',
    sigunguCode,
    pageNo: String(pageNo),
    numOfRows: '100',
  });

  const res = await fetch(`${BARRIER_FREE_URL}/areaBasedList2?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const body = data.response?.body;
  const items = body?.items;
  return {
    total: body?.totalCount ?? 0,
    items: (items === '' || !items) ? [] : (items.item ?? []),
  };
}

function countFacility(items, key) {
  return items.filter(item => item[key] && item[key] !== '0' && item[key] !== 'N').length;
}

async function main() {
  console.log('🔍 강원도 무장애 여행 API 데이터 커버리지 검증\n');
  console.log('시군\t\t전체\t수유실\t유모차\t유아의자\t영유아시설\t영유아동반');
  console.log('─'.repeat(80));

  let grandTotal = 0;
  const summary = { lactation: 0, stroller: 0, chair: 0, facility: 0, accompany: 0 };

  for (const sg of SIGUNGU) {
    try {
      const { total, items } = await fetchBarrierFree(sg.code);
      grandTotal += total;

      const lactation = countFacility(items, 'lactationroom');
      const stroller = countFacility(items, 'stroller');
      const chair = countFacility(items, 'babysparechair');
      const facility = countFacility(items, 'infantsfacility');
      const accompany = countFacility(items, 'acmpnyareababy');

      summary.lactation += lactation;
      summary.stroller += stroller;
      summary.chair += chair;
      summary.facility += facility;
      summary.accompany += accompany;

      const pad = sg.name.length <= 3 ? '\t\t' : '\t';
      console.log(`${sg.name}${pad}${total}\t${lactation}\t${stroller}\t${chair}\t\t${facility}\t\t${accompany}`);

      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.log(`${sg.name}\t\t오류: ${e.message}`);
    }
  }

  console.log('─'.repeat(80));
  console.log(`합계\t\t${grandTotal}\t${summary.lactation}\t${summary.stroller}\t${summary.chair}\t\t${summary.facility}\t\t${summary.accompany}`);

  console.log('\n📊 핵심 요약:');
  console.log(`- 전체 무장애 장소: ${grandTotal}개`);
  console.log(`- 수유실 있는 곳: ${summary.lactation}개`);
  console.log(`- 유모차 대여: ${summary.stroller}개`);
  console.log(`- 영유아 동반 가능: ${summary.accompany}개`);

  if (summary.lactation < 10) {
    console.log('\n⚠️  수유실 데이터가 매우 적습니다. 서비스 방향 재검토 필요할 수 있음.');
  } else if (summary.lactation < 30) {
    console.log('\n🟡 수유실 데이터가 제한적입니다. "있는 곳" 위주로 큐레이션하는 전략 권장.');
  } else {
    console.log('\n✅ 데이터 충분. 서비스 구현 문제없음.');
  }
}

main().catch(console.error);
