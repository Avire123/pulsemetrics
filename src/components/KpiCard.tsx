import type { LucideIcon } from 'lucide-react';

type Tone = 'neutral' | 'good' | 'bad';

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'text-indigo-300 bg-indigo-500/15',
  good: 'text-emerald-300 bg-emerald-500/15',
  bad: 'text-rose-300 bg-rose-500/15',
};

export default function KpiCard({ label, value, hint, icon: Icon, tone = 'neutral' }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
