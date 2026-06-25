// Suggest the nearest accessible color: hold one color fixed and slide the
// other's OKLCH lightness (keeping hue & chroma where the gamut allows) until
// the pair clears a target WCAG ratio, choosing the smallest visible change.
import { hexToOklch, oklchToHex, deltaEOk } from './color.js';
import { contrastRatio } from './contrast.js';

const STEPS = 240;

/**
 * @param {string} adjustHex  the color we're allowed to change
 * @param {string} fixedHex   the color that stays put
 * @param {number} target     target contrast ratio (e.g. 4.5 for AA text)
 * @returns {{hex,ratio,deltaE,lightnessFrom,lightnessTo,met}|null}
 */
export function suggestAccessible(adjustHex, fixedHex, target) {
  const start = hexToOklch(adjustHex);

  let best = null; // smallest-change color that MEETS the target
  let reach = null; // best we can do if the target is unreachable

  for (let i = 0; i <= STEPS; i++) {
    const L = i / STEPS;
    // Hold hue & chroma; let the gamut clamp at the extremes (→ near black/white).
    const hex = oklchToHex({ L, C: start.C, h: start.h });
    const ratio = contrastRatio(hex, fixedHex);

    if (!reach || ratio > reach.ratio) reach = { hex, ratio, L };

    if (ratio >= target) {
      const change = Math.abs(L - start.L);
      if (!best || change < best.change) best = { hex, ratio, L, change };
    }
  }

  const chosen = best || reach;
  if (!chosen) return null;
  return {
    hex: chosen.hex,
    ratio: chosen.ratio,
    deltaE: deltaEOk(adjustHex, chosen.hex),
    lightnessFrom: start.L,
    lightnessTo: chosen.L,
    met: chosen.ratio >= target,
  };
}
