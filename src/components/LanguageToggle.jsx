export function LanguageToggle({ lang, onCycle, className = '' }) {
  return (
    <button onClick={onCycle} type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[11px] font-bold text-white/70 transition hover:bg-white/20 hover:text-white ${className}`}
      title="Til / Язык / Language">
      {lang.toUpperCase()}
    </button>
  );
}
