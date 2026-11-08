import { getSupabase } from '@/lib/supabase';
import type { Dataset, OrderLog } from '@/types';

const PAGE_SIZE = 1000;
const INSERT_CHUNK_SIZE = 500;

interface DatasetRow {
  id: string;
  name: string;
  source: 'sample' | 'upload';
  created_at: string;
}

interface OrderLogRow {
  customer_id: string;
  join_date: string;
  order_date: string;
  order_value_kes: number | string;
  status: string;
}

const toDataset = (row: DatasetRow): Dataset => ({
  id: row.id,
  name: row.name,
  source: row.source,
  createdAt: row.created_at,
});

export async function fetchDatasets(): Promise<Dataset[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('datasets')
    .select('id, name, source, created_at')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toDataset);
}

export async function fetchOrderLogs(datasetId: string): Promise<OrderLog[]> {
  const supabase = getSupabase();
  const logs: OrderLog[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('order_logs')
      .select('customer_id, join_date, order_date, order_value_kes, status')
      .eq('dataset_id', datasetId)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as OrderLogRow[];
    for (const row of page) {
      logs.push({
        customerId: row.customer_id,
        joinDate: row.join_date,
        orderDate: row.order_date,
        orderValueKes: Number(row.order_value_kes),
        status: row.status,
      });
    }
    if (page.length < PAGE_SIZE) break;
  }
  return logs;
}

export async function importOrderLogs(name: string, logs: OrderLog[]): Promise<Dataset> {
  const supabase = getSupabase();
  const { data: created, error: datasetError } = await supabase
    .from('datasets')
    .insert({ name, source: 'upload' })
    .select('id, name, source, created_at')
    .single();
  if (datasetError || !created) throw new Error(datasetError?.message ?? 'Could not create dataset.');

  const dataset = toDataset(created as DatasetRow);
  for (let start = 0; start < logs.length; start += INSERT_CHUNK_SIZE) {
    const chunk = logs.slice(start, start + INSERT_CHUNK_SIZE).map((log) => ({
      dataset_id: dataset.id,
      customer_id: log.customerId,
      join_date: log.joinDate,
      order_date: log.orderDate,
      order_value_kes: log.orderValueKes,
      status: log.status,
    }));
    const { error } = await supabase.from('order_logs').insert(chunk);
    if (error) throw new Error(error.message);
  }
  return dataset;
}
