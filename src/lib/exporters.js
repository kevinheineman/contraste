// Turn the working palette into copy-pasteable artefacts.
import { contrastRatio, evaluate } from './contrast.js';
import { apcaAbs } from './apca.js';

/** Make a CSS-safe token name from a color's display name. */
const slug = (name, i) => {
  const s = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || `color-${i + 1}`;
};

export function toCssVars(palette) {
  const lines = palette.map(
    (c, i) => `  --color-${slug(c.name, i)}: ${c.hex.toLowerCase()};`,
  );
  return `:root {\n${lines.join('\n')}\n}`;
}

export function toTailwind(palette) {
  const entries = palette.map(
    (c, i) => `        '${slug(c.name, i)}': '${c.hex.toLowerCase()}',`,
  );
  return [
    '/** tailwind.config.js */',
    'export default {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
    entries.join('\n'),
    '      },',
    '    },',
    '  },',
    '};',
  ].join('\n');
}

export function toJsonTokens(palette) {
  const color = {};
  palette.forEach((c, i) => {
    color[slug(c.name, i)] = { $type: 'color', $value: c.hex.toLowerCase() };
  });
  return JSON.stringify({ color }, null, 2);
}

/**
 * A machine-readable contrast report — every ordered pair, its ratio, and
 * AA/AAA verdicts. Drop it in CI as a regression guard against a palette
 * change quietly breaking contrast.
 */
export function toReportJson(palette) {
  const pairs = [];
  for (const fg of palette) {
    for (const bg of palette) {
      if (fg.id === bg.id) continue;
      const ratio = contrastRatio(fg.hex, bg.hex);
      const e = evaluate(ratio);
      pairs.push({
        foreground: fg.hex.toLowerCase(),
        background: bg.hex.toLowerCase(),
        ratio: Math.round(ratio * 100) / 100,
        apcaLc: Math.round(apcaAbs(fg.hex, bg.hex)),
        aa: e.aaNormal,
        aaLarge: e.aaLarge,
        aaa: e.aaaNormal,
      });
    }
  }
  return JSON.stringify(
    { generatedBy: 'Contraste', wcag: '2.1', colors: palette.length, pairs },
    null,
    2,
  );
}

export const EXPORTERS = [
  { id: 'css', label: 'CSS variables', fn: toCssVars },
  { id: 'tailwind', label: 'Tailwind', fn: toTailwind },
  { id: 'tokens', label: 'JSON tokens', fn: toJsonTokens },
  { id: 'report', label: 'Contrast report', fn: toReportJson },
];
