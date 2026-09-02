import { LanguageToggle, ThemeToggle } from '../components';

export default function LoginPage({
  lang, cycleLang, theme, toggleTheme, t,
  relays, stations, mexaniklar,
  loginStation, setLoginStation,
  loginUsername, setLoginUsername,
  loginPassword, setLoginPassword,
  showLoginPassword, setShowLoginPassword,
  loginError, handleLogin,
}) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen min-h-[100dvh] font-sans transition-colors duration-300 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <LanguageToggle lang={lang} onCycle={cycleLang} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} />
      </div>
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center p-4">
        <div className="w-full max-w-5xl animate-fade-in">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 hidden lg:flex flex-col justify-center space-y-6">
              <div className="inline-flex w-fit rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
                {t('login.badge')}
              </div>
              <h2 className="text-5xl font-black leading-tight text-white">
                {t('login.heroLine1')}
                <span className="text-gradient block mt-1">{t('login.heroLine2')}</span>
                {t('login.heroLine3')}
              </h2>
              <p className="max-w-md text-base leading-relaxed text-white/50">
                {t('login.heroDesc')}
              </p>
              <div className="flex gap-4">
                <div className="rounded-2xl glass-light p-4">
                  <p className="text-2xl font-black text-white">{relays.length}</p>
                  <p className="text-xs text-white/40">{t('login.statTotalRelay')}</p>
                </div>
                <div className="rounded-2xl glass-light p-4">
                  <p className="text-2xl font-black text-white">{stations.length - 1}</p>
                  <p className="text-xs text-white/40">{t('login.statStations')}</p>
                </div>
                <div className="rounded-2xl glass-light p-4">
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-xs text-white/40">{t('login.statSecurity')}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              {/* Mobile-only mini branding + stats */}
              <div className="lg:hidden text-center mb-6 animate-fade-in">
                <div className="flex justify-center mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                    <span className="text-2xl font-black text-slate-950">R</span>
                  </div>
                </div>
                <h1 className="text-lg font-bold tracking-widest text-white">RELE CONTROL</h1>
                <p className="text-xs text-white/40 mt-1">{t('app.tagline')}</p>
                <div className="flex justify-center gap-3 mt-4">
                  <div className="rounded-xl glass-light px-3 py-2">
                    <p className="text-lg font-black text-white">{relays.length}</p>
                    <p className="text-[10px] text-white/40">{t('login.statTotalRelay')}</p>
                  </div>
                  <div className="rounded-xl glass-light px-3 py-2">
                    <p className="text-lg font-black text-white">{stations.length - 1}</p>
                    <p className="text-[10px] text-white/40">{t('login.statStations')}</p>
                  </div>
                  <div className="rounded-xl glass-light px-3 py-2">
                    <p className="text-lg font-black text-white">100%</p>
                    <p className="text-[10px] text-white/40">{t('login.statSecurity')}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 animate-slide-up">
                <h3 className="text-xl font-bold text-white mb-1">{t('login.title')}</h3>
                <p className="text-sm text-white/40 mb-6">{t('login.subtitle')}</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('common.station')}</label>
                    <select value={loginStation} onChange={(e) => setLoginStation(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-black outline-none transition focus:border-amber-500/50 focus:bg-white/10">
                      <optgroup label={t('nav.stations')}>
                        {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </optgroup>
                      {mexaniklar.filter((m) => m.username).length > 0 && (
                        <optgroup label={t('nav.mexaniklar')}>
                          {mexaniklar.filter((m) => m.username).map((m) => (
                            <option key={m.id} value={`mexanik:${m.id}`}>{m.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('login.username')}</label>
                    <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('login.password')}</label>
                    <div className="relative">
                      <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
                      <button type="button" onClick={() => setShowLoginPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition">
                        {showLoginPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{loginError}</div>
                  )}
                  <button type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
                    {t('login.submit')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
