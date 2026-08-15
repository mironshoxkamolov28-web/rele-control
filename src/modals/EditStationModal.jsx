import { Modal } from '../components';

export default function EditStationModal({ t, editingStation, setEditingStation, uchastkalar, handleUpdateStation, stationFormError, setStationFormError, confirmDiscard, setIsDirty }) {
  return (
    <Modal isOpen={!!editingStation} onClose={() => { if (confirmDiscard()) { setIsDirty(false); setEditingStation(null); } }}>
      <div className="glass rounded-2xl p-6" onInput={() => setIsDirty(true)}>
        <h2 className="text-lg font-bold text-white mb-1">{t('editStation.title')}</h2>
        <p className="text-sm text-white/40 mb-5">{editingStation?.name}</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.stationName')}</label>
            <input value={editingStation?.name || ''} onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
            <input value={editingStation?.username || ''} onChange={(e) => setEditingStation({ ...editingStation, username: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            <p className="text-[10px] text-white/30">{t('editStation.usernameHint')}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('editStation.passwordLabel')}</label>
            <input type="password" value={editingStation?.password || ''} onChange={(e) => setEditingStation({ ...editingStation, password: e.target.value })}
              placeholder={t('editStation.passwordPlaceholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            <p className="text-[10px] text-white/30">{t('editStation.passwordHint')}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.uchastka')}</label>
            <select value={editingStation?.uchastka_id || ''} onChange={(e) => setEditingStation({ ...editingStation, uchastka_id: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50">
              <option value="" className="bg-neutral-900 text-white">{t('common.notSelected')}</option>
              {uchastkalar.map((u) => <option key={u.id} value={u.id} className="bg-neutral-900 text-white">{u.name}</option>)}
            </select>
          </div>
        </div>
        {stationFormError && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{stationFormError}</div>
        )}
        <div className="mt-5 flex gap-3">
          <button onClick={handleUpdateStation}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
            {t('common.save')}
          </button>
          <button onClick={() => { if (!confirmDiscard()) return; setIsDirty(false); setStationFormError(''); setEditingStation(null); }}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
