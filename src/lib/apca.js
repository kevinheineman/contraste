// APCA — the Accessible Perceptual Contrast Algorithm, the candidate contrast
// method for WCAG 3. Unlike WCAG 2's luminance *ratio*, APCA models perceptual
// lightness contrast (Lc, roughly −108…106) and is polarity-aware (dark-on-light
// vs light-on-dark are scored differently). Constants per the public APCA-W3
// 0.1.9 "4g" release by Andrew Somers. https://github.com/Myndex/apca-w3
//
// APCA is not finalised, so the app surfaces it as a labelled preview.
import { parseHex } from './color.js';

const TRC = 2.4;
const Rco = 0.2126729;
const Gco = 0.7151522;
const Bco = 0.072175;

const normBG = 0.56;
const normTXT = 0.57;
const revTXT = 0.62;
const revBG = 0.65;

const blkThrs = 0.022;
const blkClmp = 1.414;
const scale = 1.14;
const loOffset = 0.027;
const loClip = 0.1;
const deltaYmin = 0.0005;

const screenY = ({ r, g, b }) => {
  const lin = (c) => (c / 255) ** TRC;
  return Rco * lin(r) + Gco * lin(g) + Bco * lin(b);
};

/**
 * APCA lightness contrast (Lc) of `textHex` on `bgHex`. Signed: positive for
 * dark-on-light, negative for light-on-dark. Returns `null` on bad input.
 */
export function apcaLc(textHex, bgHex) {
  const txt = parseHex(textHex);
  const bg = parseHex(bgHex);
  if (!txt || !bg) return null;

  let Ytxt = screenY(txt);
  let Ybg = screenY(bg);

  // Soft-clamp luminances near black.
  Ytxt = Ytxt > blkThrs ? Ytxt : Ytxt + (blkThrs - Ytxt) ** blkClmp;
  Ybg = Ybg > blkThrs ? Ybg : Ybg + (blkThrs - Ybg) ** blkClmp;

  if (Math.abs(Ybg - Ytxt) < deltaYmin) return 0;

  let out;
  if (Ybg > Ytxt) {
    // Normal polarity: darker text on lighter background.
    const sapc = (Ybg ** normBG - Ytxt ** normTXT) * scale;
    out = sapc < loClip ? 0 : sapc - loOffset;
  } else {
    // Reverse polarity: lighter text on darker background.
    const sapc = (Ybg ** revBG - Ytxt ** revTXT) * scale;
    out = sapc > -loClip ? 0 : sapc + loOffset;
  }
  return out * 100;
}

/** Magnitude of the Lc (what conformance levels are compared against). */
export function apcaAbs(textHex, bgHex) {
  const lc = apcaLc(textHex, bgHex);
  return lc == null ? null : Math.abs(lc);
}
