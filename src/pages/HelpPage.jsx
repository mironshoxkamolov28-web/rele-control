export default function HelpPage({ t, auth }) {
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-black text-white">{t('help.title')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('help.subtitle')}</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white">{t('help.basics.title')}</h3>
        <p className="text-sm text-white/60">{t('help.basics.status')}</p>
        <p className="text-sm text-white/60">{t('help.basics.search')}</p>
        {auth?.id === 'admin' && <p className="text-sm text-white/60">{t('help.basics.globalSearch')}</p>}
        <p className="text-sm text-white/60">{t('help.basics.unsaved')}</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white">{t('help.relays.title')}</h3>
        {auth?.id === 'admin' && <p className="text-sm text-white/60">{t('help.relays.add')}</p>}
        {auth?.id === 'admin' && <p className="text-sm text-white/60">{t('help.relays.edit')}</p>}
        <p className="text-sm text-white/60">{t('help.relays.qr')}</p>
        <p className="text-sm text-white/60">{t('help.relays.pdf')}</p>
        <p className="text-sm text-white/60">{t('help.relays.csv')}</p>
      </div>

      {auth?.id === 'admin' && (
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white">{t('help.bulk.title')}</h3>
          <p className="text-sm text-white/60">{t('help.bulk.edit')}</p>
          <p className="text-sm text-white/60">{t('help.bulk.import')}</p>
          <p className="text-sm text-white/60">{t('help.bulk.search')}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white">{t('help.delete.title')}</h3>
        <p className="text-sm text-white/60">{t('help.delete.desc')}</p>
      </div>

      {auth?.id === 'admin' && (
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white">{t('help.admin.title')}</h3>
          <p className="text-sm text-white/60">{t('help.admin.stations')}</p>
          <p className="text-sm text-white/60">{t('help.admin.uchastkalar')}</p>
          <p className="text-sm text-white/60">{t('help.admin.mexaniklar')}</p>
          <p className="text-sm text-white/60">{t('help.admin.activityLog')}</p>
        </div>
      )}
    </div>
  );
}
