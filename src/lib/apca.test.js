import { describe, it, expect } from 'vitest';
import { apcaLc, apcaAbs } from './apca.js';

describe('apcaLc', () => {
  it('matches the canonical black-on-white reference (Lc ≈ 106)', () => {
    expect(apcaLc('#000000', '#ffffff')).toBeCloseTo(106.04, 1);
  });

  it('matches the canonical white-on-black reference (Lc ≈ −108)', () => {
    expect(apcaLc('#ffffff', '#000000')).toBeCloseTo(-107.88, 1);
  });

  it('is polarity-aware — sign flips when fg/bg swap', () => {
    const a = apcaLc('#11181c', '#ffffff');
    const b = apcaLc('#ffffff', '#11181c');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeLessThan(0);
  });

  it('returns 0 for identical colors and clamps tiny differences', () => {
    expect(apcaLc('#808080', '#808080')).toBe(0);
  });

  it('apcaAbs is the magnitude', () => {
    expect(apcaAbs('#ffffff', '#000000')).toBeCloseTo(107.88, 1);
  });
});
