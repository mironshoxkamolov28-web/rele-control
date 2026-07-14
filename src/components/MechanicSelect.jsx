export function MechanicSelect({ mexaniklar, value, onChange, t }) {
  const knownNames = mexaniklar.map((m) => m.name);
  const selected = value
    ? value.split(',').map((s) => s.trim()).filter((s) => knownNames.includes(s))
    : [];
  const toggle = (name) => {
    const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name];
    onChange(next.join(', '));
  };
  if (mexaniklar.length === 0) {
    return <p className="text-xs text-white/30 rounded-xl border border-white/10 bg-white/5 px-4 py-3">{t('mexaniklar.empty')}</p>;
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {mexaniklar.map((m) => {
          const isSelected = selected.includes(m.name);
          return (
            <button key={m.id} type="button" onClick={() => toggle(m.name)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}>
              {m.name}
            </button>
          );
        })}
      </div>
      {value && (
        <button type="button" onClick={() => onChange('')}
          className="mt-2 text-[11px] font-medium text-white/30 transition hover:text-red-400">
          {t('common.clear')}
        </button>
      )}
    </div>
  );
}
