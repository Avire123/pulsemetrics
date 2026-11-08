export type OrderStatus = 'completed' | 'refunded' | 'failed' | string;

export interface OrderLog {
  customerId: string;
  joinDate: string;
  orderDate: string;
  orderValueKes: number;
  status: OrderStatus;
}

export interface Dataset {
  id: string;
  name: string;
  source: 'sample' | 'upload';
  createdAt: string;
}

export interface MonthlyStat {
  month: string;
  activeCustomers: number;
  newCustomers: number;
  churned: number;
  churnRate: number | null;
  revenue: number;
  arpu: number;
  ltv: number;
  cacLtvRatio: number;
}

export interface CohortRow {
  cohort: string;
  size: number;
  retention: (number | null)[];
}

export interface ScenarioInputs {
  churnReductionPct: number;
  arpuIncreasePct: number;
}

export interface ScenarioPoint {
  month: number;
  baselineRevenue: number;
  projectedRevenue: number;
  projectedActive: number;
}

export interface ScenarioResult {
  baselineRevenue6: number;
  projectedRevenue6: number;
  baselineRevenue12: number;
  projectedRevenue12: number;
  projectedChurn: number;
  projectedArpu: number;
  series: ScenarioPoint[];
}

export interface ScenarioBase {
  startCustomers: number;
  churn: number;
  newPerMonth: number;
  arpu: number;
}
