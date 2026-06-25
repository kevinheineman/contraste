// Color parsing, formatting, and color-space conversions.
// Zero dependencies — the math is the point.
//
// Two sRGB linearizations live in this codebase, deliberately:
//   • WCAG relative luminance (contrast.js) uses the WCAG 2.x curve
//     (threshold 0.03928) so our ratios match WebAIM's checker exactly.
//   • OKLab / OKLCH (here) use the sRGB-standard curve (threshold 0.04045).
// They are different formulas for different jobs — see each comment.

/** Clamp a number to [min, max]. */
export const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** Round to a fixed number of decimal places. */
export const round = (n, dp = 0) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/**
 * Parse a hex color (`#rgb`, `#rrggbb`, with or without the leading `#`)
 * into `{ r, g, b }` with channels in 0–255. Returns `null` on bad input.
 */
export function parseHex(input) {
  if (typeof input !== 'string') return null;
  let h = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** True if the string is a parseable hex color. */
export const isValidHex = (input) => parseHex(input) !== null;

/** Format `{ r, g, b }` (0–255) as an uppercase `#RRGGBB` string. */
export function toHex({ r, g, b }) {
  const h = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// ---- sRGB ⇄ linear (sRGB-standard curve, threshold 0.04045) ----

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

/** `{ r, g, b }` 0–255 → linear-light sRGB triplet (0–1). */
function rgbToLinear({ r, g, b }) {
  return [srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255)];
}

/** Linear-light sRGB triplet (0–1) → `{ r, g, b }` 0–255 (gamut-clamped). */
function linearToRgb([lr, lg, lb]) {
  return {
    r: clamp(linearToSrgb(lr)) * 255,
    g: clamp(linearToSrgb(lg)) * 255,
    b: clamp(linearToSrgb(lb)) * 255,
  };
}

// ---- OKLab / OKLCH (Björn Ottosson, 2020) ----
// https://bottosson.github.io/posts/oklab/
// Perceptually uniform — used for the "nearest accessible color" search and
// for describing edits as lightness/chroma changes a human can reason about.

/** `{ r, g, b }` 0–255 → OKLab `{ L, a, b }`. */
export function rgbToOklab(rgb) {
  const [r, g, b] = rgbToLinear(rgb);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** OKLab `{ L, a, b }` → `{ r, g, b }` 0–255 (gamut-clamped). */
export function oklabToRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return linearToRgb([
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]);
}

/** OKLab → OKLCH `{ L, C, h }` (h in degrees, 0–360). */
export function oklabToOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

/** OKLCH → OKLab. */
export function oklchToOklab({ L, C, h }) {
  const rad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

// Convenience round-trips through hex.
export const hexToOklch = (hex) => oklabToOklch(rgbToOklab(parseHex(hex)));
export const oklchToHex = (oklch) => toHex(oklabToRgb(oklchToOklab(oklch)));

/** Perceptual distance between two hex colors (Euclidean in OKLab). */
export function deltaEOk(hexA, hexB) {
  const A = rgbToOklab(parseHex(hexA));
  const B = rgbToOklab(parseHex(hexB));
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
}
