import type { CohortRow, MonthlyStat } from '@/types';
import { COHORT_MONTHS } from '@/lib/metrics';
import { formatInteger, formatKes, formatPct } from '@/lib/format';

export interface InsightPoint {
  label: string;
  text: string;
}

export interface InsightReport {
  highlights: InsightPoint[];
  bottleneck: InsightPoint[];
  recommendations: InsightPoint[];
}

const average = (values: number[]) =>
  values.length > 0 ? values.reduce((total, value) => total + value, 0) / values.length : null;

function columnAverage(rows: CohortRow[], column: number): number | null {
  return average(rows.map((row) => row.retention[column]).filter((v): v is number => v !== null));
}

export function generateInsights(rows: CohortRow[], stats: MonthlyStat[]): InsightReport | null {
  const averages = Array.from({ length: COHORT_MONTHS }, (_, column) => columnAverage(rows, column));
  if (averages[1] === null || stats.length < 2) return null;

  let steepest = { from: 0, drop: 0 };
  for (let column = 1; column < COHORT_MONTHS; column += 1) {
    const previous = averages[column - 1];
    const current = averages[column];
    if (previous === null || current === null) break;
    if (previous - current > steepest.drop) steepest = { from: column - 1, drop: previous - current };
  }
  const from = steepest.from;

  const lostCustomers = rows.reduce((total, row) => {
    const before = row.retention[from];
    const after = row.retention[from + 1];
    if (before === null || after === null) return total;
    return total + (row.size * (before - after)) / 100;
  }, 0);

  const latest = stats[stats.length - 1];
  const ratio = latest.cacLtvRatio;
  const month3 = averages[3];
  const monthlyLeakage = Math.round(lostCustomers * latest.arpu);
  const arpuBundle = Math.round(latest.arpu * 1.2);
  const tenPercentLift = Math.round(latest.activeCustomers * latest.arpu * 0.1);

  return {
    highlights: [
      {
        label: 'Retention health',
        text:
          `Month 1 retention averages ${formatPct(averages[1])}` +
          (month3 !== null
            ? `, and Month 3 averages ${formatPct(month3)}, a drop of ${(averages[1] - month3).toFixed(1)} points.`
            : '. Month 3 history is not available yet.'),
      },
      {
        label: 'LTV:CAC',
        text:
          `${ratio.toFixed(1)}x against the 3:1 benchmark, ` +
          (ratio >= 3 ? 'which is healthy.' : 'which is below target.'),
      },
      {
        label: 'Churn',
        text: `Monthly churn is ${formatPct(latest.churnRate)} across ${formatInteger(latest.activeCustomers)} active customers.`,
      },
    ],
    bottleneck: [
      {
        label: 'Steepest cliff',
        text:
          `Month ${from} to Month ${from + 1}, where average retention falls ${steepest.drop.toFixed(1)} points ` +
          `(${formatPct(averages[from])} to ${formatPct(averages[from + 1])}).`,
      },
      {
        label: 'Estimated leakage',
        text:
          `About ${formatInteger(Math.round(lostCustomers))} customers drop out at this step, ` +
          `roughly ${formatKes(monthlyLeakage)} of monthly revenue at the current ARPU of ${formatKes(latest.arpu)}.`,
      },
    ],
    recommendations: [
      {
        label: 'Onboarding / Product Action',
        text:
          `Add a guided touchpoint around day 30, such as a reminder and a starter bundle, so customers reach ` +
          `Month ${from + 1} before the cliff.`,
      },
      {
        label: 'Pricing / ARPU Action',
        text:
          `Launch a mid-tier bundle priced near ${formatKes(arpuBundle)} and test an annual-plan discount. ` +
          `A 10% ARPU lift adds about ${formatKes(tenPercentLift)} per month.`,
      },
      {
        label: 'Re-engagement Action',
        text:
          `${formatInteger(latest.churned)} customers churned last month. Send a time-limited win-back offer to ` +
          'customers who bought in the last three months but have not returned in 45 days.',
      },
    ],
  };
}
