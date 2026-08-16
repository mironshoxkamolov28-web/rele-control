import { useState } from 'react';
import { StatCard } from '../components';
import { statusConfig } from '../relayHelpers.js';

export default function StationDetailView({
  t, auth, viewStationData, viewStationStats, viewStationRelays,
  viewStationNameCounts, viewStationNameFilter, setViewStationNameFilter,
  filteredViewStationRelays, setViewStation, setSelectedRelay, setIsDirty,
  printQRCode, handleDeleteRelay, setEditingStation,
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSetStatusFilter = (val) => {
    setStatusFilter(val);
    setViewStationNameFilter(null);
  };

  const displayRelays = statusFilter === 'all'
    ? filteredViewStationRelays
    : filteredViewStationRelays.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewStation(null)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white">{viewStationData?.name}</h2>
          <p className="text-sm text-white/40 mt-1">{t('stationView.subtitle')}</p>
        </div>
        {auth?.id === 'admin' && viewStationData && (
          <button
            onClick={() => {
              setIsDirty(false);
              setEditingStation({
                _originalId: viewStationData.id,
                name: viewStationData.name,
                username: viewStationData.username,
                password: '',
                uchastka_id: viewStationData.uchastka_id || '',
              });
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('common.edit')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label={t('stat.total')} value={viewStationStats.total} gradient={`bg-gradient-to-br from-white/10 to-white/5 ${statusFilter === 'all' ? 'ring-2 ring-white/30' : ''}`} icon="⚡" delay={0}
          onClick={() => handleSetStatusFilter('all')} />
        <StatCard label={t('stat.expired')} value={viewStationStats.expired} gradient={`bg-gradient-to-br from-red-500/20 to-red-500/5 ${statusFilter === 'red' ? 'ring-2 ring-red-400/50' : ''}`} icon="🔴" delay={100}
          onClick={() => handleSetStatusFilter('red')} />
        <StatCard label={t('stat.warning')} value={viewStationStats.warning} gradient={`bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 ${statusFilter === 'yellow' ? 'ring-2 ring-yellow-400/50' : ''}`} icon="🟡" delay={200}
          onClick={() => handleSetStatusFilter('yellow')} />
        <StatCard label={t('stat.active')} value={viewStationStats.active} gradient={`bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ${statusFilter === 'green' ? 'ring-2 ring-emerald-400/50' : ''}`} icon="🟢" delay={300}
          onClick={() => handleSetStatusFilter('green')} />
      </div>

      {viewStationNameCounts.length > 0 && statusFilter === 'all' && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/80">{t('stationView.byName')}</h3>
            {viewStationNameFilter && (
              <button onClick={() => setViewStationNameFilter(null)}
                className="text-xs font-medium text-white/50 transition hover:text-white">
                {t('stationView.clearFilter')} ✕
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {viewStationNameCounts.map((item) => {
              const isActive = viewStationNameFilter === item.name;
              return (
                <button key={item.name} type="button"
                  onClick={() => setViewStationNameFilter(isActive ? null : item.name)}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition ${isActive ? 'bg-amber-500/20 ring-1 ring-amber-500/40' : 'bg-white/5 hover:bg-white/10'}`}>
                  <span className={`text-sm truncate ${isActive ? 'text-amber-400' : 'text-white/70'}`}>{item.name}</span>
                  <span className="flex-shrink-0 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status filter badge */}
      {statusFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">
            {t(`status.${statusFilter}`)} — {displayRelays.length} ta rele
          </span>
          <button onClick={() => setStatusFilter('all')}
            className="text-xs text-white/40 hover:text-white transition">✕ Tozalash</button>
        </div>
      )}

      {displayRelays.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <div className="text-5xl mb-4 opacity-30">🔍</div>
          <p className="text-lg font-semibold text-white/60">{t('stationView.empty')}</p>
        </div>
      ) : (
        <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                <th className="px-4 py-3 font-medium">{t('table.name')}</th>
                <th className="px-4 py-3 font-medium">{t('table.stativ')}</th>
                <th className="px-4 py-3 font-medium">{t('field.lastCheck')}</th>
                <th className="px-4 py-3 font-medium">{t('table.nextCheck')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {displayRelays.map((relay) => {
                const sc = statusConfig[relay.status];
                return (
                  <tr key={relay.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                        {t(`status.${relay.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white" title={relay.note || undefined}>{relay.name}</div>
                      <div className="text-xs font-mono text-white/30">№ {relay.num}</div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{relay.stativ || '—'}</td>
                    <td className="px-4 py-3 text-white/60">{relay.lastCheck || '—'}</td>
                    <td className="px-4 py-3 text-white/60">{relay.nextCheck}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setIsDirty(false); setSelectedRelay({ ...relay }); }}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                          {t('common.edit')}
                        </button>
                        <button onClick={() => printQRCode(relay)}
                          className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                          {t('common.qr')}
                        </button>
                        {auth?.id === 'admin' && (
                          <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                            className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="md:hidden grid grid-cols-1 gap-4">
        {displayRelays.map((relay, idx) => {
          const sc = statusConfig[relay.status];
          return (
            <div key={relay.id}
              className="group relative overflow-hidden rounded-2xl glass hover:bg-white/[0.08] transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}>
              <div className={`absolute top-0 left-0 h-1 w-full ${sc.bar}`}>
                <div className={`h-full ${sc.barFill}`} style={{ width: relay.status === 'green' ? '25%' : relay.status === 'yellow' ? '60%' : '100%' }} />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex h-2.5 w-2.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                    {t(`status.${relay.status}`)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{relay.name}</h3>
                <p className="text-xs font-mono text-white/30 mb-3">№ {relay.num}</p>
                <div className="space-y-1.5 text-sm text-white/50">
                  {relay.stativ && <div>{t('table.stativ')}: {relay.stativ}</div>}
                  {relay.lastCheck && <div>{t('field.lastCheck')}: {relay.lastCheck}</div>}
                  <div>{relay.nextCheck}</div>
                </div>
                <div className="mt-4 flex gap-2 pt-4 border-t border-white/5">
                  <button onClick={() => { setIsDirty(false); setSelectedRelay({ ...relay }); }}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                    {t('common.edit')}
                  </button>
                  <button onClick={() => printQRCode(relay)}
                    className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                    {t('common.qr')}
                  </button>
                  {auth?.id === 'admin' && (
                    <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
