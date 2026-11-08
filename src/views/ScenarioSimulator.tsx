import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { buildScenarioBase, projectScenario } from '@/lib/metrics';
import { formatKes, formatKesCompact, formatInteger, formatPct } from '@/lib/format';
import type { MonthlyStat, ScenarioInputs } from '@/types';

interface ScenarioSimulatorProps {
  stats: MonthlyStat[];
}

interface SliderProps {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}

function Slider({ label, hint, value, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        <span className="text-lg font-semibold tabular-nums text-indigo-300">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={50}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-indigo-500"
      />
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function ImpactCard({ label, baseline, projected }: { label: string; baseline: number; projected: number }) {
  const delta = projected - baseline;
  const positive = delta >= 0;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-100">{formatKes(projected)}</p>
      <p className="mt-1 text-xs text-slate-400">Baseline {formatKes(baseline)}</p>
      <p className={`mt-3 text-sm font-medium tabular-nums ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>
        {positive ? '+' : '-'}
        {formatKes(Math.abs(delta))} projected change
      </p>
    </div>
  );
}

export default function ScenarioSimulator({ stats }: ScenarioSimulatorProps) {
  const [inputs, setInputs] = useState<ScenarioInputs>({ churnReductionPct: 0, arpuIncreasePct: 0 });
  const base = useMemo(() => buildScenarioBase(stats), [stats]);
  const result = useMemo(() => (base ? projectScenario(base, inputs) : null), [base, inputs]);

  if (!base || !result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
        The simulator needs at least one month of completed orders to project from.
      </div>
    );
  }

  const chartData = result.series.map((point) => ({
    name: `M+${point.month}`,
    Baseline: Math.round(point.baselineRevenue),
    Projected: Math.round(point.projectedRevenue),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Scenario levers</h2>
        <p className="mb-6 text-sm text-slate-400">Move the sliders to see the revenue impact over the next 12 months.</p>
        <div className="space-y-8">
          <Slider
            label="Reduce monthly churn by"
            hint={`Churn moves from ${formatPct(base.churn * 100)} to ${formatPct(result.projectedChurn * 100)} per month.`}
            value={inputs.churnReductionPct}
            onChange={(churnReductionPct) => setInputs((prev) => ({ ...prev, churnReductionPct }))}
          />
          <Slider
            label="Increase monthly ARPU by"
            hint={`ARPU moves from ${formatKes(base.arpu)} to ${formatKes(result.projectedArpu)} per customer.`}
            value={inputs.arpuIncreasePct}
            onChange={(arpuIncreasePct) => setInputs((prev) => ({ ...prev, arpuIncreasePct }))}
          />
        </div>
        <button
          type="button"
          onClick={() => setInputs({ churnReductionPct: 0, arpuIncreasePct: 0 })}
          className="mt-8 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-slate-100"
        >
          Reset to current trend
        </button>
      </section>

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <ImpactCard
            label="Projected revenue, 6 months"
            baseline={result.baselineRevenue6}
            projected={result.projectedRevenue6}
          />
          <ImpactCard
            label="Projected revenue, 12 months"
            baseline={result.baselineRevenue12}
            projected={result.projectedRevenue12}
          />
        </div>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Monthly revenue projection</h2>
              <p className="text-sm text-slate-400">
                Starting from {formatInteger(base.startCustomers)} active customers, adding about{' '}
                {formatInteger(Math.round(base.newPerMonth))} new per month.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="projectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={84}
                  tickFormatter={(v) => formatKesCompact(Number(v))}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                  formatter={(value) => formatKes(Number(value))}
                />
                <Area type="monotone" dataKey="Baseline" stroke="#64748b" strokeWidth={2} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="Projected" stroke="#818cf8" strokeWidth={2.5} fill="url(#projectedFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
