'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⬛', label: 'Tableau de bord' },
  { href: '/map', icon: '🗺️', label: 'Carte nationale' },
  { href: '/reports', icon: '📋', label: 'Signalements' },
  { href: '/animals', icon: '🐾', label: 'Animaux' },
  { href: '/volunteers', icon: '👥', label: 'Bénévoles' },
  { href: '/hotspots', icon: '🔥', label: 'Points chauds' },
  { href: '/b2g', icon: '🏛️', label: 'API Gouvernement' },
  { href: '/settings', icon: '⚙️', label: 'Paramètres' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-brand-dark-2 border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/icons/logo.svg" alt="RNSA" className="w-9 h-9 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-white leading-none">RNSA Maroc</div>
            <div className="text-[10px] text-brand-gray leading-none mt-1">Admin Dashboard</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5',
                isActive
                  ? 'bg-brand-red/15 text-brand-red font-medium'
                  : 'text-brand-gray-light hover:bg-white/5 hover:text-white'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-brand-red" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live status */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-brand-gray-light">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          Système opérationnel
        </div>
        <div className="text-[11px] text-brand-gray mt-1">87 bénévoles actifs</div>
      </div>
    </aside>
  );
}
