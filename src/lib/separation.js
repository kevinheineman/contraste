// Distinguishability check — a different question from contrast: can two
// *categorical* colors (chart series, status colors, map regions) still be told
// apart under a color-vision deficiency? Two colors that are clearly different
// in normal vision can collapse to near-identical under, say, deuteranopia.
import { simulate } from './colorblind.js';
import { rgbToOklab, parseHex } from './color.js';

const lab = (hex) => rgbToOklab(parseHex(hex));
const deltaE = (a, b) => Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);

// OKLab distance below which two colors read as "the same" at a glance.
export const CONFUSE = 0.1;

/**
 * Pairs of palette colors that are distinct in normal vision but become
 * confusable under the given CVD type/severity, worst (closest) first.
 */
export function confusablePairs(palette, type, severity = 1) {
  if (!type || type === 'none') return [];
  const out = [];
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const a = palette[i];
      const b = palette[j];
      // Skip colors already similar in normal vision — that isn't a CVD issue.
      if (deltaE(lab(a.hex), lab(b.hex)) < CONFUSE) continue;
      const sim = deltaE(
        lab(simulate(a.hex, type, severity)),
        lab(simulate(b.hex, type, severity)),
      );
      if (sim < CONFUSE) out.push({ a, b, sim });
    }
  }
  return out.sort((x, y) => x.sim - y.sim);
}
