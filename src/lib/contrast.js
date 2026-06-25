// WCAG 2.x relative luminance and contrast ratio.
//
// Uses the WCAG 2.1 sRGB linearization (threshold 0.03928) so results match
// WebAIM's Contrast Checker and the WCAG "Understanding 1.4.3" reference to
// the decimal. See https://www.w3.org/WAI/WCAG21/Techniques/general/G18
import { parseHex } from './color.js';

const channelLuminance = (c8) => {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0–1) of `{ r, g, b }` 0–255. */
export function relativeLuminance({ r, g, b }) {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/**
 * WCAG contrast ratio between two hex colors. Range 1 (identical) to 21
 * (black vs white). Order-independent. Returns `null` if either is invalid.
 */
export function contrastRatio(hexA, hexB) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  if (!a || !b) return null;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.x success-criteria thresholds.
export const THRESHOLDS = {
  aaNormal: 4.5, // 1.4.3 — normal text
  aaLarge: 3.0, // 1.4.3 — large text (≥24px, or ≥18.66px bold)
  aaaNormal: 7.0, // 1.4.6 — normal text (enhanced)
  aaaLarge: 4.5, // 1.4.6 — large text (enhanced)
  ui: 3.0, // 1.4.11 — UI components & graphical objects
};

/** Evaluate a ratio against every WCAG threshold. */
export function evaluate(ratio) {
  if (ratio == null) return null;
  return {
    ratio,
    aaNormal: ratio >= THRESHOLDS.aaNormal,
    aaLarge: ratio >= THRESHOLDS.aaLarge,
    aaaNormal: ratio >= THRESHOLDS.aaaNormal,
    aaaLarge: ratio >= THRESHOLDS.aaaLarge,
    ui: ratio >= THRESHOLDS.ui,
  };
}

/** Evaluate straight from two hex colors. */
export const evaluatePair = (hexA, hexB) => evaluate(contrastRatio(hexA, hexB));

/** Format a ratio like `4.54:1`. */
export const formatRatio = (ratio) =>
  ratio == null ? '—' : `${(Math.round(ratio * 100) / 100).toFixed(2)}:1`;

/** Pick black or white — whichever has higher contrast on the given color. */
export function bestTextOn(hex) {
  const onBlack = contrastRatio(hex, '#000000');
  const onWhite = contrastRatio(hex, '#FFFFFF');
  return onWhite >= onBlack ? '#FFFFFF' : '#000000';
}
