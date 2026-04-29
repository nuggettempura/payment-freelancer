import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPayments, type Payment } from '../../libs/api';
import { StatCard, StatusBadge } from '../../components/ui';

export default function Overview() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getPayments(token)
      .then((res) => setPayments(res.payments))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payments.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Derived values — computed from the payments array, no extra state needed
  const completed = payments.filter((p) => p.status === 'completed');
  const pending = payments.filter((p) => p.status === 'pending');

  // Group total amounts by currency so we don't mix USD + EUR into one number
  const totalsByCurrency = completed.reduce<Record<string, number>>((acc, p) => {
    acc[p.currency] = (acc[p.currency] ?? 0) + p.amount;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-sm text-white/50">Your payment activity at a glance</p>

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total payments"
          value={isLoading ? '—' : String(payments.length)}
        />
        <StatCard
          label="Completed"
          value={isLoading ? '—' : String(completed.length)}
          accent="green"
        />
        <StatCard
          label="Pending"
          value={isLoading ? '—' : String(pending.length)}
          accent={pending.length > 0 ? 'yellow' : undefined}
        />
      </div>

      {/* Totals per currency */}
      {!isLoading && Object.entries(totalsByCurrency).length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <StatCard
              key={currency}
              label={`Total ${currency}`}
              value={`${(total / 100).toFixed(2)} ${currency}`}
            />
          ))}
        </div>
      )}

      {/* ── Payment history ─────────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-white mb-4">Recent payments</h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {isLoading && (
          <p className="text-white/40 text-sm">Loading...</p>
        )}

        {!isLoading && payments.length === 0 && (
          <p className="text-white/40 text-sm">No payments yet.</p>
        )}

        {!isLoading && payments.length > 0 && (
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.id} className="text-white/70 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-white/40 max-w-35 truncate">
                      {p.reference}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {(p.amount / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

