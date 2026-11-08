import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { formatInteger, formatKes, formatKesCompact, formatMonth } from '@/lib/format';
import type { MonthlyStat } from '@/types';

interface ExecutiveOverviewProps {
  stats: MonthlyStat[];
}

const axisProps = { stroke: '#64748b', fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
};

export default function ExecutiveOverview({ stats }: ExecutiveOverviewProps) {
  const data = stats.map((s) => ({ ...s, label: formatMonth(s.month) }));

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">LTV and churn trend</h2>
          <p className="text-sm text-slate-400">Lifetime value per customer (KES) against monthly churn (%).</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={16} />
              <YAxis yAxisId="left" {...axisProps} tickFormatter={(v) => formatKesCompact(Number(v))} width={84} />
              <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={(v) => `${v}%`} width={48} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: '#a5b4fc' }}
                formatter={(value, name) =>
                  name === 'Churn rate' ? `${Number(value).toFixed(1)}%` : formatKes(Number(value))
                }
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ltv"
                name="LTV"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="churnRate"
                name="Churn rate"
                stroke="#f472b6"
                strokeWidth={2}
                dot={false}
                connectNulls
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Monthly revenue and active customers</h2>
          <p className="text-sm text-slate-400">Completed-order revenue per month, with the customers who bought.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={16} />
              <YAxis yAxisId="left" {...axisProps} tickFormatter={(v) => formatKesCompact(Number(v))} width={84} />
              <YAxis yAxisId="right" orientation="right" {...axisProps} width={48} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: '#a5b4fc' }}
                cursor={{ fill: '#1e293b' }}
                formatter={(value, name) =>
                  name === 'Revenue' ? formatKes(Number(value)) : formatInteger(Number(value))
                }
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="activeCustomers"
                name="Active customers"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
