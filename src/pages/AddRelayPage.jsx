import { MechanicSelect } from '../components';

export default function AddRelayPage({ t, newRelay, setNewRelay, stations, mexaniklar, handleAddRelay, confirmDiscard, setIsDirty, setActiveNav }) {
  return (
    <div className="glass rounded-2xl p-6 animate-slide-up max-w-3xl" onInput={() => setIsDirty(true)}>
      <h2 className="text-lg font-bold text-white">{t('addRelay.title')}</h2>
      <p className="text-sm text-white/40 mb-5">{t('addRelay.subtitle')}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('common.station')}</label>
          <select value={newRelay.stationId} onChange={(e) => setNewRelay({ ...newRelay, stationId: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50">
            {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.relayName')}</label>
          <input value={newRelay.name} onChange={(e) => setNewRelay({ ...newRelay, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.factoryNum')}</label>
          <input value={newRelay.num} onChange={(e) => setNewRelay({ ...newRelay, num: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.stativNum')}</label>
          <input value={newRelay.stativ} onChange={(e) => setNewRelay({ ...newRelay, stativ: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.lastCheck')}</label>
          <input type="date" value={newRelay.lastCheck} onChange={(e) => setNewRelay({ ...newRelay, lastCheck: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.nextCheck')}</label>
          <input type="date" value={newRelay.nextCheck} onChange={(e) => setNewRelay({ ...newRelay, nextCheck: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <label className="text-xs font-medium text-white/60">{t('field.checkedBy')}</label>
        <MechanicSelect mexaniklar={mexaniklar} value={newRelay.note} onChange={(v) => { setNewRelay({ ...newRelay, note: v }); setIsDirty(true); }} t={t} />
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={handleAddRelay}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
          {t('addRelay.submit')}
        </button>
        <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setActiveNav('relays'); }}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
