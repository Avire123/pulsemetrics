import type { LucideIcon } from 'lucide-react';
import { Activity, Grid3X3, LayoutDashboard, SlidersHorizontal, UploadCloud } from 'lucide-react';

export type ViewId = 'overview' | 'cohorts' | 'scenarios' | 'import';

export const NAV_ITEMS: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'cohorts', label: 'Cohort Retention', icon: Grid3X3 },
  { id: 'scenarios', label: 'Scenario Simulator', icon: SlidersHorizontal },
  { id: 'import', label: 'Data Import', icon: UploadCloud },
];

interface AppSidebarProps {
  activeView: ViewId;
  onSelect: (view: ViewId) => void;
}

export default function AppSidebar({ activeView, onSelect }: AppSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/80 lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/40 bg-gradient-to-br from-sky-400/15 to-cyan-300/5 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
          <span className="pointer-events-none absolute inset-1 rounded-lg border border-cyan-200/20" />
          <Activity className="relative z-10 h-5 w-5 drop-shadow-[0_0_6px_rgba(103,232,249,0.85)]" aria-hidden="true" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-100">
            Pulse<span className="text-cyan-300">Metrics</span>
          </p>
          <p className="text-[10px] font-medium uppercase text-cyan-100/45">Retention & LTV analytics</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-3" aria-label="Main">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeView;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ activeView, onSelect }: AppSidebarProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-800 px-4 py-3 lg:hidden" aria-label="Main">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeView;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors duration-200 ${
              isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
