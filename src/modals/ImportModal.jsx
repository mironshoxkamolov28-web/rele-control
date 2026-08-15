import { Modal } from '../components';

export default function ImportModal({ t, importModalOpen, setImportModalOpen, importPreview, setImportPreview, importValidRows, importInvalidCount, handleConfirmImport }) {
  return (
    <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportPreview(null); }} maxWidth="max-w-2xl">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">{t('bulkImport.title')}</h2>

        {importPreview?.error ? (
          <p className="text-sm text-red-400 mt-3">{importPreview.error}</p>
        ) : importPreview ? (
          <>
            <p className="text-sm text-white/40 mb-4">
              {t('bulkImport.summary', importValidRows.length, importInvalidCount, importPreview.rows.length)}
            </p>
            <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/40 uppercase tracking-wider">
                      <th className="px-3 py-2 font-medium">{t('field.name')}</th>
                      <th className="px-3 py-2 font-medium">{t('field.factoryNum')}</th>
                      <th className="px-3 py-2 font-medium">{t('common.station')}</th>
                      <th className="px-3 py-2 font-medium">{t('table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.map((r, idx) => {
                      const valid = r.name && r.num && r.stationId;
                      return (
                        <tr key={idx} className="border-b border-white/5 last:border-0">
                          <td className="px-3 py-2 text-white/70">{r.name || '—'}</td>
                          <td className="px-3 py-2 text-white/70">{r.num || '—'}</td>
                          <td className="px-3 py-2 text-white/70">{r.stationName || '—'}</td>
                          <td className="px-3 py-2">
                            {valid ? (
                              <span className="text-emerald-400">{t('bulkImport.rowOk')}</span>
                            ) : (
                              <span className="text-red-400">
                                {!r.name || !r.num ? t('bulkImport.missingFields') : t('bulkImport.stationNotFound')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-5 flex gap-3">
          <button onClick={handleConfirmImport}
            disabled={importValidRows.length === 0}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
            {t('bulkImport.confirmButton')}
          </button>
          <button onClick={() => { setImportModalOpen(false); setImportPreview(null); }}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
