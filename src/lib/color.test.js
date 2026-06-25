import { describe, it, expect } from 'vitest';
import { parseHex, hexToOklch, oklchToHex } from './color.js';
import { suggestAccessible } from './fix.js';
import { contrastRatio } from './contrast.js';

describe('parseHex', () => {
  it('expands 3-digit shorthand', () => {
    expect(parseHex('#abc')).toEqual(parseHex('#aabbcc'));
  });

  it('tolerates a missing # and any casing', () => {
    expect(parseHex('FFffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects invalid input', () => {
    expect(parseHex('#xyz')).toBeNull();
    expect(parseHex('12345')).toBeNull();
  });
});

describe('OKLCH round-trip', () => {
  const near = (a, b) => {
    const A = parseHex(a);
    const B = parseHex(b);
    return (
      Math.abs(A.r - B.r) <= 1 &&
      Math.abs(A.g - B.g) <= 1 &&
      Math.abs(A.b - B.b) <= 1
    );
  };

  it('survives hex → OKLCH → hex within ±1 per channel', () => {
    for (const hex of ['#2B6CB0', '#C0362C', '#1E7F4F', '#11181C', '#E6EAED']) {
      expect(near(oklchToHex(hexToOklch(hex)), hex)).toBe(true);
    }
  });
});

describe('suggestAccessible', () => {
  it('returns a color that clears the target ratio', () => {
    // Brand Soft on white fails AA normal; the fix should clear 4.5:1.
    const fix = suggestAccessible('#9FC1E8', '#FFFFFF', 4.5);
    expect(fix.met).toBe(true);
    expect(contrastRatio(fix.hex, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('makes the smallest move it can — a passing pair barely changes', () => {
    const fix = suggestAccessible('#11181C', '#FFFFFF', 4.5);
    expect(fix.met).toBe(true);
    expect(fix.deltaE).toBeLessThan(0.05);
  });
});
