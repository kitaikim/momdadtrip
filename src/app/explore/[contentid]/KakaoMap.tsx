'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { kakao: any; }
}

interface Props {
  mapx: string;
  mapy: string;
  title: string;
}

interface NearbyPlace {
  id: string;
  place_name: string;
  x: string;
  y: string;
  category_group_code: string;
}

export default function KakaoMap({ mapx, mapy, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<{ cafes: any[]; restaurants: any[] }>({ cafes: [], restaurants: [] });
  const [showCafe, setShowCafe] = useState(true);
  const [showRestaurant, setShowRestaurant] = useState(true);
  const [nearbyLoaded, setNearbyLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key) {
      setStatus('error');
      setErrMsg('JS 키가 없습니다');
      return;
    }
    if (!containerRef.current) return;

    function initMap() {
      try {
        if (!containerRef.current) return;
        const lat = parseFloat(mapy);
        const lng = parseFloat(mapx);
        if (isNaN(lat) || isNaN(lng)) {
          setStatus('error');
          setErrMsg(`좌표 파싱 오류: mapx=${mapx} mapy=${mapy}`);
          return;
        }
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, { center, level: 5 });
        mapRef.current = map;

        const mainOverlay = new window.kakao.maps.CustomOverlay({
          position: center,
          content: `<div style="background:#2563EB;color:#fff;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2)">📍 ${title}</div>`,
          yAnchor: 1.5,
        });
        mainOverlay.setMap(map);

        setMapReady(true);
        setStatus('ready');
      } catch (e: any) {
        setStatus('error');
        setErrMsg(e?.message ?? '지도 초기화 실패');
      }
    }

    function loadSDK() {
      if (window.kakao?.maps) {
        window.kakao.maps.load(initMap);
        return;
      }

      const existing = document.querySelector('script[src*="dapi.kakao.com/v2/maps"]');
      if (existing) {
        const wait = setInterval(() => {
          if (window.kakao?.maps) {
            clearInterval(wait);
            window.kakao.maps.load(initMap);
          }
        }, 100);
        // 5초 안에 로드 안 되면 에러
        setTimeout(() => {
          clearInterval(wait);
          if (!mapRef.current) {
            setStatus('error');
            setErrMsg('SDK 로드 타임아웃');
          }
        }, 5000);
        return;
      }

      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
      script.onload = () => window.kakao.maps.load(initMap);
      script.onerror = () => {
        setStatus('error');
        setErrMsg('SDK 스크립트 로드 실패 (키 확인 필요)');
      };
      document.head.appendChild(script);
    }

    loadSDK();
  }, [mapx, mapy, title]);

  // 주변 카페/음식점 로드
  useEffect(() => {
    if (!mapReady) return;
    const lat = parseFloat(mapy);
    const lng = parseFloat(mapx);

    fetch(`/api/kakao/nearby?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(({ cafes, restaurants }: { cafes: NearbyPlace[]; restaurants: NearbyPlace[] }) => {
        const map = mapRef.current;
        if (!map) return;

        const cafeOverlays = (cafes ?? []).slice(0, 8).map((p: NearbyPlace) => {
          const pos = new window.kakao.maps.LatLng(parseFloat(p.y), parseFloat(p.x));
          const o = new window.kakao.maps.CustomOverlay({
            position: pos,
            content: `<div title="${p.place_name}" style="background:#fff7ed;border:1.5px solid #fdba74;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,0.15);cursor:pointer">☕</div>`,
            yAnchor: 1,
          });
          o.setMap(map);
          return o;
        });

        const restaurantOverlays = (restaurants ?? []).slice(0, 8).map((p: NearbyPlace) => {
          const pos = new window.kakao.maps.LatLng(parseFloat(p.y), parseFloat(p.x));
          const o = new window.kakao.maps.CustomOverlay({
            position: pos,
            content: `<div title="${p.place_name}" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,0.15);cursor:pointer">🍽️</div>`,
            yAnchor: 1,
          });
          o.setMap(map);
          return o;
        });

        overlaysRef.current = { cafes: cafeOverlays, restaurants: restaurantOverlays };
        setNearbyLoaded(true);
      })
      .catch(() => setNearbyLoaded(true));
  }, [mapReady, mapx, mapy]);

  // 카페 토글
  useEffect(() => {
    overlaysRef.current.cafes.forEach(o => o.setMap(showCafe ? mapRef.current : null));
  }, [showCafe]);

  // 음식점 토글
  useEffect(() => {
    overlaysRef.current.restaurants.forEach(o => o.setMap(showRestaurant ? mapRef.current : null));
  }, [showRestaurant]);

  return (
    <div>
      <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-gray-100">
        <div ref={containerRef} className="absolute inset-0" />

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 z-10">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs text-gray-400">지도 불러오는 중...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 z-10 px-4">
            <span className="text-2xl">🗺️</span>
            <p className="text-xs text-gray-500 text-center">{errMsg || '지도를 불러오지 못했어요'}</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">주변</span>
        <button
          onClick={() => setShowCafe(v => !v)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            showCafe ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          ☕ 카페
        </button>
        <button
          onClick={() => setShowRestaurant(v => !v)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            showRestaurant ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          🍽️ 음식점
        </button>
        {!nearbyLoaded && mapReady && (
          <span className="text-xs text-gray-300 ml-1">불러오는 중...</span>
        )}
      </div>
    </div>
  );
}
