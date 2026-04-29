// Shared, reusable UI primitives used across dashboard pages.

type Accent = 'green' | 'yellow' | undefined;

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: Accent;
}) {
  const valueColor =
    accent === 'green'  ? 'text-green-400'  :
    accent === 'yellow' ? 'text-yellow-400' :
    'text-white';

  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-5">
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    failed:    'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const cls = styles[status] ?? 'bg-white/5 text-white/50 border-white/10';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}
