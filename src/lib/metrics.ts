import type {
  CohortRow,
  MonthlyStat,
  OrderLog,
  ScenarioBase,
  ScenarioInputs,
  ScenarioResult,
} from '@/types';

export const GROSS_MARGIN = 0.6;
export const CAC_ASSUMPTION_KES = 1200;
export const COHORT_MONTHS = 12;
const LTV_CHURN_FLOOR = 0.02;
const TRAILING_MONTHS = 6;
const PROJECTION_MONTHS = 12;

const monthOf = (iso: string) => iso.slice(0, 7);

const NON_REVENUE_STATUSES = new Set(['refunded', 'failed', 'cancelled', 'canceled', 'returned']);
const countsAsOrder = (status: string) => !NON_REVENUE_STATUSES.has(status.toLowerCase());

function addMonths(key: string, n: number): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + n, 1)).toISOString().slice(0, 7);
}

function monthRange(start: string, end: string): string[] {
  const months: string[] = [];
  for (let key = start; key <= end; key = addMonths(key, 1)) months.push(key);
  return months;
}

function buildActivity(logs: OrderLog[]) {
  const completed = logs.filter((log) => countsAsOrder(log.status));
  const activeByMonth = new Map<string, Set<string>>();
  const revenueByMonth = new Map<string, number>();
  const cohortByCustomer = new Map<string, string>();

  for (const log of logs) {
    const joinMonth = monthOf(log.joinDate);
    const existing = cohortByCustomer.get(log.customerId);
    if (!existing || joinMonth < existing) cohortByCustomer.set(log.customerId, joinMonth);
  }

  for (const log of completed) {
    const month = monthOf(log.orderDate);
    if (!activeByMonth.has(month)) activeByMonth.set(month, new Set());
    activeByMonth.get(month)!.add(log.customerId);
    revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + log.orderValueKes);
  }

  return { completed, activeByMonth, revenueByMonth, cohortByCustomer };
}

export function computeMonthlyStats(logs: OrderLog[]): MonthlyStat[] {
  const { completed, activeByMonth, revenueByMonth, cohortByCustomer } = buildActivity(logs);
  if (completed.length === 0) return [];

  const orderMonths = completed.map((log) => monthOf(log.orderDate)).sort();
  const months = monthRange(orderMonths[0], orderMonths[orderMonths.length - 1]);

  const newByMonth = new Map<string, number>();
  for (const cohort of cohortByCustomer.values()) {
    newByMonth.set(cohort, (newByMonth.get(cohort) ?? 0) + 1);
  }

  const rows = months.map((month, index) => {
    const current = activeByMonth.get(month) ?? new Set<string>();
    const previous = index > 0 ? activeByMonth.get(months[index - 1]) ?? new Set<string>() : null;
    let churned = 0;
    if (previous) {
      for (const id of previous) if (!current.has(id)) churned += 1;
    }
    const churnRate = previous && previous.size > 0 ? (churned / previous.size) * 100 : null;
    const revenue = revenueByMonth.get(month) ?? 0;
    const arpu = current.size > 0 ? revenue / current.size : 0;
    return {
      month,
      activeCustomers: current.size,
      newCustomers: newByMonth.get(month) ?? 0,
      churned,
      churnRate,
      revenue,
      arpu,
      ltv: 0,
      cacLtvRatio: 0,
    };
  });

  return rows.map((row, index) => {
    const recentChurn = rows
      .slice(Math.max(0, index - TRAILING_MONTHS + 1), index + 1)
      .map((r) => r.churnRate)
      .filter((value): value is number => value !== null);
    const avgChurn = recentChurn.length > 0 ? recentChurn.reduce((a, b) => a + b, 0) / recentChurn.length / 100 : 0;
    const ltv = row.arpu * GROSS_MARGIN / Math.max(avgChurn, LTV_CHURN_FLOOR);
    return {
      ...row,
      ltv: Math.round(ltv),
      cacLtvRatio: ltv / CAC_ASSUMPTION_KES,
    };
  });
}

export function computeCohortMatrix(logs: OrderLog[]): { rows: CohortRow[]; lastMonth: string | null } {
  const { completed, activeByMonth, cohortByCustomer } = buildActivity(logs);
  if (completed.length === 0) return { rows: [], lastMonth: null };

  const orderMonths = completed.map((log) => monthOf(log.orderDate)).sort();
  const lastMonth = orderMonths[orderMonths.length - 1];

  const membersByCohort = new Map<string, string[]>();
  for (const [customerId, cohort] of cohortByCustomer) {
    if (!membersByCohort.has(cohort)) membersByCohort.set(cohort, []);
    membersByCohort.get(cohort)!.push(customerId);
  }

  const rows = [...membersByCohort.keys()].sort().map((cohort) => {
    const members = membersByCohort.get(cohort)!;
    const retention = Array.from({ length: COHORT_MONTHS }, (_, offset) => {
      const month = addMonths(cohort, offset);
      if (month > lastMonth) return null;
      const active = activeByMonth.get(month);
      const retained = members.filter((id) => active?.has(id)).length;
      return (retained / members.length) * 100;
    });
    return { cohort, size: members.length, retention };
  });

  return { rows, lastMonth };
}

export function buildScenarioBase(stats: MonthlyStat[]): ScenarioBase | null {
  const recent = stats.slice(-TRAILING_MONTHS);
  const last = stats[stats.length - 1];
  if (!last) return null;
  const churnValues = recent.map((s) => s.churnRate).filter((v): v is number => v !== null);
  const arpuValues = recent.map((s) => s.arpu).filter((v) => v > 0);
  const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
  return {
    startCustomers: last.activeCustomers,
    churn: avg(churnValues) / 100,
    newPerMonth: avg(recent.map((s) => s.newCustomers)),
    arpu: avg(arpuValues),
  };
}

export function projectScenario(base: ScenarioBase, inputs: ScenarioInputs): ScenarioResult {
  const projectedChurn = base.churn * (1 - inputs.churnReductionPct / 100);
  const projectedArpu = base.arpu * (1 + inputs.arpuIncreasePct / 100);

  let baselineActive = base.startCustomers;
  let projectedActive = base.startCustomers;
  const series = Array.from({ length: PROJECTION_MONTHS }, (_, index) => {
    baselineActive = baselineActive * (1 - base.churn) + base.newPerMonth;
    projectedActive = projectedActive * (1 - projectedChurn) + base.newPerMonth;
    return {
      month: index + 1,
      baselineRevenue: baselineActive * base.arpu,
      projectedRevenue: projectedActive * projectedArpu,
      projectedActive,
    };
  });

  const sum = (points: typeof series, count: number, key: 'baselineRevenue' | 'projectedRevenue') =>
    points.slice(0, count).reduce((total, point) => total + point[key], 0);

  return {
    baselineRevenue6: sum(series, 6, 'baselineRevenue'),
    projectedRevenue6: sum(series, 6, 'projectedRevenue'),
    baselineRevenue12: sum(series, 12, 'baselineRevenue'),
    projectedRevenue12: sum(series, 12, 'projectedRevenue'),
    projectedChurn,
    projectedArpu,
    series,
  };
}
