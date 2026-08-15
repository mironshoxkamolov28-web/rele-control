import { QRCodeSVG } from 'qrcode.react';
import { LanguageToggle } from '../components';
import { qrUrl, statusConfig } from '../relayHelpers.js';

export default function PublicRelayPage({ relay, lang, cycleLang, t, getStationName }) {
  const sc = statusConfig[relay.status];
  const sName = relay.stationName || getStationName(relay.stationId);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle lang={lang} onCycle={cycleLang} />
      </div>
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20 mb-4">
            RELE CONTROL
          </div>
          <div className={`absolute top-0 left-0 h-1.5 w-full rounded-t-2xl ${sc.bar}`}>
            <div className={`h-full rounded-t-2xl ${sc.barFill}`} style={{ width: relay.status === 'green' ? '25%' : relay.status === 'yellow' ? '60%' : '100%' }} />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 mb-3">
            <span className={`flex h-3 w-3 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
            <span className={`px-3 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
              {t(`status.${relay.status}`)}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{relay.name}</h2>
          <p className="text-sm font-mono text-white/40 mt-1">№ {relay.num}</p>
          <div className="my-5 flex justify-center">
            <div className="bg-white rounded-xl p-3">
              <QRCodeSVG value={qrUrl(relay)} size={140} level="H" />
            </div>
          </div>
          <div className="space-y-2 text-sm text-left bg-white/5 rounded-xl p-4">
            <div className="flex justify-between"><span className="text-white/40">{t('common.station')}</span><span className="text-white font-medium">{sName}</span></div>
            {relay.stativ && <div className="flex justify-between"><span className="text-white/40">{t('table.stativ')}</span><span className="text-white font-medium">{relay.stativ}</span></div>}
            {relay.lastCheck && <div className="flex justify-between"><span className="text-white/40">{t('field.lastCheck')}</span><span className="text-white font-medium">{relay.lastCheck}</span></div>}
            <div className="flex justify-between"><span className="text-white/40">{t('public.check')}</span><span className="text-white font-medium">{relay.nextCheck}</span></div>
            {relay.note && <div className="flex justify-between"><span className="text-white/40">{t('public.checkedBy')}</span><span className="text-white/50 text-xs italic">{relay.note}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
