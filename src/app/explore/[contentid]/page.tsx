import { getDetailCommon, getBarrierFreeDetail, getLocationBasedList } from '@/lib/tourapi';
import Link from 'next/link';
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
    <main className="min-h-screen bg-white pb-24">
      {/* 뒤로가기 */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center px-4 pt-12 pb-3 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <Link href="/explore" className="text-gray-500 text-sm flex items-center gap-1">
          ← 탐색으로
        </Link>
      </div>

      {/* 이미지 */}
      <div className="pt-16">
        {place.firstimage ? (
          <img
            src={place.firstimage}
            alt={place.title}
            className="w-full h-60 object-cover"
          />
        ) : (
          <div className="w-full h-60 bg-gradient-to-br from-sky-100 to-teal-50 flex items-center justify-center text-6xl">
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
            <a
              href={`https://map.kakao.com/link/map/${encodeURIComponent(place.title)},${place.mapy},${place.mapx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
            >
              <span>🗺️</span> 카카오맵에서 보기
            </a>
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

        {/* 일정에 추가 버튼 */}
        <div className="mt-8">
          <Link
            href={`/plan?add=${params.contentid}`}
            className="block w-full bg-sky-500 text-white text-center py-4 rounded-2xl font-semibold text-base shadow-md shadow-sky-200"
          >
            일정에 추가하기
          </Link>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-around">
        {[
          { href: '/', label: '홈', emoji: '🏠' },
          { href: '/explore', label: '탐색', emoji: '🔍' },
          { href: '/plan', label: '일정', emoji: '📅' },
          { href: '/journal', label: '일지', emoji: '📔' },
          { href: '/stamp', label: '스탬프', emoji: '🗺️' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
