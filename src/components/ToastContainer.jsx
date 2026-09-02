const TOAST_STYLES = {
  error:   { bar: 'bg-red-500',     icon: '✕', iconBg: 'bg-red-500/20 text-red-400',     text: 'text-red-400' },
  success: { bar: 'bg-emerald-500', icon: '✓', iconBg: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400' },
  info:    { bar: 'bg-cyan-500',    icon: 'ℹ', iconBg: 'bg-cyan-500/20 text-cyan-400',    text: 'text-cyan-400' },
  undo:    { bar: 'bg-amber-500',   icon: '🗑', iconBg: 'bg-amber-500/20 text-amber-400',  text: 'text-amber-400' },
};

export default function ToastContainer({ t, toasts }) {
  return (
    <div className="fixed bottom-24 lg:bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col-reverse gap-2 items-end pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type || 'undo'];
        return (
          <div key={toast.id}
            className="pointer-events-auto glass rounded-xl overflow-hidden shadow-2xl animate-fade-in max-w-sm w-full"
            style={{ minWidth: '260px' }}>
            <div className={`h-0.5 w-full ${style.bar}`} />
            <div className="px-4 py-3 flex items-center gap-3">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${style.iconBg}`}>
                {style.icon}
              </span>
              <span className="flex-1 text-sm text-white/80 leading-snug">{toast.message}</span>
              {toast.undo && (
                <button onClick={toast.undo}
                  className={`text-xs font-bold whitespace-nowrap transition hover:opacity-80 ${style.text}`}>
                  {t('common.undo')}
                </button>
              )}
              {toast.onClose && (
                <button onClick={toast.onClose}
                  className="text-white/30 hover:text-white/60 transition text-xs ml-1">✕</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
