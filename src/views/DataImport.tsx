import { useState, type DragEvent } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud, AlertTriangle } from 'lucide-react';
import { parseOrderCsv, type CsvParseResult } from '@/lib/csv';
import { formatInteger } from '@/lib/format';
import type { Dataset, OrderLog } from '@/types';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface DataImportProps {
  datasets: Dataset[];
  activeDatasetId: string | null;
  onSelect: (id: string) => void;
  onImport: (name: string, rows: OrderLog[]) => Promise<Dataset>;
}

type Status = 'idle' | 'importing' | 'done' | 'error';

export default function DataImport({ datasets, activeDatasetId, onSelect, onImport }: DataImportProps) {
  const [preview, setPreview] = useState<(CsvParseResult & { fileName: string }) | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const readFile = async (file: File) => {
    setStatus('idle');
    setMessage(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setStatus('error');
      setMessage('Please choose a .csv file.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus('error');
      setMessage('That file is larger than 5 MB. Split it into smaller files and try again.');
      return;
    }
    const text = await file.text();
    setPreview({ ...parseOrderCsv(text), fileName: file.name });
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void readFile(file);
  };

  const handleImport = async () => {
    if (!preview || preview.rows.length === 0) return;
    setStatus('importing');
    setMessage(null);
    try {
      const name = preview.fileName.replace(/\.csv$/i, '');
      const dataset = await onImport(name, preview.rows);
      setStatus('done');
      setMessage(`Imported ${formatInteger(preview.rows.length)} orders as "${dataset.name}".`);
      setPreview(null);
    } catch (err) {
      setStatus('error');
      setMessage(`The import did not finish: ${(err as Error).message}`);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Import a transaction log</h2>
        <p className="mb-5 text-sm text-slate-400">
          Upload a CSV with the columns customer_id, join_date, order_date, order_value_kes and status. Dates use YYYY-MM-DD.
        </p>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
            dragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/40'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-slate-200">Drag a CSV here, or click to browse</span>
          <span className="text-xs text-slate-400">Up to 5 MB</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
              event.target.value = '';
            }}
          />
        </label>

        {preview && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{preview.fileName}</p>
                  <p className="text-xs text-slate-400">{formatInteger(preview.rows.length)} valid orders ready to import</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleImport}
                disabled={preview.rows.length === 0 || status === 'importing'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {status === 'importing' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {status === 'importing' ? 'Importing...' : 'Import orders'}
              </button>
            </div>
            {preview.errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <p className="mb-1 font-medium">
                  {formatInteger(preview.errors.length)} row(s) will be skipped:
                </p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {preview.errors.slice(0, 5).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {message && (
          <p
            role="status"
            className={`mt-5 flex items-start gap-2 text-sm ${status === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
          >
            {status === 'error' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {message}
          </p>
        )}
      </section>

      <aside className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Datasets</h3>
        <ul className="mt-4 space-y-2">
          {datasets.map((dataset) => {
            const isActive = dataset.id === activeDatasetId;
            return (
              <li key={dataset.id}>
                <button
                  type="button"
                  onClick={() => onSelect(dataset.id)}
                  aria-pressed={isActive}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                    isActive
                      ? 'border-indigo-500/60 bg-indigo-500/10'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-100">{dataset.name}</p>
                  <p className="text-xs text-slate-400">
                    {dataset.source === 'sample' ? 'Built-in sample' : 'Uploaded log'}
                    {isActive ? ' · showing now' : ''}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
