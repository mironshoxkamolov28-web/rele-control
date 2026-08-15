import { LanguageToggle, ThemeToggle, MexanikStatsPanel } from '../components';

export default function MexanikPage({
  lang, cycleLang, theme, toggleTheme, t,
  viewMexanikData, viewMexanikRelays,
  viewMexanikThisMonthRelays, thisMonthKey,
  viewMexanikMonthCounts, viewMexanikMonth, setViewMexanikMonth,
  viewMexanikMonthRelays, getStationName,
  exportMexanikMonthPDF, handleLogout,
}) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      <div className="relative flex items-center justify-between gap-3 px-4 py-4 lg:px-6 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <span className="text-lg font-black text-slate-950">R</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white">RELE CONTROL</h1>
            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">{t('app.tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle lang={lang} onCycle={cycleLang} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} />
          <button onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('sidebar.logout')}
          </button>
        </div>
      </div>

      <main className="relative max-w-5xl mx-auto px-4 py-6 lg:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">{viewMexanikData?.name}</h2>
            <p className="text-sm text-white/40 mt-1">{t('mexanikView.subtitle')}</p>
          </div>
          {viewMexanikRelays.length > 0 && (
            <button onClick={exportMexanikMonthPDF}
              className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
              {t('common.pdfExport')}
            </button>
          )}
        </div>

        <MexanikStatsPanel
          t={t} lang={lang}
          relays={viewMexanikRelays}
          thisMonthRelays={viewMexanikThisMonthRelays}
          thisMonthKey={thisMonthKey}
          monthCounts={viewMexanikMonthCounts}
          selectedMonth={viewMexanikMonth}
          onSelectMonth={setViewMexanikMonth}
          monthRelays={viewMexanikMonthRelays}
          getStationName={getStationName}
        />
      </main>
    </div>
  );
}
