import { describe, it, expect } from 'vitest';
import { simulate } from './colorblind.js';
import { confusablePairs } from './separation.js';

describe('simulate severity', () => {
  it('returns the input unchanged at severity 0', () => {
    expect(simulate('#2B6CB0', 'deuteranopia', 0)).toBe('#2B6CB0');
  });

  it('changes the color at full severity', () => {
    expect(simulate('#2B6CB0', 'deuteranopia', 1)).not.toBe('#2B6CB0');
  });

  it('interpolates between tabulated steps — half severity is distinct from both ends', () => {
    const c = '#1E7F4F';
    const mid = simulate(c, 'deuteranopia', 0.5);
    expect(mid).not.toBe(c);
    expect(mid).not.toBe(simulate(c, 'deuteranopia', 1));
  });

  it('achromatopsia collapses to a neutral gray (R≈G≈B)', () => {
    const g = simulate('#C0362C', 'achromatopsia', 1);
    expect(g[1] === g[2] || Math.abs(parseInt(g.slice(1, 3), 16) - parseInt(g.slice(3, 5), 16)) <= 1).toBe(true);
  });
});

describe('confusablePairs', () => {
  it('flags red vs green as confusable under deuteranopia', () => {
    const palette = [
      { id: 'r', name: 'Red', hex: '#C0362C' },
      { id: 'g', name: 'Green', hex: '#1E7F4F' },
      { id: 'b', name: 'Blue', hex: '#2B6CB0' },
    ];
    const hits = confusablePairs(palette, 'deuteranopia', 1);
    const names = hits.map((h) => [h.a.name, h.b.name].sort().join('/'));
    expect(names).toContain('Green/Red');
  });

  it('returns nothing for normal vision', () => {
    expect(confusablePairs([{ id: '1', hex: '#000' }, { id: '2', hex: '#fff' }], 'none')).toEqual([]);
  });
});
