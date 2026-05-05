'use strict';

// Display: number/string → "1.234,56 €"  (Greek locale, non-breaking space before €)
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// Parse: "1.234,56" → 1234.56  (removes Greek thousand separator, swaps decimal comma)
function parseMoney(str) {
  if (!str || str.trim() === '') return null;
  const normalized = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
}

// "2026-05-05" → "05/05/2026"
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// "05/05/2026" → "2026-05-05"
function parseDate(displayDate) {
  if (!displayDate || !displayDate.includes('/')) return null;
  const parts = displayDate.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

// "2026-05-05" → "Τρίτη, 5 Νοε"  (Greek weekday + day + short month)
function formatDateHeader(isoDate) {
  // Append T00:00:00 to prevent timezone offset shifting the day
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'short' });
}

// Instant string (ISO-8601) → "05/11/2026, 19:42"
function formatInstant(instantStr) {
  if (!instantStr) return '';
  const date = new Date(instantStr);
  return date.toLocaleString('el-GR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// year=2026, month=5 → "Μάι 2026"
function formatMonthLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('el-GR', { month: 'short', year: 'numeric' });
}

// "2026-05-05" → "5 Νοε"  (day + short month, no weekday — used in drill-in transaction rows)
function formatShortDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
}

// Today's date as ISO string "2026-05-05"
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
