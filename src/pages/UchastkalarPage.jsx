export default function UchastkalarPage({ t, uchastkalar, visibleUchastkalar, uchastkaSearch, setUchastkaSearch, stations, relays, setEditingUchastka, setDeleteUchastkaId, setIsDirty }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">{t('nav.uchastkalar')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('uchastkalar.subtitle')}</p>
      </div>

      {uchastkalar.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <p className="text-sm text-white/40">{t('uchastkalar.empty')}</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={uchastkaSearch} placeholder={t('common.searchPlaceholder')}
              onChange={(e) => setUchastkaSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
          </div>
          {visibleUchastkalar.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
              <p className="text-sm text-white/40">{t('common.noSearchResults')}</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.uchastka')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.stationCount')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.relayCount')}</th>
                      <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUchastkalar.map((u, idx) => {
                      const stationIds = stations.filter((s) => s.uchastka_id === u.id).map((s) => s.id);
                      const relayCount = relays.filter((r) => stationIds.includes(r.stationId)).length;
                      return (
                        <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                          <td className="px-4 py-3 text-white/60">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                          <td className="px-4 py-3 text-white/60">{stationIds.length}</td>
                          <td className="px-4 py-3 text-white/60">{relayCount}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setIsDirty(false); setEditingUchastka({ id: u.id, name: u.name }); }}
                                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                {t('common.edit')}
                              </button>
                              <button onClick={() => setDeleteUchastkaId(u.id)}
                                className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                {t('common.delete')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {visibleUchastkalar.map((u) => {
                  const stationIds = stations.filter((s) => s.uchastka_id === u.id).map((s) => s.id);
                  const relayCount = relays.filter((r) => stationIds.includes(r.stationId)).length;
                  return (
                    <div key={u.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 text-cyan-400 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{u.name}</p>
                        <p className="text-xs text-white/40">{t('table.stationCount')}: {stationIds.length} &middot; {t('common.relayCountShort', relayCount)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setIsDirty(false); setEditingUchastka({ id: u.id, name: u.name }); }}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                          {t('common.edit')}
                        </button>
                        <button onClick={() => setDeleteUchastkaId(u.id)}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
