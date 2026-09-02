import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { statusConfig, qrUrl } from '../relayHelpers.js';

export default function RelaysPage({
  t, auth, pagedRelays, visibleRelays, stations, getStationName,
  searchQuery, setSearchQuery, filterStatus, setFilterStatus,
  adminFilterStation, setAdminFilterStation,
  selectedRelayIds, setSelectedRelayIds, setBulkEditOpen,
  relayPage, setRelayPage, relayPageCount, relayPageSize, setRelayPageSize,
  importFileInputRef, handleRelayImportFile,
  exportToPDF, exportRelaysToCSV, downloadRelayImportTemplate,
  setSelectedRelay, setIsDirty, printQRCode, handleDeleteRelay,
}) {
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">{t('nav.relays')}</h2>
          <p className="text-sm text-white/40 mt-1">{t('relays.foundCount', visibleRelays.length)}</p>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <button onClick={exportToPDF}
            className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
            {t('common.pdfExport')}
          </button>
          <button onClick={exportRelaysToCSV}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
            {t('bulkImport.csvExport')}
          </button>
          {auth?.id === 'admin' && (
            <>
              <button onClick={downloadRelayImportTemplate}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/20 hover:text-white">
                {t('bulkImport.template')}
              </button>
              <button onClick={() => importFileInputRef.current?.click()}
                className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20">
                {t('bulkImport.importButton')}
              </button>
              <input ref={importFileInputRef} type="file" accept=".csv,text/csv" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) handleRelayImportFile(file);
                }} />
            </>
          )}
        </div>

        {/* Mobile actions toggle */}
        <div className="sm:hidden relative">
          <button onClick={() => setMobileActionsOpen(!mobileActionsOpen)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {t('common.actions') || 'Amallar'}
            <svg className={`h-3 w-3 transition-transform ${mobileActionsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileActionsOpen && (
            <div className="mt-2 glass rounded-xl p-2 space-y-1 animate-slide-down">
              <button onClick={() => { exportToPDF(); setMobileActionsOpen(false); }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 text-left">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {t('common.pdfExport')}
              </button>
              <button onClick={() => { exportRelaysToCSV(); setMobileActionsOpen(false); }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10 text-left">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t('bulkImport.csvExport')}
              </button>
              {auth?.id === 'admin' && (
                <>
                  <button onClick={() => { downloadRelayImportTemplate(); setMobileActionsOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-white/60 transition hover:bg-white/10 text-left">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {t('bulkImport.template')}
                  </button>
                  <button onClick={() => { importFileInputRef.current?.click(); setMobileActionsOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10 text-left">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {t('bulkImport.importButton')}
                  </button>
                  <input ref={importFileInputRef} type="file" accept=".csv,text/csv" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) handleRelayImportFile(file);
                    }} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="relative w-full">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchQuery} placeholder={t('relays.searchPlaceholder')} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10"
              onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50">
              <option value="all" className="bg-neutral-900 text-white">{t('filter.allStatus')}</option>
              <option value="red" className="bg-neutral-900 text-white">{t('status.red')}</option>
              <option value="yellow" className="bg-neutral-900 text-white">{t('status.yellow')}</option>
              <option value="green" className="bg-neutral-900 text-white">{t('status.green')}</option>
            </select>
            {auth?.id === 'admin' && (
              <select value={adminFilterStation} onChange={(e) => setAdminFilterStation(e.target.value)}
                className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50">
                <option value="all" className="bg-neutral-900 text-white">{t('filter.allStations')}</option>
                {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {auth?.id === 'admin' && selectedRelayIds.length > 0 && (
        <div className="glass rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fade-in">
          <p className="text-sm text-white/70 text-center sm:text-left">{t('bulkEdit.selectedCount', selectedRelayIds.length)}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setBulkEditOpen(true)}
              className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 sm:py-2 text-xs font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25">
              {t('bulkEdit.editButton')}
            </button>
            <button onClick={() => setSelectedRelayIds([])}
              className="flex-1 sm:flex-none rounded-xl bg-white/10 px-4 py-2.5 sm:py-2 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
              {auth?.id === 'admin' && (
                <th className="px-4 py-3 font-medium w-8">
                  <input type="checkbox"
                    checked={pagedRelays.length > 0 && pagedRelays.every((r) => selectedRelayIds.includes(r.id))}
                    onChange={(e) => {
                      const pageIds = pagedRelays.map((r) => r.id);
                      setSelectedRelayIds((cur) => e.target.checked
                        ? Array.from(new Set([...cur, ...pageIds]))
                        : cur.filter((id) => !pageIds.includes(id)));
                    }}
                    className="rounded border-white/20 bg-white/5" />
                </th>
              )}
              <th className="px-4 py-3 font-medium">{t('table.status')}</th>
              <th className="px-4 py-3 font-medium">{t('table.name')}</th>
              <th className="px-4 py-3 font-medium">{t('common.station')}</th>
              <th className="px-4 py-3 font-medium">{t('table.stativ')}</th>
              <th className="px-4 py-3 font-medium">{t('field.lastCheck')}</th>
              <th className="px-4 py-3 font-medium">{t('table.nextCheck')}</th>
              <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pagedRelays.map((relay) => {
              const sc = statusConfig[relay.status];
              return (
                <tr key={relay.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                  {auth?.id === 'admin' && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedRelayIds.includes(relay.id)}
                        onChange={(e) => setSelectedRelayIds((cur) => e.target.checked
                          ? [...cur, relay.id]
                          : cur.filter((id) => id !== relay.id))}
                        className="rounded border-white/20 bg-white/5" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                      {t(`status.${relay.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white" title={relay.note || undefined}>{relay.name}</div>
                    <div className="text-xs font-mono text-white/30">№ {relay.num}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{getStationName(relay.stationId)}</td>
                  <td className="px-4 py-3 text-white/60">{relay.stativ || '—'}</td>
                  <td className="px-4 py-3 text-white/60">{relay.lastCheck || '—'}</td>
                  <td className="px-4 py-3 text-white/60">{relay.nextCheck}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsDirty(false); setSelectedRelay({ ...relay }); }}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => printQRCode(relay)}
                        className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                        {t('common.qr')}
                      </button>
                      {auth?.id === 'admin' && (
                        <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden grid grid-cols-1 gap-3">
        {pagedRelays.map((relay, idx) => {
          const sc = statusConfig[relay.status];
          return (
            <div key={relay.id}
              className="group relative overflow-hidden rounded-2xl glass hover:bg-white/[0.08] transition-all duration-500 active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}>
              <div className={`absolute top-0 left-0 h-1 w-full ${sc.bar}`}>
                <div className={`h-full ${sc.barFill} transition-all duration-700`} style={{ width: relay.status === 'green' ? '25%' : relay.status === 'yellow' ? '60%' : '100%' }} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-2.5 w-2.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                      {t(`status.${relay.status}`)}
                    </span>
                  </div>
                  {auth?.id === 'admin' && (
                    <input type="checkbox" checked={selectedRelayIds.includes(relay.id)}
                      onChange={(e) => setSelectedRelayIds((cur) => e.target.checked
                        ? [...cur, relay.id]
                        : cur.filter((id) => id !== relay.id))}
                      className="rounded border-white/20 bg-white/5 h-4 w-4 touch-sm" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-0.5">{relay.name}</h3>
                <p className="text-xs font-mono text-white/30 mb-2">№ {relay.num}</p>
                <div className="text-xs text-white/40 mb-2">{getStationName(relay.stationId)}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-white/50">
                  {relay.stativ && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
                      <span className="text-white/70">{relay.stativ}</span>
                    </div>
                  )}
                  {relay.lastCheck && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-white/70">{relay.lastCheck}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-white/70">{relay.nextCheck}</span>
                  </div>
                  {relay.note && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                      <span className="text-white/50 italic truncate">{relay.note}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex gap-1.5">
                    <button onClick={() => { setIsDirty(false); setSelectedRelay({ ...relay }); }}
                      className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white touch-sm">
                      {t('common.edit')}
                    </button>
                    <button onClick={() => printQRCode(relay)}
                      className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20 touch-sm">
                      QR
                    </button>
                    {auth?.id === 'admin' && (
                      <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 touch-sm">
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  <div id={`qr-${relay.id}`} className="bg-white rounded-lg p-1 transition-transform">
                    <QRCodeSVG value={qrUrl(relay)} size={36} level="H" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleRelays.length === 0 && (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
          <div className="text-4xl sm:text-5xl mb-4 opacity-30">🔍</div>
          <p className="text-base sm:text-lg font-semibold text-white/60">{t('relays.empty')}</p>
          <p className="text-xs sm:text-sm text-white/30 mt-1">{t('relays.emptyHint')}</p>
        </div>
      )}

      {visibleRelays.length > 0 && (
        <div className="glass rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>
              {visibleRelays.length === 0 ? 0 : (relayPage - 1) * relayPageSize + 1}
              {'–'}
              {Math.min(relayPage * relayPageSize, visibleRelays.length)} / {visibleRelays.length}
            </span>
            <select value={relayPageSize} onChange={(e) => setRelayPageSize(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none transition focus:border-amber-500/50">
              {[10, 20, 50, 100].map((n) => <option key={n} value={n} className="bg-neutral-900 text-white">{t('pagination.perPage', n)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRelayPage((p) => Math.max(1, p - 1))} disabled={relayPage <= 1}
              className="rounded-lg bg-white/10 px-3 py-2 sm:py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              {t('pagination.prev')}
            </button>
            <span className="text-xs text-white/50">{relayPage} / {relayPageCount}</span>
            <button onClick={() => setRelayPage((p) => Math.min(relayPageCount, p + 1))} disabled={relayPage >= relayPageCount}
              className="rounded-lg bg-white/10 px-3 py-2 sm:py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              {t('pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
