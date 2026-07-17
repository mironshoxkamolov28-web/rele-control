import { LANGS, translations } from './i18n.js';

export const ADMIN_AUTH_EMAIL = 'admin@relenazorat.local';

export function getPublicUrl() {
  try { return localStorage.getItem('rc_public_url') || window.location.origin; } catch { return window.location.origin; }
}

export function qrUrl(relay) {
  return `${getPublicUrl()}/relay/${relay.id}`;
}

export async function registerPdfFont(doc) {
  const { ROBOTO_REGULAR_BASE64, ROBOTO_BOLD_BASE64 } = await import('./fonts/robotoFont.js');
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD_BASE64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto', 'normal');
}

export function normalizeRelayName(name) {
  return (name || '').replace(/\s+/g, '').toUpperCase();
}

export function getRelayStatusFromDate(dateString) {
  if (!dateString) return 'green';
  const now = new Date();
  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return 'green';
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'red';
  if (diffDays <= 30) return 'yellow';
  return 'green';
}

export const statusConfig = {
  red: { color: 'red', lightBg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400', bar: 'bg-red-500/20', barFill: 'bg-red-500' },
  yellow: { color: 'yellow', lightBg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400', bar: 'bg-yellow-500/20', barFill: 'bg-yellow-500' },
  green: { color: 'green', lightBg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', bar: 'bg-emerald-500/20', barFill: 'bg-emerald-500' },
};

export function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = ''; rows.push(row); row = [];
    } else if (c === '\r') {
      // ignore — paired \n handles the line break
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['﻿' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const CSV_FIELD_I18N_KEYS = {
  'field.name': 'name',
  'field.factoryNum': 'num',
  'common.station': 'station',
  'field.stativNum': 'stativ',
  'field.lastCheck': 'lastCheck',
  'field.nextCheck': 'nextCheck',
  'field.checkedBy': 'note',
};

export const CSV_HEADER_TO_FIELD = {};
for (const lang of LANGS) {
  for (const [i18nKey, fieldKey] of Object.entries(CSV_FIELD_I18N_KEYS)) {
    const label = translations[lang]?.[i18nKey];
    if (typeof label === 'string') CSV_HEADER_TO_FIELD[label.trim().toLowerCase()] = fieldKey;
  }
}

export const navItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'relays', labelKey: 'nav.relays', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    children: [{ id: 'add-relay', labelKey: 'nav.addRelay' }, { id: 'monthly-plan', labelKey: 'nav.monthlyPlan' }] },
  { id: 'stations', labelKey: 'nav.stations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', adminOnly: true,
    children: [{ id: 'add-station', labelKey: 'nav.addStation' }] },
  { id: 'uchastkalar', labelKey: 'nav.uchastkalar', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', adminOnly: true,
    children: [{ id: 'add-uchastka', labelKey: 'nav.addUchastka' }] },
  { id: 'mexaniklar', labelKey: 'nav.mexaniklar', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', adminOnly: true,
    children: [{ id: 'add-mexanik', labelKey: 'nav.addMexanik' }] },
  { id: 'activity-log', labelKey: 'nav.activityLog', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', adminOnly: true },
  { id: 'settings', labelKey: 'nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', adminOnly: true },
  { id: 'help', labelKey: 'nav.help', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];
