import { formatMonth } from '../i18n.js';
import { StatCard } from './StatCard.jsx';

export function MexanikStatsPanel({
  t, lang, relays, thisMonthRelays, thisMonthKey, monthCounts,
  selectedMonth, onSelectMonth, monthRelays, getStationName,
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <StatCard label={t('mexanikView.totalChecked')} value={relays.length} gradient="bg-gradient-to-br from-white/10 to-white/5" icon="⚡" delay={0} />
        <StatCard label={`${t('mexanikView.thisMonth')} — ${formatMonth(thisMonthKey, lang)}`} value={thisMonthRelays.length} gradient="bg-gradient-to-br from-amber-500/20 to-amber-500/5" icon="📅" delay={100} />
      </div>

      {relays.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4 opacity-30">🔍</div>
          <p className="text-lg font-semibold text-white/60">{t('mexanikView.empty')}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/80">
              {selectedMonth !== null
                ? (selectedMonth ? formatMonth(selectedMonth, lang) : t('mexanikView.unknownMonth'))
                : t('mexanikView.byMonth')}
            </h3>
            {selectedMonth !== null && (
              <button onClick={() => onSelectMonth(null)}
                className="text-xs font-medium text-white/50 transition hover:text-white">
                ← {t('common.back')}
              </button>
            )}
          </div>
          {selectedMonth === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {monthCounts.map((item) => (
                <button key={item.month || 'unknown'} onClick={() => onSelectMonth(item.month)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-left transition hover:bg-white/10">
                  <span className="text-sm text-white/70 truncate">{item.month ? formatMonth(item.month, lang) : t('mexanikView.unknownMonth')}</span>
                  <span className="flex-shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">{item.count}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {monthRelays.map((relay) => (
                <div key={relay.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{relay.name}</p>
                    <p className="text-[10px] font-mono text-white/30">№ {relay.num} · {getStationName(relay.stationId)}</p>
                  </div>
                  <p className="text-xs text-white/40 flex-shrink-0">{relay.lastCheck}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
