import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDatasets, fetchOrderLogs, importOrderLogs } from '@/lib/datasetApi';
import { computeCohortMatrix, computeMonthlyStats } from '@/lib/metrics';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Dataset, OrderLog } from '@/types';

type LoadState = 'loading' | 'ready' | 'error';

export function useAnalytics() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [logs, setLogs] = useState<OrderLog[]>([]);
  const [loadState, setLoadState] = useState<LoadState>(isSupabaseConfigured ? 'loading' : 'error');
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured ? null : 'The database connection is not configured for this app.',
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    fetchDatasets()
      .then((list) => {
        if (cancelled) return;
        setDatasets(list);
        setActiveId(list.find((d) => d.source === 'sample')?.id ?? list[0]?.id ?? null);
        if (list.length === 0) setLoadState('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    fetchOrderLogs(activeId)
      .then((rows) => {
        if (cancelled) return;
        setLogs(rows);
        setError(null);
        setLoadState('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const selectDataset = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const importDataset = useCallback(async (name: string, rows: OrderLog[]) => {
    const dataset = await importOrderLogs(name, rows);
    setDatasets((prev) => [...prev, dataset]);
    setActiveId(dataset.id);
    return dataset;
  }, []);

  const monthlyStats = useMemo(() => computeMonthlyStats(logs), [logs]);
  const cohorts = useMemo(() => computeCohortMatrix(logs), [logs]);
  const activeDataset = datasets.find((d) => d.id === activeId) ?? null;

  return {
    datasets,
    activeDataset,
    selectDataset,
    importDataset,
    logs,
    monthlyStats,
    cohorts,
    loadState,
    error,
  };
}
