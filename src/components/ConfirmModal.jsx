export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-scale-in glass rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-white/50 mt-2">{message}</p>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onCancel}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/20">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
