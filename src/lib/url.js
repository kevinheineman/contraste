// Encode the palette in the URL hash so any palette is a shareable link.
// Format: `#s=<base64url of compact JSON>`.

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Serialize a palette to a hash fragment (without the leading `#`). */
export function encodePalette(palette) {
  const compact = { v: 1, c: palette.map((c) => [c.name, c.hex]) };
  return `s=${toBase64Url(JSON.stringify(compact))}`;
}

/** Parse a palette out of a hash fragment, or `null` if absent/invalid. */
export function decodePalette(hash) {
  try {
    const m = (hash || '').replace(/^#/, '').match(/(?:^|&)s=([^&]+)/);
    if (!m) return null;
    const data = JSON.parse(fromBase64Url(m[1]));
    if (!data || !Array.isArray(data.c)) return null;
    return data.c
      .filter((e) => Array.isArray(e) && typeof e[1] === 'string')
      .map(([name, hex], i) => ({
        id: `u${i}-${hex}`,
        name: String(name || ''),
        hex: String(hex),
      }));
  } catch {
    return null;
  }
}
