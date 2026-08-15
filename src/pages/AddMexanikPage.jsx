export default function AddMexanikPage({ t, newMexanik, setNewMexanik, handleAddMexanik, mexanikFormError, confirmDiscard, setIsDirty, setMexanikFormError, setActiveNav }) {
  return (
    <div className="glass rounded-2xl p-6 animate-slide-up max-w-md" onInput={() => setIsDirty(true)}>
      <h2 className="text-lg font-bold text-white">{t('addMexanik.title')}</h2>
      <p className="text-sm text-white/40 mb-5">{t('addMexanik.subtitle')}</p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/60">{t('field.mechanicName')}</label>
        <input value={newMexanik.name} onChange={(e) => setNewMexanik({ ...newMexanik, name: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
      </div>
      <div className="space-y-1.5 mt-4">
        <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
        <input value={newMexanik.username} onChange={(e) => setNewMexanik({ ...newMexanik, username: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
        <p className="text-[10px] text-white/30">{t('addMexanik.loginHint')}</p>
      </div>
      <div className="space-y-1.5 mt-4">
        <label className="text-xs font-medium text-white/60">{t('field.password')}</label>
        <input type="password" value={newMexanik.password} onChange={(e) => setNewMexanik({ ...newMexanik, password: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
      </div>
      {mexanikFormError && (
        <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{mexanikFormError}</div>
      )}
      <div className="mt-5 flex gap-3">
        <button onClick={handleAddMexanik}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]">
          {t('addMexanik.submit')}
        </button>
        <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setMexanikFormError(''); setActiveNav('mexaniklar'); }}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
