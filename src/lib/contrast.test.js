import { describe, it, expect } from 'vitest';
import { contrastRatio, relativeLuminance, evaluate } from './contrast.js';
import { parseHex } from './color.js';

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance(parseHex('#ffffff'))).toBeCloseTo(1, 5);
    expect(relativeLuminance(parseHex('#000000'))).toBeCloseTo(0, 5);
  });
});

describe('contrastRatio', () => {
  it('black on white is the maximum 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('a color against itself is 1:1', () => {
    expect(contrastRatio('#3a7bd5', '#3a7bd5')).toBeCloseTo(1, 5);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#777', '#fff')).toBeCloseTo(
      contrastRatio('#fff', '#777'),
      10,
    );
  });

  it('matches the canonical lightest grey that clears AA on white', () => {
    // #767676 is the well-known lightest grey passing 4.5:1 on white (WebAIM).
    const r = contrastRatio('#767676', '#ffffff');
    expect(r).toBeGreaterThanOrEqual(4.5);
    expect(r).toBeLessThan(4.6);
  });

  it('returns null for invalid input', () => {
    expect(contrastRatio('nope', '#fff')).toBeNull();
  });
});

describe('evaluate', () => {
  it('flags AA-normal pass/fail at the 4.5 boundary', () => {
    expect(evaluate(4.5).aaNormal).toBe(true);
    expect(evaluate(4.49).aaNormal).toBe(false);
  });

  it('flags large-text and AAA thresholds', () => {
    expect(evaluate(3.2).aaLarge).toBe(true);
    expect(evaluate(2.9).aaLarge).toBe(false);
    expect(evaluate(7.1).aaaNormal).toBe(true);
    expect(evaluate(6.9).aaaNormal).toBe(false);
  });
});
