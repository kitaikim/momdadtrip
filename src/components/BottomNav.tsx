'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '홈', emoji: '🏠' },
  { href: '/explore', label: '탐색', emoji: '🔍' },
  { href: '/plan', label: '일정', emoji: '📅' },
  { href: '/journal', label: '일지', emoji: '📔' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex justify-around"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingTop: '10px' }}
    >
      {NAV_ITEMS.map(({ href, label, emoji }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 transition-transform active:scale-90 ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{emoji}</span>
            <span className={`text-xs ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
