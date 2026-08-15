import { Modal, MechanicSelect } from '../components';

export default function BulkEditModal({ t, bulkEditOpen, setBulkEditOpen, bulkEdit, setBulkEdit, stations, mexaniklar, handleSaveBulkEdit, selectedRelayIds }) {
  return (
    <Modal isOpen={bulkEditOpen} onClose={() => setBulkEditOpen(false)}>
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">{t('bulkEdit.title')}</h2>
        <p className="text-sm text-white/40 mb-5">{t('bulkEdit.selectedCount', selectedRelayIds.length)}</p>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-3 rounded border-white/20 bg-white/5" checked={bulkEdit.applyStation}
              onChange={(e) => setBulkEdit({ ...bulkEdit, applyStation: e.target.checked })} />
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('common.station')}</label>
              <select value={bulkEdit.stationId} disabled={!bulkEdit.applyStation}
                onChange={(e) => setBulkEdit({ ...bulkEdit, stationId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 disabled:opacity-40">
                <option value="" className="bg-neutral-900 text-white"></option>
                {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-3 rounded border-white/20 bg-white/5" checked={bulkEdit.applyLastCheck}
              onChange={(e) => setBulkEdit({ ...bulkEdit, applyLastCheck: e.target.checked })} />
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.lastCheck')}</label>
              <input type="date" value={bulkEdit.lastCheck} disabled={!bulkEdit.applyLastCheck}
                onChange={(e) => setBulkEdit({ ...bulkEdit, lastCheck: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 disabled:opacity-40" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-3 rounded border-white/20 bg-white/5" checked={bulkEdit.applyNextCheck}
              onChange={(e) => setBulkEdit({ ...bulkEdit, applyNextCheck: e.target.checked })} />
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.nextCheck')}</label>
              <input type="date" value={bulkEdit.nextCheck} disabled={!bulkEdit.applyNextCheck}
                onChange={(e) => setBulkEdit({ ...bulkEdit, nextCheck: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 disabled:opacity-40" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-3 rounded border-white/20 bg-white/5" checked={bulkEdit.applyStativ}
              onChange={(e) => setBulkEdit({ ...bulkEdit, applyStativ: e.target.checked })} />
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.stativNum')}</label>
              <input value={bulkEdit.stativ} disabled={!bulkEdit.applyStativ}
                onChange={(e) => setBulkEdit({ ...bulkEdit, stativ: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 disabled:opacity-40" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-3 rounded border-white/20 bg-white/5" checked={bulkEdit.applyNote}
              onChange={(e) => setBulkEdit({ ...bulkEdit, applyNote: e.target.checked })} />
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.checkedBy')}</label>
              <fieldset disabled={!bulkEdit.applyNote} className="disabled:opacity-40">
                <MechanicSelect mexaniklar={mexaniklar} value={bulkEdit.note}
                  onChange={(v) => setBulkEdit({ ...bulkEdit, note: v })} t={t} />
              </fieldset>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleSaveBulkEdit}
            disabled={!bulkEdit.applyStation && !bulkEdit.applyNextCheck && !bulkEdit.applyLastCheck && !bulkEdit.applyStativ && !bulkEdit.applyNote}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            {t('bulkEdit.applyButton')}
          </button>
          <button onClick={() => setBulkEditOpen(false)}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
