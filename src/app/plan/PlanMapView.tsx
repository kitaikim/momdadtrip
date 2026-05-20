'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { kakao: any; }
}

interface MapPlace {
  title: string;
  address: string;
  mapx?: string;
  mapy?: string;
  dayIdx: number;
  idxInDay?: number;
  category?: string;
}

interface Props {
  places: MapPlace[];
  dayCount: number;
  departure?: string;
  onClose: () => void;
}

const DAY_COLORS = ['#2563EB', '#16A34A', '#DC2626', '#D97706', '#7C3AED', '#0891B2'];

function makeSvgMarker(number: number, color: string): string {
  const fontSize = number >= 10 ? 10 : 12;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
    <circle cx="15" cy="15" r="13" fill="${color}" stroke="white" stroke-width="2.5"/>
    <text x="15" y="19.5" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="sans-serif">${number}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

type Resolved = MapPlace & { lat: number; lng: number; globalIdx: number };

export default function PlanMapView({ places, dayCount, departure, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<{ marker: any; infowindow: any }[]>([]);
  const polylinesRef = useRef<{ [day: number]: any }>({});
  const resolvedRef = useRef<Resolved[]>([]);

  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSDK(): Promise<void> {
      if (window.kakao?.maps) {
        return new Promise(resolve => window.kakao.maps.load(resolve));
      }
      return new Promise((resolve) => {
        const existing = document.querySelector('script[src*="dapi.kakao.com/v2/maps"]');
        if (existing && window.kakao?.maps) { window.kakao.maps.load(resolve); return; }
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=services`;
        script.onload = () => window.kakao.maps.load(resolve);
        document.head.appendChild(script);
      });
    }

    function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
      return new Promise((resolve) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
          } else resolve(null);
        });
      });
    }

    async function init() {
      if (!mapContainerRef.current) return;
      await loadSDK();
      if (cancelled || !mapContainerRef.current) return;

      const map = new window.kakao.maps.Map(mapContainerRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 128.7),
        level: 10,
      });
      kakaoMapRef.current = map;

      const resolved = await Promise.all(
        places.map(async (p, i) => {
          if (p.mapx && p.mapy && parseFloat(p.mapy) !== 0) {
            return { ...p, lat: parseFloat(p.mapy), lng: parseFloat(p.mapx), globalIdx: i };
          }
          const coords = await geocode(p.address);
          return coords ? { ...p, ...coords, globalIdx: i } : null;
        })
      );
      if (cancelled) return;

      const valid = resolved.filter(Boolean) as Resolved[];
      if (valid.length === 0) { setStatus('empty'); return; }
      resolvedRef.current = valid;

      const bounds = new window.kakao.maps.LatLngBounds();
      const markers: { marker: any; infowindow: any }[] = [];

      valid.forEach((place) => {
        const pos = new window.kakao.maps.LatLng(place.lat, place.lng);
        bounds.extend(pos);

        const color = DAY_COLORS[place.dayIdx % DAY_COLORS.length];
        const markerImage = new window.kakao.maps.MarkerImage(
          makeSvgMarker(place.globalIdx + 1, color),
          new window.kakao.maps.Size(30, 30),
          { offset: new window.kakao.maps.Point(15, 15) }
        );
        const marker = new window.kakao.maps.Marker({ position: pos, image: markerImage, map });
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;color:#111;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${place.title}</div>`,
          removable: true,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker);
          setSelectedIdx(place.globalIdx);
          setTimeout(() => {
            document.getElementById(`mcard-${place.globalIdx}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }, 50);
        });
        markers[place.globalIdx] = { marker, infowindow };
      });
      markersRef.current = markers;

      // Day별 Polyline
      const byDay: { [d: number]: Resolved[] } = {};
      valid.forEach(p => { (byDay[p.dayIdx] = byDay[p.dayIdx] ?? []).push(p); });
      Object.entries(byDay).forEach(([dStr, pts]) => {
        const d = parseInt(dStr);
        if (pts.length < 2) return;
        const sorted = [...pts].sort((a, b) => (a.idxInDay ?? 0) - (b.idxInDay ?? 0));
        const polyline = new window.kakao.maps.Polyline({
          path: sorted.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
          strokeWeight: 3,
          strokeColor: DAY_COLORS[d % DAY_COLORS.length],
          strokeOpacity: 0.65,
          strokeStyle: 'solid',
          map,
        });
        polylinesRef.current[d] = polyline;
      });

      // 출발지 마커 + 첫 번째 장소까지 점선
      if (departure) {
        const depCoords = await geocode(departure);
        if (!cancelled && depCoords) {
          const depPos = new window.kakao.maps.LatLng(depCoords.lat, depCoords.lng);
          bounds.extend(depPos);

          new window.kakao.maps.CustomOverlay({
            position: depPos,
            content: `<div style="background:#1e40af;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2.5px solid white">🏠</div>`,
            yAnchor: 1,
            map,
          });

          // Day 0의 첫 번째 장소까지 점선
          const firstPlace = valid.find(p => p.dayIdx === 0);
          if (firstPlace) {
            new window.kakao.maps.Polyline({
              path: [depPos, new window.kakao.maps.LatLng(firstPlace.lat, firstPlace.lng)],
              strokeWeight: 2,
              strokeColor: '#9ca3af',
              strokeOpacity: 0.8,
              strokeStyle: 'dashed',
              map,
            });
          }
        }
      }

      if (valid.length > 1) map.setBounds(bounds, 60);
      else { map.setCenter(new window.kakao.maps.LatLng(valid[0].lat, valid[0].lng)); map.setLevel(5); }

      setStatus('ready');
    }

    init();
    return () => { cancelled = true; };
  }, [places]);

  // Day 탭 전환 시 마커·폴리라인 표시 제어
  useEffect(() => {
    if (status !== 'ready') return;
    const map = kakaoMapRef.current;
    if (!map) return;

    const resolved = resolvedRef.current;
    resolved.forEach((place) => {
      const ref = markersRef.current[place.globalIdx];
      if (!ref) return;
      const visible = selectedDay === 'all' || place.dayIdx === selectedDay;
      ref.marker.setMap(visible ? map : null);
    });
    Object.entries(polylinesRef.current).forEach(([dStr, polyline]) => {
      const visible = selectedDay === 'all' || parseInt(dStr) === selectedDay;
      polyline.setMap(visible ? map : null);
    });

    const visible = resolved.filter(p => selectedDay === 'all' || p.dayIdx === selectedDay);
    if (visible.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      visible.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)));
      map.setBounds(bounds, 60);
    } else if (visible.length === 1) {
      map.setCenter(new window.kakao.maps.LatLng(visible[0].lat, visible[0].lng));
      map.setLevel(5);
    }
  }, [selectedDay, status]);

  function selectPlace(gIdx: number) {
    setSelectedIdx(gIdx);
    const place = resolvedRef.current.find(p => p.globalIdx === gIdx);
    if (!place || !kakaoMapRef.current) return;
    kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
    markersRef.current[gIdx]?.infowindow.open(kakaoMapRef.current, markersRef.current[gIdx]?.marker);
    setTimeout(() => {
      document.getElementById(`mcard-${gIdx}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
  }

  const cardPlaces = status === 'ready'
    ? resolvedRef.current.filter(p => selectedDay === 'all' || p.dayIdx === selectedDay)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h2 className="font-bold text-gray-900 text-base">여행 지도</h2>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-gray-500 text-xl">✕</button>
      </div>

      {/* Day 탭 */}
      {status === 'ready' && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          <button
            onClick={() => setSelectedDay('all')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedDay === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            전체
          </button>
          {Array.from({ length: dayCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={
                selectedDay === i
                  ? { backgroundColor: DAY_COLORS[i % DAY_COLORS.length], color: '#fff' }
                  : { backgroundColor: '#f3f4f6', color: '#6b7280' }
              }
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 지도 */}
      <div className="relative flex-1 min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-500">위치 찾는 중...</p>
          </div>
        )}
        {status === 'empty' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3 z-10">
            <span className="text-5xl">🗺️</span>
            <p className="text-sm text-gray-500 text-center">표시할 장소가 없어요.<br />탐색에서 장소를 추가해보세요.</p>
          </div>
        )}
      </div>

      {/* 하단 장소 카드 스트립 */}
      {status === 'ready' && cardPlaces.length > 0 && (
        <div className="bg-white border-t border-gray-100 flex-shrink-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 py-3">
            {cardPlaces.map((place) => {
              const color = DAY_COLORS[place.dayIdx % DAY_COLORS.length];
              const isSelected = selectedIdx === place.globalIdx;
              return (
                <button
                  key={place.globalIdx}
                  id={`mcard-${place.globalIdx}`}
                  onClick={() => selectPlace(place.globalIdx)}
                  className={`flex-shrink-0 w-44 rounded-2xl p-3 text-left transition-all border-2 ${
                    isSelected ? 'shadow-md' : 'border-gray-100 bg-white'
                  }`}
                  style={isSelected ? { borderColor: color, backgroundColor: `${color}12` } : {}}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {place.globalIdx + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Day {place.dayIdx + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{place.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{place.address}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
