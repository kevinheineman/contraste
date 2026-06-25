// Seed palettes. The default deliberately mixes passing and failing pairs so
// the matrix is immediately useful — and instructive — on first load.
let uid = 0;
const c = (name, hex) => ({ id: `seed-${uid++}`, name, hex });

export const DEFAULT_PALETTE = [
  c('Ink', '#11181C'),
  c('Slate', '#5B6770'),
  c('Paper', '#FFFFFF'),
  c('Mist', '#E6EAED'),
  c('Brand', '#2B6CB0'),
  c('Brand Soft', '#9FC1E8'),
  c('Success', '#1E7F4F'),
  c('Danger', '#C0362C'),
];

export const SAMPLES = [
  { name: 'Web defaults', colors: () => DEFAULT_PALETTE.map((x) => ({ ...x, id: `s-${uid++}` })) },
  {
    name: 'Grayscale ramp',
    colors: () =>
      [
        ['Gray 900', '#1A1A1A'],
        ['Gray 700', '#4D4D4D'],
        ['Gray 500', '#808080'],
        ['Gray 300', '#B3B3B3'],
        ['Gray 100', '#E6E6E6'],
        ['White', '#FFFFFF'],
      ].map(([n, h]) => c(n, h)),
  },
  {
    name: 'Vivid brand',
    colors: () =>
      [
        ['Midnight', '#0B132B'],
        ['Indigo', '#3A0CA3'],
        ['Fuchsia', '#F72585'],
        ['Teal', '#06A77D'],
        ['Amber', '#FFB703'],
        ['Cloud', '#F4F4F8'],
      ].map(([n, h]) => c(n, h)),
  },
];
