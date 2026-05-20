import { getDetailCommon, getBarrierFreeDetail, getLocationBasedList } from '@/lib/tourapi';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { notFound } from 'next/navigation';
import KakaoMap from './KakaoMap';

export default async function PlaceDetailPage({
  params,
}: {
  params: { contentid: string };
}) {
  const [detail, barrierFree] = await Promise.allSettled([
    getDetailCommon(params.contentid),
    getBarrierFreeDetail(params.contentid),
  ]);

  const place = detail.status === 'fulfilled' ? detail.value : null;
  const bf = barrierFree.status === 'fulfilled' ? barrierFree.value : null;

  if (!place) notFound();

  // 근처 여행지 (반경 3km)
  const nearby = place.mapx && place.mapy
    ? await getLocationBasedList({
        mapX: parseFloat(place.mapx),
        mapY: parseFloat(place.mapy),
        radius: 3000,
        numOfRows: 7,
      }).then(items => items.filter(i => i.contentid !== params.contentid).slice(0, 6))
        .catch(() => [])
    : [];

  const facilities = [
    { key: 'stroller', label: '유모차 대여', icon: '🛒' },
    { key: 'lactationroom', label: '수유실', icon: '🍼' },
    { key: 'babysparechair', label: '유아용 의자', icon: '🪑' },
    { key: 'infantsfamilyetc', label: '영유아 편의시설', icon: '👶' },
  ] as const;

  const availableFacilities = bf
    ? facilities.filter((f) => bf[f.key] && bf[f.key] !== '0' && bf[f.key] !== 'N')
    : [];

  return (
    <main className="min-h-screen bg-white pb-36">
      {/* 상단 앱바 */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pb-3 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <Link href="/explore" className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 -ml-2">
          <span className="text-gray-700 text-lg">←</span>
        </Link>
        <p className="text-sm font-semibold text-gray-900 truncate max-w-[60%]">{place.title}</p>
        <a
          href={`https://map.kakao.com/link/map/${encodeURIComponent(place.title)},${place.mapy},${place.mapx}`}
          target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 -mr-2"
        >
          <span className="text-xl">🗺️</span>
        </a>
      </div>

      {/* 이미지 */}
      <div className="pt-16">
        {place.firstimage ? (
          <img
            src={place.firstimage}
            alt={place.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gradient-to-br from-sky-100 to-teal-50 flex items-center justify-center text-6xl">
            🏔️
          </div>
        )}
      </div>

      <div className="px-5 py-5">
        {/* 제목 & 주소 */}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{place.title}</h1>
        <p className="text-sm text-gray-400 mt-1.5">{place.addr1}</p>
        {place.tel && (
          <a href={`tel:${place.tel}`} className="text-sm text-sky-500 mt-1 block">
            📞 {place.tel}
          </a>
        )}

        {/* 육아 편의시설 뱃지 */}
        {availableFacilities.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              육아 편의시설
            </p>
            <div className="flex flex-wrap gap-2">
              {availableFacilities.map((f) => (
                <span
                  key={f.key}
                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-sm font-medium border border-sky-100"
                >
                  {f.icon} {f.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {bf === null && (
          <div className="mt-5 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400">
            육아 편의시설 정보가 아직 등록되지 않은 장소예요.
          </div>
        )}

        {/* 지도 */}
        {place.mapx && place.mapy && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              위치
            </p>
            <div className="rounded-2xl overflow-hidden">
              <KakaoMap mapx={place.mapx} mapy={place.mapy} title={place.title} />
            </div>
            {/* 카카오맵 링크는 상단 앱바로 이동 */}
          </div>
        )}

        {/* 소개 */}
        {place.overview && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              장소 소개
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{place.overview}</p>
          </div>
        )}

        {/* 이 근처 여행지 */}
        {nearby.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              이 근처 아이와 가볼 곳
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5">
              {nearby.map(n => (
                <Link
                  key={n.contentid}
                  href={`/explore/${n.contentid}`}
                  className="flex-shrink-0 w-36 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 active:scale-95 transition-transform"
                >
                  {n.firstimage ? (
                    <img src={n.firstimage} alt={n.title} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center text-2xl">🏔️</div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{n.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 하단 고정 CTA (야놀자 스타일) */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-3 pt-2 bg-white border-t border-gray-100">
        <Link
          href={`/plan?add=${params.contentid}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 active:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base transition-colors"
        >
          + 일정에 추가하기
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}
