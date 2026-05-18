// 무장애 API 실제 필드 구조 확인
const BARRIER_FREE_URL = 'https://apis.data.go.kr/B551011/KorWithService2';
const SERVICE_KEY = '9d69a3cd515550957648b6cb0200605d2c3eaffd690e421d54b551bed065d7cb';

// areaBasedList2 샘플 조회
async function checkList() {
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    areaCode: '32',
    sigunguCode: '3', // 강릉
    pageNo: '1',
    numOfRows: '3',
  });
  const res = await fetch(`${BARRIER_FREE_URL}/areaBasedList2?${params}`);
  const data = await res.json();
  console.log('=== areaBasedList2 샘플 (강릉 3개) ===');
  const items = data.response?.body?.items?.item;
  if (items) {
    console.log('총 필드 목록:', Object.keys(items[0]));
    console.log('\n첫번째 항목:\n', JSON.stringify(items[0], null, 2));
  }
}

// detailWithTour2로 특정 contentId 상세 조회
async function checkDetail(contentId) {
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    contentId,
    numOfRows: '1',
    pageNo: '1',
  });
  const res = await fetch(`${BARRIER_FREE_URL}/detailWithTour2?${params}`);
  const data = await res.json();
  console.log(`\n=== detailWithTour2 (contentId: ${contentId}) ===`);
  const items = data.response?.body?.items?.item;
  if (items) {
    console.log('필드 목록:', Object.keys(items[0]));
    console.log('\n전체 데이터:\n', JSON.stringify(items[0], null, 2));
  } else {
    console.log('데이터 없음');
  }
}

async function main() {
  await checkList();

  // 목록에서 첫 contentId 가져와서 상세 조회
  const params = new URLSearchParams({
    ServiceKey: SERVICE_KEY,
    MobileOS: 'ETC',
    MobileApp: 'MomDadTrip',
    _type: 'json',
    areaCode: '32',
    sigunguCode: '3',
    pageNo: '1',
    numOfRows: '1',
  });
  const res = await fetch(`${BARRIER_FREE_URL}/areaBasedList2?${params}`);
  const data = await res.json();
  const firstItem = data.response?.body?.items?.item?.[0];
  if (firstItem) {
    await checkDetail(firstItem.contentid);
  }
}

main().catch(console.error);
