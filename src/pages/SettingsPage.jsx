export default function SettingsPage({ t, publicUrl, publicUrlInput, setPublicUrlInput, setPublicUrl }) {
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-black text-white">{t('nav.settings')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('settings.subtitle')}</p>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">{t('settings.qrUrlHeading')}</h3>
          <p className="text-xs text-white/40 mb-4">
            {t('settings.qrUrlDescPre')} <span className="font-mono text-white/60">{window.location.origin}</span> {t('settings.qrUrlDescPost')}
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.siteUrl')}</label>
            <input
              value={publicUrlInput}
              onChange={(e) => setPublicUrlInput(e.target.value)}
              placeholder={t('settings.urlPlaceholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10 font-mono"
            />
            <p className="text-[11px] text-white/30">{t('settings.wifiHint')}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                const url = publicUrlInput.trim().replace(/\/$/, '');
                localStorage.setItem('rc_public_url', url);
                setPublicUrl(url);
                setPublicUrlInput(url);
              }}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
              {t('common.save')}
            </button>
            {publicUrl && (
              <button
                onClick={() => {
                  localStorage.removeItem('rc_public_url');
                  setPublicUrl('');
                  setPublicUrlInput('');
                }}
                className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
        {publicUrl && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
            {t('settings.currentUrl')} <span className="font-mono">{publicUrl}/relay/[id]</span>
          </div>
        )}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-400 space-y-1">
          <p className="font-semibold">{t('settings.ipHintTitle')}</p>
          <p>• {t('settings.ipHintWin')}</p>
          <p>• {t('settings.ipHintNext')} <span className="font-mono">http://192.168.x.x:5173</span></p>
        </div>
      </div>
    </div>
  );
}
