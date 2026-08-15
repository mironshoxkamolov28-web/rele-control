import { Modal } from '../components';
import { MechanicSelect } from '../components';
import { getRelayStatusFromDate } from '../relayHelpers.js';

export default function EditRelayModal({ t, selectedRelay, setSelectedRelay, stations, mexaniklar, handleSaveEdit, confirmDiscard, setIsDirty }) {
  return (
    <Modal isOpen={!!selectedRelay} onClose={() => { if (confirmDiscard()) { setIsDirty(false); setSelectedRelay(null); } }}>
      <div className="glass rounded-2xl p-6" onInput={() => setIsDirty(true)}>
        <h2 className="text-lg font-bold text-white mb-1">{t('editRelay.title')}</h2>
        <p className="text-sm text-white/40 mb-5">{selectedRelay?.name}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.name')}</label>
            <input value={selectedRelay?.name || ''}
              onChange={(e) => setSelectedRelay({ ...selectedRelay, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.factoryNum')}</label>
            <input value={selectedRelay?.num || ''}
              onChange={(e) => setSelectedRelay({ ...selectedRelay, num: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('common.station')}</label>
            <select value={selectedRelay?.stationId || ''}
              onChange={(e) => setSelectedRelay({ ...selectedRelay, stationId: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50">
              {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.stativNum')}</label>
            <input value={selectedRelay?.stativ || ''}
              onChange={(e) => setSelectedRelay({ ...selectedRelay, stativ: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.lastCheck')}</label>
            <input type="date" value={selectedRelay?.lastCheck || ''}
              onChange={(e) => setSelectedRelay({ ...selectedRelay, lastCheck: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.nextCheck')}</label>
            <input type="date" value={selectedRelay?.nextCheck || ''}
              onChange={(e) => setSelectedRelay({
                ...selectedRelay,
                nextCheck: e.target.value,
                status: getRelayStatusFromDate(e.target.value),
              })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-medium text-white/60">{t('field.checkedBy')}</label>
          <MechanicSelect mexaniklar={mexaniklar} value={selectedRelay?.note || ''}
            onChange={(v) => { setSelectedRelay({ ...selectedRelay, note: v }); setIsDirty(true); }} t={t} />
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={handleSaveEdit}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
            {t('common.save')}
          </button>
          <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setSelectedRelay(null); }}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
