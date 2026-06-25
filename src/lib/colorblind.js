// Approximate color-vision-deficiency simulation.
// Matrices: Viénot, Brettel & Mollon (1999), applied in linear-light sRGB.
//
// This is a *perception* preview only. WCAG contrast ratios elsewhere in the
// app are always computed from the true colors, never these simulated ones —
// CVD changes how a pair is seen, not its measured luminance contrast.
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
  { id: 'protanopia', label: 'Protanopia · red-blind', short: 'Protan' },
  { id: 'deuteranopia', label: 'Deuteranopia · green-blind', short: 'Deutan' },
  { id: 'tritanopia', label: 'Tritanopia · blue-blind', short: 'Tritan' },
];

/** Simulate how `hex` appears under the given CVD type id. */
export function simulate(hex, type) {
  if (!type || type === 'none') return hex;
  const m = MATRICES[type];
  if (!m) return hex;
  const { r, g, b } = parseHex(hex);
  const lin = [
    srgbToLinear(r / 255),
    srgbToLinear(g / 255),
    srgbToLinear(b / 255),
  ];
  const out = m.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
  return toHex({
    r: clamp01(linearToSrgb(out[0])) * 255,
    g: clamp01(linearToSrgb(out[1])) * 255,
    b: clamp01(linearToSrgb(out[2])) * 255,
  });
}
