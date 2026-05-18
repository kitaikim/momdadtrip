// 무장애 API 실제 育児 데이터 보유 여부 샘플 확인
const BARRIER_FREE_URL = 'https://apis.data.go.kr/B551011/KorWithService2';
const SERVICE_KEY = '9d69a3cd515550957648b6cb0200605d2c3eaffd690e421d54b551bed065d7cb';

async function getList(sigunguCode, numOfRows = 20) {
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY, MobileOS: 'ETC', MobileApp: 'MomDadTrip',
    _type: 'json', areaCode: '32', sigunguCode, pageNo: '1', numOfRows: String(numOfRows),
  });
  const res = await fetch(`${BARRIER_FREE_URL}/areaBasedList2?${params}`);
  const data = await res.json();
  const items = data.response?.body?.items;
  return (items === '' || !items) ? [] : (items.item ?? []);
}

async function getDetail(contentId) {
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY, MobileOS: 'ETC', MobileApp: 'MomDadTrip',
    _type: 'json', contentId, numOfRows: '1', pageNo: '1',
  });
  const res = await fetch(`${BARRIER_FREE_URL}/detailWithTour2?${params}`);
  const data = await res.json();
  const items = data.response?.body?.items;
  if (!items || items === '') return null;
  return items.item?.[0] ?? null;
}

function hasBabyFacility(detail) {
  if (!detail) return false;
  return (
    (detail.stroller && detail.stroller !== '') ||
    (detail.lactationroom && detail.lactationroom !== '') ||
    (detail.babysparechair && detail.babysparechair !== '') ||
    (detail.infantsfamilyetc && detail.infantsfamilyetc !== '')
  );
}

async function main() {
  console.log('🔍 강원도 무장애 API 育児 데이터 샘플 확인 (시군별 20개씩 상세 조회)\n');

  // 핵심 관광지: 춘천, 강릉, 속초, 평창, 원주
  const targetSigungu = [
    { code: '1', name: '춘천시' },
    { code: '3', name: '강릉시' },
    { code: '6', name: '속초시' },
    { code: '11', name: '평창군' },
    { code: '2', name: '원주시' },
  ];

  const found = [];

  for (const sg of targetSigungu) {
    const list = await getList(sg.code, 20);
    console.log(`${sg.name}: ${list.length}개 조회`);

    for (const item of list) {
      const detail = await getDetail(item.contentid);
      if (hasBabyFacility(detail)) {
        found.push({ sigungu: sg.name, ...item, detail });
        console.log(`  ✅ 育児시설 있음: ${item.title} (${item.contentid})`);
        console.log(`     stroller: ${detail.stroller}`);
        console.log(`     lactationroom: ${detail.lactationroom}`);
        console.log(`     babysparechair: ${detail.babysparechair}`);
        console.log(`     infantsfamilyetc: ${detail.infantsfamilyetc}`);
      }
      await new Promise(r => setTimeout(r, 150));
    }
  }

  console.log(`\n📊 결과: ${found.length}/${targetSigungu.length * 20}개 장소에 育児 시설 정보 있음`);

  if (found.length === 0) {
    console.log('\n⚠️  무장애 API에 育児 시설 데이터가 없습니다.');
    console.log('   → 대안: 일반 TourAPI areaBasedList2에서 infantsfacility 파라미터 활용 or');
    console.log('     카카오 로컬 API로 "수유실" 키워드 검색');
  }
}

main().catch(console.error);
