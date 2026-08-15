export default function StationsPage({ t, stations, relays, setEditingStation, setDeleteStationId, setIsDirty, getUchastkaName }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">{t('nav.stations')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('station.subtitle')}</p>
      </div>
      <div className="space-y-3">
        {stations.filter((s) => s.id !== 'admin').map((s) => {
          const count = relays.filter((r) => r.stationId === s.id).length;
          return (
            <div key={s.id} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400 font-bold">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{s.name}</p>
                <p className="text-xs text-white/40">
                  {t('station.loginLabel')} <span className="font-mono text-white/50">{s.username}</span> &middot; {t('common.relayCountShort', count)} &middot; {t('station.uchastkaLabel')} {getUchastkaName(s.uchastka_id)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsDirty(false); setEditingStation({ _originalId: s.id, name: s.name, username: s.username, password: '', uchastka_id: s.uchastka_id || '' }); }}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                  {t('common.edit')}
                </button>
                <button onClick={() => setDeleteStationId(s.id)}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                  {t('common.delete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
