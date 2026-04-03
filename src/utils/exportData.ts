import * as XLSX from 'xlsx';
import type { Offer } from '@/types';
import type { Timestamp } from 'firebase/firestore';

/* ── Helpers ──────────────────────────────────────────── */
function formatTimestamp(ts: Timestamp | null): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function toExportRow(offer: Offer) {
  return {
    'GATE Score':     offer.gateScore,
    'GATE Rank':      offer.gateRank,
    'Category':       offer.category,
    'Institute':      offer.institute,
    'Program Type':   offer.programType,
    'Specialization': offer.specialization,
    'COAP Round':     offer.coapRound,
    'Submitted At':   formatTimestamp(offer.timestamp),
  };
}

function buildFilename(
  base:            string,
  filterInstitute: string,
  filterCategory:  string,
  ext:             'csv' | 'xlsx',
): string {
  const parts = [base];
  if (filterInstitute !== 'All') parts.push(filterInstitute.replace(/\s+/g, '-'));
  if (filterCategory  !== 'All') parts.push(filterCategory);
  parts.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  return `${parts.join('_')}.${ext}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href          = url;
  a.download      = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── CSV Export ───────────────────────────────────────── */
export function exportCSV(
  offers:          Offer[],
  filterInstitute: string,
  filterCategory:  string,
): void {
  if (offers.length === 0) return;

  const rows    = offers.map(toExportRow);
  const headers = Object.keys(rows[0]) as (keyof ReturnType<typeof toExportRow>)[];

  const csvLines = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(h => {
          const val = String(row[h] ?? '');
          // Wrap in quotes if value contains commas, quotes, or newlines
          return /[,"\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(',')
    ),
  ];

  const blob = new Blob(
    [csvLines.join('\n')],
    { type: 'text/csv;charset=utf-8;' },
  );

  triggerDownload(
    blob,
    buildFilename('COAP_Offers', filterInstitute, filterCategory, 'csv'),
  );
}

/* ── Excel Export ─────────────────────────────────────── */
export function exportExcel(
  offers:          Offer[],
  filterInstitute: string,
  filterCategory:  string,
): void {
  if (offers.length === 0) return;

  const rows      = offers.map(toExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook  = XLSX.utils.book_new();

  // Auto-size columns based on content width
  const colWidths = Object.keys(rows[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...rows.map(r => String(r[key as keyof typeof r] ?? '').length),
    ) + 2,
  }));
  worksheet['!cols'] = colWidths;

  // Bold header row
  const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddr]) continue;
    worksheet[cellAddr].s = {
      font:      { bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: '0A1020' } },
      alignment: { horizontal: 'center' },
    };
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'COAP Offers');
  XLSX.writeFile(
    workbook,
    buildFilename('COAP_Offers', filterInstitute, filterCategory, 'xlsx'),
  );
}