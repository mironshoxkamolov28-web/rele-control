import { StatCard } from '../components';

export default function DashboardPage({ t, stats, stationRelays, visibleStations, globalNameCounts, relays, getRelayStatusFromDate, setActiveNav, setFilterStatus, setSearchQuery, setViewStation }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">{t('nav.dashboard')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {stats.expired > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 sm:p-5 animate-fade-in">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-lg animate-pulse-soft">⚠️</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-red-400">{t('dashboard.alertExpiredCount', stats.expired)}</p>
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {stationRelays.filter((r) => r.status === 'red').slice(0, 3).map((r) => r.name).join(', ')}
              {stats.expired > 3 ? t('dashboard.alertMore', stats.expired - 3) : ''} {t('dashboard.alertAction')}
            </p>
            <button onClick={() => { setActiveNav('relays'); setFilterStatus('red'); }}
              className="mt-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30">
              {t('dashboard.viewBtn')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label={t('stat.total')} value={stats.total} gradient="bg-gradient-to-br from-white/10 to-white/5" icon="⚡" delay={0}
          onClick={() => { setActiveNav('relays'); setFilterStatus('all'); }} />
        <StatCard label={t('stat.expired')} value={stats.expired} gradient="bg-gradient-to-br from-red-500/20 to-red-500/5" icon="🔴" delay={100}
          onClick={() => { setActiveNav('relays'); setFilterStatus('red'); }} />
        <StatCard label={t('stat.warning')} value={stats.warning} gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5" icon="🟡" delay={200}
          onClick={() => { setActiveNav('relays'); setFilterStatus('yellow'); }} />
        <StatCard label={t('stat.active')} value={stats.active} gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" icon="🟢" delay={300}
          onClick={() => { setActiveNav('relays'); setFilterStatus('green'); }} />
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4">{t('dashboard.byStation')}</h3>
        <div className="space-y-3">
          {visibleStations.map((s) => {
            const count = relays.filter((r) => r.stationId === s.id).length;
            const expired = relays.filter((r) => r.stationId === s.id && getRelayStatusFromDate(r.nextCheck) === 'red').length;
            return (
              <button key={s.id} type="button" onClick={() => setViewStation(s.id)}
                style={{ touchAction: 'manipulation' }}
                className="flex w-full items-center gap-4 rounded-xl bg-white/5 px-4 py-3 text-left transition-colors duration-150 hover:bg-white/10 active:bg-white/15">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs text-white/40">{t('common.relayCountShort', count)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{count}</p>
                  <p className={`text-xs ${expired > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {expired > 0 ? t('dashboard.expiredShort', expired) : t('dashboard.allGood')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {globalNameCounts.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/80 mb-4">{t('stationView.byName')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {globalNameCounts.map((item) => (
              <button key={item.name} type="button"
                onClick={() => { setActiveNav('relays'); setFilterStatus('all'); setSearchQuery(item.name); }}
                className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-left transition hover:bg-white/10">
                <span className="text-sm text-white/70 truncate">{item.name}</span>
                <span className="flex-shrink-0 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
