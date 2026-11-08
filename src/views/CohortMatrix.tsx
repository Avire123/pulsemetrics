import { useState } from 'react';
import type { CohortRow } from '@/types';
import { COHORT_MONTHS } from '@/lib/metrics';
import { formatMonth, formatPct } from '@/lib/format';

interface CohortMatrixProps {
  rows: CohortRow[];
}

interface HoverCell {
  rowIndex: number;
  column: number;
}

export function retentionColor(pct: number | null): string {
  if (pct === null) return 'transparent';
  const hue = Math.max(0, Math.min(120, pct * 1.2));
  return `hsl(${hue.toFixed(0)} 62% 38%)`;
}

export default function CohortMatrix({ rows }: CohortMatrixProps) {
  const [hover, setHover] = useState<HoverCell | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
        No completed orders in this dataset yet, so there are no cohorts to show.
      </div>
    );
  }

  const active = hover ? rows[hover.rowIndex] : null;
  const activeValue = active && hover ? active.retention[hover.column] : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
      <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Cohort retention matrix</h2>
          <p className="text-sm text-slate-400">
            Share of each sign-up month's customers who placed a completed order in later months.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs" onMouseLeave={() => setHover(null)}>
            <thead>
              <tr>
                <th className="sticky left-0 bg-slate-900 px-2 py-1 text-left font-medium text-slate-400">Cohort</th>
                <th className="px-2 py-1 text-right font-medium text-slate-400">Size</th>
                {Array.from({ length: COHORT_MONTHS }, (_, i) => (
                  <th key={i} className="px-1 py-1 text-center font-medium text-slate-400">
                    M{i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.cohort}>
                  <th className="sticky left-0 bg-slate-900 px-2 py-1 text-left font-medium text-slate-200">
                    {formatMonth(row.cohort)}
                  </th>
                  <td className="px-2 py-1 text-right tabular-nums text-slate-300">{row.size}</td>
                  {row.retention.map((pct, column) => {
                    const isHovered = hover?.rowIndex === rowIndex && hover?.column === column;
                    return (
                      <td
                        key={column}
                        onMouseEnter={() => setHover({ rowIndex, column })}
                        className="p-0"
                      >
                        <div
                          className={`flex h-9 min-w-[48px] items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-transform duration-150 ${
                            pct === null ? 'bg-slate-800/50 text-slate-600' : 'text-white'
                          } ${isHovered ? 'scale-110 ring-2 ring-white/80' : ''}`}
                          style={pct === null ? undefined : { backgroundColor: retentionColor(pct) }}
                        >
                          {pct === null ? '-' : `${Math.round(pct)}%`}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
          <span>Low</span>
          <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />
          <span>High</span>
        </div>
      </section>

      <aside className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cell detail</h3>
        {active && hover ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">Cohort</p>
              <p className="text-lg font-semibold text-slate-100">{formatMonth(active.cohort)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Month {hover.column} retention</p>
              <p className="text-3xl font-semibold tabular-nums text-slate-100">
                {formatPct(activeValue, 1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Customers in cohort</p>
              <p className="text-lg font-semibold tabular-nums text-slate-100">{active.size}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">Hover over a cell to see its retention and cohort size.</p>
        )}
      </aside>
    </div>
  );
}
