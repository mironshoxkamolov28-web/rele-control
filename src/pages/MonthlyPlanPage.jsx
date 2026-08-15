export default function MonthlyPlanPage({ t, monthlyPlanByStation, visibleMonthlyPlan, monthlyPlanSearch, setMonthlyPlanSearch, exportMonthlyPlanPDF }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">{t('nav.monthlyPlan')}</h2>
          <p className="text-sm text-white/40 mt-1">{t('monthlyPlan.subtitle')}</p>
        </div>
        {monthlyPlanByStation.length > 0 && (
          <button onClick={exportMonthlyPlanPDF}
            className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
            {t('common.pdfExport')}
          </button>
        )}
      </div>

      {monthlyPlanByStation.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4 opacity-30">✅</div>
          <p className="text-lg font-semibold text-white/60">{t('monthlyPlan.empty')}</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={monthlyPlanSearch} placeholder={t('common.searchPlaceholder')}
              onChange={(e) => setMonthlyPlanSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
          </div>
          {visibleMonthlyPlan.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
              <p className="text-sm text-white/40">{t('common.noSearchResults')}</p>
            </div>
          ) : (
            visibleMonthlyPlan.map((group) => (
              <div key={group.station.id} className="glass rounded-2xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white/80">{group.station.name}</h3>
                  <span className="rounded-md bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs font-bold text-yellow-400">
                    {t('monthlyPlan.countShort', group.relays.length)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.relays.map((relay) => (
                    <div key={relay.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                      <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{relay.name}</p>
                        <p className="text-[10px] font-mono text-white/30">№ {relay.num}{relay.stativ ? ` · ${t('table.stativ')}: ${relay.stativ}` : ''}</p>
                      </div>
                      <p className="text-xs text-white/40 flex-shrink-0">{relay.nextCheck}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
