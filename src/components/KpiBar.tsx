import { Repeat, Scale, Sparkles, Users, Wallet } from 'lucide-react';
import type { MonthlyStat } from '@/types';
import { CAC_ASSUMPTION_KES } from '@/lib/metrics';
import { formatInteger, formatKes, formatPct } from '@/lib/format';
import KpiCard from '@/components/KpiCard';

interface KpiBarProps {
  latest: MonthlyStat | null;
  datasetName: string;
  onOpenInsights: () => void;
}

export default function KpiBar({ latest, datasetName, onOpenInsights }: KpiBarProps) {
  const ratio = latest && latest.ltv > 0 ? latest.cacLtvRatio : null;
  const healthy = ratio !== null && ratio >= 3;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">Executive KPIs</p>
          <p className="truncate text-sm text-slate-300">
            {datasetName} {latest ? `· latest month ${latest.month}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenInsights}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-colors duration-200 hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI Insights
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Monthly active customers"
          value={latest ? formatInteger(latest.activeCustomers) : '--'}
          hint="Customers with a completed order"
          icon={Users}
        />
        <KpiCard
          label="Churn rate"
          value={latest ? formatPct(latest.churnRate) : '--'}
          hint="Share of last month's customers lost"
          icon={Repeat}
          tone={latest && latest.churnRate !== null && latest.churnRate > 10 ? 'bad' : 'neutral'}
        />
        <KpiCard
          label="ARPU"
          value={latest ? formatKes(latest.arpu) : '--'}
          hint="Average revenue per active customer"
          icon={Wallet}
        />
        <KpiCard
          label="LTV : CAC"
          value={ratio !== null ? `${ratio.toFixed(1)}x` : '--'}
          hint={`CAC assumed at ${formatKes(CAC_ASSUMPTION_KES)} per customer`}
          icon={Scale}
          tone={ratio === null ? 'neutral' : healthy ? 'good' : 'bad'}
        />
      </div>
    </header>
  );
}
