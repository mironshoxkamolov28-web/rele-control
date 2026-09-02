import { useState } from 'react';

const BOTTOM_NAV_ITEMS_ADMIN = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'relays', labelKey: 'nav.relays', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { id: 'stations', labelKey: 'nav.stations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'monthly-plan', labelKey: 'nav.monthlyPlan', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: '__more__', labelKey: 'nav.more', icon: 'M4 6h16M4 12h16M4 18h16' },
];

const BOTTOM_NAV_ITEMS_STATION = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'relays', labelKey: 'nav.relays', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { id: 'help', labelKey: 'nav.help', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function MobileBottomNav({ t, auth, activeNav, setActiveNav, setSidebarOpen, confirmDiscard, setIsDirty, setViewStation, setViewMexanik, setViewMexanikMonth }) {
  const items = auth?.id === 'admin' ? BOTTOM_NAV_ITEMS_ADMIN : BOTTOM_NAV_ITEMS_STATION;

  const handleNavClick = (id) => {
    if (id === '__more__') {
      setSidebarOpen(true);
      return;
    }
    if (!confirmDiscard()) return;
    setIsDirty(false);
    setActiveNav(id);
    setViewStation(null);
    setViewMexanik(null);
    setViewMexanikMonth(null);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const isActive = item.id === '__more__' ? false : activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 pt-2.5 gap-0.5 transition-all duration-200 relative
                ${isActive
                  ? 'text-amber-400'
                  : 'text-white/40 active:text-white/70'
                }`}
              style={{ minHeight: '56px' }}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              )}
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
