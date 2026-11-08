import { useMemo, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import AppSidebar, { MobileNav, type ViewId } from '@/components/AppSidebar';
import KpiBar from '@/components/KpiBar';
import InsightsDrawer from '@/components/InsightsDrawer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { generateInsights } from '@/lib/insights';
import ExecutiveOverview from '@/views/ExecutiveOverview';
import CohortMatrix from '@/views/CohortMatrix';
import ScenarioSimulator from '@/views/ScenarioSimulator';
import DataImport from '@/views/DataImport';

const VIEW_TITLES: Record<ViewId, string> = {
  overview: 'Executive Overview',
  cohorts: 'Cohort Retention Matrix',
  scenarios: 'Scenario Simulator',
  import: 'Data Import',
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const analytics = useAnalytics();
  const { monthlyStats, cohorts, loadState, error, datasets, activeDataset } = analytics;

  const latest = monthlyStats[monthlyStats.length - 1] ?? null;
  const insights = useMemo(
    () => generateInsights(cohorts.rows, monthlyStats),
    [cohorts.rows, monthlyStats],
  );

  const renderView = () => {
    if (loadState === 'loading') {
      return (
        <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" aria-hidden="true" />
          Loading your data...
        </div>
      );
    }
    if (loadState === 'error' || error) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-100">We could not load your analytics.</p>
          <p className="mt-1 text-sm text-slate-300">{error ?? 'Please try again in a moment.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors duration-200 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload
          </button>
        </div>
      );
    }
    switch (activeView) {
      case 'overview':
        return <ExecutiveOverview stats={monthlyStats} />;
      case 'cohorts':
        return <CohortMatrix rows={cohorts.rows} />;
      case 'scenarios':
        return <ScenarioSimulator stats={monthlyStats} />;
      case 'import':
        return (
          <DataImport
            datasets={datasets}
            activeDatasetId={activeDataset?.id ?? null}
            onSelect={analytics.selectDataset}
            onImport={analytics.importDataset}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AppSidebar activeView={activeView} onSelect={setActiveView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <KpiBar
          latest={latest}
          datasetName={activeDataset?.name ?? 'No dataset selected'}
          onOpenInsights={() => setInsightsOpen(true)}
        />
        <MobileNav activeView={activeView} onSelect={setActiveView} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-100">{VIEW_TITLES[activeView]}</h1>
            {renderView()}
          </div>
        </main>
      </div>
      <InsightsDrawer open={insightsOpen} onClose={() => setInsightsOpen(false)} report={insights} />
    </div>
  );
}
