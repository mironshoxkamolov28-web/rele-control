import { Modal } from '../components';

export default function EditMexanikModal({ t, editingMexanik, setEditingMexanik, handleUpdateMexanik, confirmDiscard, setIsDirty }) {
  return (
    <Modal isOpen={!!editingMexanik} onClose={() => { if (confirmDiscard()) { setIsDirty(false); setEditingMexanik(null); } }}>
      <div className="glass rounded-2xl p-6" onInput={() => setIsDirty(true)}>
        <h2 className="text-lg font-bold text-white mb-1">{t('editMexanik.title')}</h2>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium text-white/60">{t('field.mechanicName')}</label>
          <input value={editingMexanik?.name || ''} onChange={(e) => setEditingMexanik({ ...editingMexanik, name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
        </div>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
          <input value={editingMexanik?.username || ''} onChange={(e) => setEditingMexanik({ ...editingMexanik, username: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          <p className="text-[10px] text-white/30">{t('addMexanik.loginHint')}</p>
        </div>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium text-white/60">{t('editStation.passwordLabel')}</label>
          <input type="password" value={editingMexanik?.password || ''} onChange={(e) => setEditingMexanik({ ...editingMexanik, password: e.target.value })}
            placeholder={t('editStation.passwordPlaceholder')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          <p className="text-[10px] text-white/30">{t('editStation.passwordHint')}</p>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={handleUpdateMexanik}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
            {t('common.save')}
          </button>
          <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setEditingMexanik(null); }}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
