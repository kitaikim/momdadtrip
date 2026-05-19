import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '엄마랑 아빠랑 — 강원도 가족여행 플래너',
  description: '아이와 함께하는 강원도 여행. 날씨 맞춤 코스, 유모차 접근성, 스탬프 투어, AI 여행일지까지.',
  keywords: ['강원도', '가족여행', '아이동반', '여행계획', '스탬프투어'],
  openGraph: {
    title: '엄마랑 아빠랑 — 강원도 가족여행 플래너',
    description: '아이와 함께하는 강원도 여행. 날씨 맞춤 코스, 유모차 접근성, 스탬프 투어.',
    type: 'website',
    locale: 'ko_KR',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '엄마랑 아빠랑',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
