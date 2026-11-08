import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { InsightPoint, InsightReport } from '@/lib/insights';

interface InsightsDrawerProps {
  open: boolean;
  onClose: () => void;
  report: InsightReport | null;
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-sky-300">{title}</h3>
      {children}
    </section>
  );
}

function PointList({ points }: { points: InsightPoint[] }) {
  return (
    <ul className="space-y-3">
      {points.map((point) => (
        <li key={point.label} className="rounded-lg border border-sky-400/15 bg-black/50 p-3 text-sm leading-relaxed text-slate-300 shadow-[0_0_18px_rgba(56,189,248,0.04)]">
          <span className="font-semibold text-slate-100">{point.label}: </span>
          {point.text}
        </li>
      ))}
    </ul>
  );
}

export default function InsightsDrawer({ open, onClose, report }: InsightsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="AI Insights"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-sky-400/20 bg-[#05090e] shadow-[-18px_0_60px_rgba(0,0,0,0.55),0_0_32px_rgba(14,165,233,0.08)] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-sky-400/15 bg-black/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300/20 bg-sky-400/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.12)]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-slate-100">AI Insights</p>
              <p className="text-xs text-sky-100/45">Executive strategy report</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close insights"
            className="rounded-lg p-2 text-slate-400 transition-colors duration-200 hover:bg-sky-400/10 hover:text-sky-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          {report ? (
            <>
              <ReportSection title="Critical Retention & Revenue Highlights">
                <PointList points={report.highlights} />
              </ReportSection>
              <ReportSection title="Key Cohort Bottleneck">
                <PointList points={report.bottleneck} />
              </ReportSection>
              <ReportSection title="3-Step Strategic Recommendations">
                <ol className="space-y-3">
                  {report.recommendations.map((point, index) => (
                    <li key={point.label} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-xs font-semibold text-sky-200 ring-1 ring-sky-300/30 shadow-[0_0_14px_rgba(56,189,248,0.12)]">
                        {index + 1}
                      </span>
                      <span>
                        <span className="font-semibold text-slate-100">{point.label}: </span>
                        {point.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </ReportSection>
            </>
          ) : (
            <p className="rounded-lg border border-sky-400/15 bg-black/40 p-4 text-sm text-slate-400">
              Import or select a dataset with at least two months of completed orders to generate the report.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
