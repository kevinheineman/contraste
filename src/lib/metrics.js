// A small abstraction over the two contrast algorithms (WCAG 2.1 ratio and
// APCA Lc) so the matrix, inspector, and exports don't branch on the algorithm
// everywhere. Each "level" carries its own pass test against the right metric.
import { contrastRatio } from './contrast.js';
import { apcaAbs } from './apca.js';

export const ALGORITHMS = [
  { id: 'wcag', label: 'WCAG 2.1' },
  { id: 'apca', label: 'APCA (preview)' },
];

export const DEFAULT_LEVEL = { wcag: 'aaNormal', apca: 'lc75' };

// Every level, keyed by id. `test` runs against the algorithm's own metric
// (a WCAG ratio, or an APCA |Lc|), so a level is self-describing.
const L = {
  aaNormal: { id: 'aaNormal', label: 'AA · Normal text', short: 'AA normal', req: '4.5:1', test: (r) => r >= 4.5 },
  aaLarge: { id: 'aaLarge', label: 'AA · Large text', short: 'AA large', req: '3:1', test: (r) => r >= 3 },
  aaaNormal: { id: 'aaaNormal', label: 'AAA · Normal text', short: 'AAA normal', req: '7:1', test: (r) => r >= 7 },
  aaaLarge: { id: 'aaaLarge', label: 'AAA · Large text', short: 'AAA large', req: '4.5:1', test: (r) => r >= 4.5 },
  ui: { id: 'ui', label: 'UI & graphics', short: 'UI & graphics', req: '3:1', test: (r) => r >= 3 },
  // Section 508 incorporates WCAG 2.0 AA by reference, so its contrast bar is AA (4.5:1).
  p508: { id: 'p508', label: 'Section 508 · WCAG 2.0 AA', short: 'Section 508', req: '4.5:1', test: (r) => r >= 4.5 },
  lc90: { id: 'lc90', label: 'Lc 90 · fluent text', short: 'Lc 90', req: 'Lc 90', test: (v) => v >= 90 },
  lc75: { id: 'lc75', label: 'Lc 75 · body text', short: 'Lc 75', req: 'Lc 75', test: (v) => v >= 75 },
  lc60: { id: 'lc60', label: 'Lc 60 · content', short: 'Lc 60', req: 'Lc 60', test: (v) => v >= 60 },
  lc45: { id: 'lc45', label: 'Lc 45 · large text', short: 'Lc 45', req: 'Lc 45', test: (v) => v >= 45 },
  lc30: { id: 'lc30', label: 'Lc 30 · non-text', short: 'Lc 30', req: 'Lc 30', test: (v) => v >= 30 },
};

// Levels offered in the "pass level" picker (the useful few).
export const LEVELS = {
  wcag: [L.aaNormal, L.aaLarge, L.aaaNormal, L.ui, L.p508],
  apca: [L.lc90, L.lc75, L.lc60, L.lc45, L.lc30],
};

// Fuller list shown in the inspector checklist.
export const CRITERIA = {
  wcag: [L.aaNormal, L.aaLarge, L.aaaNormal, L.aaaLarge, L.ui, L.p508],
  apca: [L.lc90, L.lc75, L.lc60, L.lc45, L.lc30],
};

/** The metric value for `fg` text on `bg` under an algorithm. */
export function metricValue(algorithm, fgHex, bgHex) {
  return algorithm === 'apca'
    ? apcaAbs(fgHex, bgHex)
    : contrastRatio(fgHex, bgHex);
}

/** Compact value for a matrix cell (a ratio like `4.54`, or an Lc like `78`). */
export function cellValue(algorithm, value) {
  if (value == null) return '—';
  return algorithm === 'apca' ? String(Math.round(value)) : value.toFixed(2);
}

/** Full label for the inspector (`4.54:1` or `Lc 78`). */
export function formatMetric(algorithm, value) {
  if (value == null) return '—';
  return algorithm === 'apca' ? `Lc ${Math.round(value)}` : `${value.toFixed(2)}:1`;
}

export const findLevel = (id) => L[id];

/** Does `value` clear the level `levelId`? (value must match the level's algorithm.) */
export function passesLevel(value, levelId) {
  const lv = L[levelId];
  return value != null && lv ? lv.test(value) : false;
}
