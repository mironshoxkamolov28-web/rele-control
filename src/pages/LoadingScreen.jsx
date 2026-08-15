export default function LoadingScreen({ t }) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="text-sm text-white/40">{t('common.loading')}</p>
      </div>
    </div>
  );
}
