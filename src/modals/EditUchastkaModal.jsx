import { Modal } from '../components';

export default function EditUchastkaModal({ t, editingUchastka, setEditingUchastka, handleUpdateUchastka, confirmDiscard, setIsDirty }) {
  return (
    <Modal isOpen={!!editingUchastka} onClose={() => { if (confirmDiscard()) { setIsDirty(false); setEditingUchastka(null); } }}>
      <div className="glass rounded-2xl p-6" onInput={() => setIsDirty(true)}>
        <h2 className="text-lg font-bold text-white mb-1">{t('editUchastka.title')}</h2>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium text-white/60">{t('field.uchastkaName')}</label>
          <input value={editingUchastka?.name || ''} onChange={(e) => setEditingUchastka({ ...editingUchastka, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={handleUpdateUchastka}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
            {t('common.save')}
          </button>
          <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setEditingUchastka(null); }}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
