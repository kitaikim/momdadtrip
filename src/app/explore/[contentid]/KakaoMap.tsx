'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window { kakao: any; }
}

interface Props {
  mapx: string;
  mapy: string;
  title: string;
}

export default function KakaoMap({ mapx, mapy, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key || !containerRef.current) return;

    function initMap() {
      if (!containerRef.current) return;
      const center = new window.kakao.maps.LatLng(parseFloat(mapy), parseFloat(mapx));
      const map = new window.kakao.maps.Map(containerRef.current, { center, level: 4 });
      const marker = new window.kakao.maps.Marker({ map, position: center });
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px 10px;font-size:12px;white-space:nowrap">${title}</div>`,
      });
      infowindow.open(map, marker);
    }

    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.onload = () => window.kakao.maps.load(initMap);
    document.head.appendChild(script);
  }, [mapx, mapy, title]);

  return <div ref={containerRef} className="w-full h-52 bg-gray-100" />;
}
