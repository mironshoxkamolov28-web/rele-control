export function StatCard({ label, value, gradient, icon, delay }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${gradient} p-5 ring-1 ring-white/10 transition-all duration-500 hover:ring-white/20 hover:scale-[1.02] hover:shadow-2xl animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/60">{label}</p>
          <span className="text-lg opacity-60">{icon}</span>
        </div>
        <p className="mt-2 text-4xl font-black tracking-tight text-white animate-count-up">{value}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white/30 transition-all duration-1000" style={{ width: `${Math.min(100, (value / 10) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
