const kesFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const formatKes = (value: number) => kesFormatter.format(value);
export const formatKesCompact = (value: number) => `KES ${compactFormatter.format(value)}`;
export const formatInteger = (value: number) => integerFormatter.format(value);
export const formatPct = (value: number | null, digits = 1) =>
  value === null ? 'n/a' : `${value.toFixed(digits)}%`;

export function formatMonth(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}
