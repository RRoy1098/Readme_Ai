export default function StatCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', ring: 'ring-primary-500/20' },
    accent: { bg: 'bg-accent-500/10', text: 'text-accent-400', ring: 'ring-accent-500/20' },
    success: { bg: 'bg-success-500/10', text: 'text-success-400', ring: 'ring-success-500/20' },
    warning: { bg: 'bg-warning-500/10', text: 'text-warning-400', ring: 'ring-warning-500/20' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`${c.bg} rounded-xl border border-surface-800/60 p-5 ring-1 ${c.ring} transition-all duration-200 hover:border-surface-700/80`}>
      <div className="flex items-center gap-3">
        <div className={`${c.bg} p-2.5 rounded-lg ${c.text}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold ${c.text} mt-0.5`}>{value ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
