import { RELAY_DIFF_FIELDS } from '../relayHelpers.js';

export default function ActivityLogPage({ t, lang, activityLog, activityLogLoading }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-white">{t('nav.activityLog')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('activityLog.subtitle')}</p>
      </div>
      {activityLogLoading ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      ) : activityLog.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <p className="text-sm text-white/40">{t('activityLog.empty')}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden animate-slide-up divide-y divide-white/5">
          {activityLog.map((entry) => {
            const actionColor = entry.action === 'create'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : entry.action === 'delete'
                ? 'text-red-400 bg-red-500/10 border-red-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            let diffChanges = null;
            if (entry.details) {
              try {
                const parsed = JSON.parse(entry.details);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0] && typeof parsed[0] === 'object' && 'field' in parsed[0]) {
                  diffChanges = parsed;
                }
              } catch {}
            }
            return (
              <div key={entry.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${actionColor}`}>
                    {t(`activityLog.action.${entry.action}`)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">
                      <span className="font-semibold">{entry.actor_name}</span>
                      {' — '}{t(`activityLog.entity.${entry.entity_type}`)}: {entry.entity_label}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 flex-shrink-0">
                    {new Date(entry.created_at).toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                  </p>
                </div>
                {diffChanges && (
                  <div className="mt-2 ml-1 space-y-1 border-l-2 border-white/10 pl-3">
                    {diffChanges.map((c, i) => {
                      const labelKey = RELAY_DIFF_FIELDS.find((f) => f.key === c.field)?.labelKey;
                      return (
                        <p key={i} className="text-xs">
                          <span className="text-white/40">{labelKey ? t(labelKey) : c.field}: </span>
                          {'before' in c ? (
                            <>
                              <span className="text-red-400/70 line-through">{c.before || '—'}</span>
                              <span className="text-white/30"> → </span>
                              <span className="text-emerald-400">{c.after || '—'}</span>
                            </>
                          ) : (
                            <span className="text-emerald-400">{c.after || '—'}</span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
