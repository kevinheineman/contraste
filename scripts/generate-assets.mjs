// Generates the raster icons and the social (OG) image from SVG sources, so no
// binary asset is ever hand-edited. `sharp` is a transient dependency — install
// it with `npm install --no-save sharp`, then run `node scripts/generate-assets.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const favicon = readFileSync(join(pub, 'favicon.svg'));

// Full-bleed mark for Apple touch icon (iOS adds its own rounding; transparent
// corners would render black, so we fill the whole square).
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#3b5bd9"/>
  <circle cx="90" cy="90" r="48" fill="#ffffff"/>
  <path d="M90 42a48 48 0 0 0 0 96z" fill="#11181c"/>
</svg>`;

// ---- Open Graph image (1200×630) ----
const cells = [
  { bg: '#FFFFFF', fg: '#11181C', r: '17.9' },
  { bg: '#2B6CB0', fg: '#FFFFFF', r: '5.4' },
  { bg: '#E6EAED', fg: '#11181C', r: '14.8' },
  { bg: '#FFFFFF', fg: '#9FC1E8', r: '1.9' },
  { bg: '#2B6CB0', fg: '#11181C', r: '3.3' },
  { bg: '#1E7F4F', fg: '#FFFFFF', r: '5.0' },
  { bg: '#C0362C', fg: '#FFFFFF', r: '5.5' },
  { bg: '#E6EAED', fg: '#5B6770', r: '4.8' },
  { bg: '#FFFFFF', fg: '#C0362C', r: '5.5' },
];
const gx = 648;
const gy = 150;
const cw = 150;
const ch = 110;
const gap = 14;
const grid = cells
  .map((c, i) => {
    const x = gx + (i % 3) * (cw + gap);
    const y = gy + Math.floor(i / 3) * (ch + gap);
    const pass = parseFloat(c.r) >= 4.5;
    return `
    <g>
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="${c.bg}" stroke="rgba(0,0,0,.08)"/>
      <text x="${x + 16}" y="${y + 52}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="${c.fg}">Ag</text>
      <text x="${x + 16}" y="${y + 84}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${c.fg}">${c.r}:1</text>
      <circle cx="${x + cw - 18}" cy="${y + 18}" r="9" fill="${pass ? '#1b7f43' : '#c32f27'}"/>
    </g>`;
  })
  .join('');

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eef1f4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(80,96)">
    <circle cx="24" cy="24" r="24" fill="#11181c"/>
    <path d="M24 0a24 24 0 0 1 0 48z" fill="#ffffff"/>
    <circle cx="24" cy="24" r="23" fill="none" stroke="#11181c" stroke-width="2"/>
  </g>
  <text x="148" y="128" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="62" fill="#11181c">Contraste</text>
  <text x="82" y="208" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#586470">Accessible color, verified.</text>
  <text x="82" y="320" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="40" fill="#11181c">Audit every contrast pair.</text>
  <text x="82" y="372" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="40" fill="#3b5bd9">Fix the ones that fail.</text>
  <text x="82" y="548" font-family="Arial, Helvetica, sans-serif" font-size="23" fill="#586470">WCAG 2.1 · AA / AAA · color-vision · CSS · Tailwind · design tokens</text>
  ${grid}
</svg>`;

await sharp(favicon).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'));
await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og.png'));

console.log('Generated favicon-32.png, apple-touch-icon.png, og.png');
