export default function ToastContainer({ t, toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-2 items-end">
      {toasts.map((toast) => (
        <div key={toast.id} className="glass rounded-xl px-4 py-3 flex items-center gap-4 shadow-lg animate-fade-in max-w-sm">
          <span className="text-sm text-white/80">{toast.message}</span>
          <button onClick={toast.undo}
            className="text-sm font-bold text-amber-400 transition hover:text-amber-300 whitespace-nowrap">
            {t('common.undo')}
          </button>
        </div>
      ))}
    </div>
  );
}
