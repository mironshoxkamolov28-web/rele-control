import { LanguageToggle, ThemeToggle } from './index.js';

export default function AppSidebar({ t, auth, lang, cycleLang, theme, toggleTheme, filteredNav, activeNav, setActiveNav, sidebarOpen, setSidebarOpen, confirmDiscard, setIsDirty, setViewStation, setViewMexanik, setViewMexanikMonth, setGlobalSearchOpen, handleLogout }) {
  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col glass border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <span className="text-lg font-black text-slate-950">R</span>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-white">RELE CONTROL</h1>
          <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">{t('app.tagline')}</p>
        </div>
      </div>

      {auth?.id === 'admin' && (
        <div className="px-3 pt-3">
          <button onClick={() => setGlobalSearchOpen(true)}
            className="flex w-full items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/40 transition hover:bg-white/10 hover:text-white/60">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z" />
            </svg>
            <span className="flex-1 text-left">{t('globalSearch.trigger')}</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {filteredNav.map((item) => {
          const isExpanded = item.children && (activeNav === item.id || item.children.some((c) => c.id === activeNav));
          return (
            <div key={item.id}>
              <button onClick={() => {
                if (!confirmDiscard()) return;
                setIsDirty(false);
                setActiveNav(item.id);
                setSidebarOpen(false);
                setViewStation(null);
                setViewMexanik(null);
                setViewMexanikMonth(null);
              }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${activeNav === item.id ? 'bg-amber-500/15 text-amber-400 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {t(item.labelKey)}
                {item.children && (
                  <svg className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              {isExpanded && item.children && auth?.id === 'admin' && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-white/5 pl-2">
                  {item.children.map((child) => (
                    <button key={child.id} onClick={() => {
                      if (!confirmDiscard()) return;
                      setIsDirty(false);
                      setActiveNav(child.id);
                      setSidebarOpen(false);
                      setViewStation(null);
                      setViewMexanik(null);
                      setViewMexanikMonth(null);
                    }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeNav === child.id ? 'bg-amber-500/10 text-amber-400' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}>
                      {t(child.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400 text-xs font-bold">
            {auth.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{auth.name}</p>
            <p className="text-[10px] text-white/30 truncate">{auth.id === 'admin' ? t('user.admin') : t('user.stationUser')}</p>
          </div>
          <LanguageToggle lang={lang} onCycle={cycleLang} className="h-8 w-8 flex-shrink-0" />
          <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} className="h-8 w-8 flex-shrink-0" />
        </div>

        <button onClick={() => { if (confirmDiscard()) handleLogout(); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
