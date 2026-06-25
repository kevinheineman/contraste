// Small inline icon set (no icon-font dependency). 24×24 stroke icons, plus
// the GitHub mark as a filled path.
const PATHS = {
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash:
    'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6',
  copy: 'M10 8h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  link: 'M9 14a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M15 10a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L13 18',
  sun: 'M12 3V1M12 23v-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M3 12H1M23 12h-2M5.6 18.4 4.2 19.8M19.8 4.2l-1.4 1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  wand: 'M6 21 17 10M14 7l3 3M19 3l.6 1.6L21.2 5.2l-1.6.6L19 7.4l-.6-1.6L16.8 5.2l1.6-.6zM5 12l.5 1.3 1.3.5-1.3.5L5 16l-.5-1.4L3.2 14.3l1.3-.5z',
  chevron: 'M6 9l6 6 6-6',
  eye: 'M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z',
  dropper: 'M2 22l1-4L14.5 6.5l3 3L6 21l-4 1zM15.5 5.5l2-2a2.1 2.1 0 0 1 3 3l-2 2z',
};

export default function Icon({ name, size = 16, className }) {
  if (name === 'github') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.8c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {name === 'sun' && <circle cx="12" cy="12" r="4" />}
      {name === 'eye' && <circle cx="12" cy="12" r="3" />}
      <path d={PATHS[name]} />
    </svg>
  );
}
