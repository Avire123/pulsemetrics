import type { OrderLog } from '@/types';

const REQUIRED_HEADERS = ['customer_id', 'join_date', 'order_date', 'order_value_kes', 'status'] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface CsvParseResult {
  rows: OrderLog[];
  errors: string[];
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseOrderCsv(text: string): CsvParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], errors: ['The file needs a header row and at least one order.'] };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing required column(s): ${missing.join(', ')}.`] };
  }

  const index = Object.fromEntries(REQUIRED_HEADERS.map((h) => [h, headers.indexOf(h)]));
  const rows: OrderLog[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 2;
    const cells = splitCsvLine(line);
    const customerId = cells[index.customer_id] ?? '';
    const joinDate = cells[index.join_date] ?? '';
    const orderDate = cells[index.order_date] ?? '';
    const value = Number(cells[index.order_value_kes]);
    const status = (cells[index.status] ?? '').toLowerCase();

    if (!customerId) errors.push(`Row ${lineNumber}: customer_id is empty.`);
    else if (!DATE_PATTERN.test(joinDate) || !DATE_PATTERN.test(orderDate)) {
      errors.push(`Row ${lineNumber}: dates must use YYYY-MM-DD.`);
    } else if (!Number.isFinite(value) || value < 0) {
      errors.push(`Row ${lineNumber}: order_value_kes must be a non-negative number.`);
    } else if (!status) errors.push(`Row ${lineNumber}: status is empty.`);
    else rows.push({ customerId, joinDate, orderDate, orderValueKes: value, status });
  });

  return { rows, errors };
}
