import { Modal } from '../components';

export default function GlobalSearchModal({ t, globalSearchOpen, setGlobalSearchOpen, globalSearchQuery, setGlobalSearchQuery, globalSearchResults, globalSearchHasResults, openGlobalSearchRelay, openGlobalSearchStation, openGlobalSearchUchastka, openGlobalSearchMexanik, getStationName }) {
  return (
    <Modal isOpen={globalSearchOpen} onClose={() => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); }}>
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <svg className="h-5 w-5 flex-shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z" />
          </svg>
          <input autoFocus value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder={t('globalSearch.placeholder')}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
        </div>

        <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-4">
          {!globalSearchResults ? (
            <p className="text-center text-sm text-white/30 py-8">{t('globalSearch.hint')}</p>
          ) : !globalSearchHasResults ? (
            <p className="text-center text-sm text-white/30 py-8">{t('globalSearch.noResults')}</p>
          ) : (
            <>
              {globalSearchResults.relays.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 px-1">{t('nav.relays')}</p>
                  <div className="space-y-1">
                    {globalSearchResults.relays.map((r) => (
                      <button key={r.id} onClick={() => openGlobalSearchRelay(r)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                        <span className="truncate">{r.name} ({r.num})</span>
                        <span className="flex-shrink-0 text-xs text-white/30">{getStationName(r.stationId)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {globalSearchResults.stations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 px-1">{t('nav.stations')}</p>
                  <div className="space-y-1">
                    {globalSearchResults.stations.map((s) => (
                      <button key={s.id} onClick={() => openGlobalSearchStation(s)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {globalSearchResults.uchastkalar.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 px-1">{t('nav.uchastkalar')}</p>
                  <div className="space-y-1">
                    {globalSearchResults.uchastkalar.map((u) => (
                      <button key={u.id} onClick={() => openGlobalSearchUchastka(u)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {globalSearchResults.mexaniklar.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5 px-1">{t('nav.mexaniklar')}</p>
                  <div className="space-y-1">
                    {globalSearchResults.mexaniklar.map((m) => (
                      <button key={m.id} onClick={() => openGlobalSearchMexanik(m)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
