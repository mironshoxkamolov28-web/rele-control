export default function AddStationPage({ t, newStation, setNewStation, uchastkalar, handleAddStation, stationFormError, confirmDiscard, setIsDirty, setStationFormError, setActiveNav }) {
  return (
    <div className="glass rounded-2xl p-6 animate-slide-up max-w-2xl" onInput={() => setIsDirty(true)}>
      <h2 className="text-lg font-bold text-white">{t('addStation.title')}</h2>
      <p className="text-sm text-white/40 mb-5">{t('addStation.subtitle')}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.stationName')}</label>
          <input value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
          <input value={newStation.username} onChange={(e) => setNewStation({ ...newStation, username: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.password')}</label>
          <input type="password" value={newStation.password} onChange={(e) => setNewStation({ ...newStation, password: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.uchastka')}</label>
          <select value={newStation.uchastkaId} onChange={(e) => setNewStation({ ...newStation, uchastkaId: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50">
            <option value="" className="bg-neutral-900 text-white">{t('common.notSelected')}</option>
            {uchastkalar.map((u) => <option key={u.id} value={u.id} className="bg-neutral-900 text-white">{u.name}</option>)}
          </select>
        </div>
      </div>
      {stationFormError && (
        <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{stationFormError}</div>
      )}
      <div className="mt-5 flex gap-3">
        <button onClick={handleAddStation}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]">
          {t('addStation.submit')}
        </button>
        <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setStationFormError(''); setActiveNav('relays'); }}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
