// Color-vision-deficiency simulation with adjustable severity, plus a grayscale
// (achromatopsia) mode.
//
// Dichromacy endpoints use the matrices of Viénot, Brettel & Mollon (1999),
// applied in linear-light sRGB. Severity (0–1) blends from normal vision toward
// that full dichromacy — exact at both ends, an approximation in between (it is
// not a per-severity physiological model like Machado 2009). Most color-blind
// people are anomalous trichromats (partial), so the slider matters: full
// dichromacy is the worst case, not the typical one.
//
// This is a *perception* preview only. Contrast/APCA values are always computed
// from the true colors, never these simulated ones.
import { parseHex, toHex } from './color.js';

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linearToSrgb = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

const MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export const CVD_TYPES = [
  { id: 'none', label: 'Normal vision', short: 'Normal' },
  { id: 'protanopia', label: 'Protan · red deficiency', short: 'Protan' },
  { id: 'deuteranopia', label: 'Deutan · green deficiency', short: 'Deutan' },
  { id: 'tritanopia', label: 'Tritan · blue deficiency', short: 'Tritan' },
  { id: 'achromatopsia', label: 'Achromatopsia · grayscale', short: 'Gray' },
];

/** Whether a CVD type id supports the severity slider (none/achromatopsia don't). */
export const hasSeverity = (type) =>
  type === 'protanopia' || type === 'deuteranopia' || type === 'tritanopia';

// Full-strength effect of a type on a linear-RGB triplet.
function fullEffect(type, lin) {
  if (type === 'achromatopsia') {
    const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    return [y, y, y];
  }
  const m = MATRICES[type];
  if (!m) return null;
  return m.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
}

/**
 * Simulate how `hex` appears under a vision `type` at `severity` (0–1).
 * Severity 0 returns the input unchanged; 1 is the full effect.
 */
export function simulate(hex, type, severity = 1) {
  if (!type || type === 'none' || severity <= 0) return hex;
  const px = parseHex(hex);
  if (!px) return hex;

  const lin = [
    srgbToLinear(px.r / 255),
    srgbToLinear(px.g / 255),
    srgbToLinear(px.b / 255),
  ];
  const eff = fullEffect(type, lin);
  if (!eff) return hex;

  const s = Math.min(1, severity);
  const mix = (a, b) => a + (b - a) * s;
  return toHex({
    r: clamp01(linearToSrgb(mix(lin[0], eff[0]))) * 255,
    g: clamp01(linearToSrgb(mix(lin[1], eff[1]))) * 255,
    b: clamp01(linearToSrgb(mix(lin[2], eff[2]))) * 255,
  });
}
