// Forgiving import: pull hex colors (and any preceding label) out of pasted
// CSS custom properties, Tailwind config, JSON tokens, or a plain list.
// Requires a leading `#` so we don't match arbitrary 6-char hex-ish tokens.
import { parseHex, toHex } from './color.js';

export function parseColorList(text) {
  if (!text) return [];
  const out = [];
  const seen = new Set();
  let auto = 0;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
    if (!m) continue;

    const hex = toHex(parseHex(m[0]));
    if (seen.has(hex)) continue;
    seen.add(hex);

    let name = line
      .slice(0, m.index)
      .replace(/\$value|\$type|color|var|true|false/gi, ' ')
      .replace(/[{}"':,;=()[\]]|--/g, ' ')
      .trim();
    name = name ? name.split(/\s+/).slice(-3).join(' ').slice(0, 24) : `Color ${++auto}`;

    out.push({ name, hex });
  }
  return out;
}
