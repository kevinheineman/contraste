// Pass/fail indicator: a colored right-triangle that hugs the top-right corner
// of a matrix cell. A white stroke along its inner (bottom-left) edge keeps it
// legible even when the cell's own color is close to the pass/fail color.
export default function PassFlag({ pass }) {
  return (
    <svg
      className={`cell__pip ${pass ? 'is-pass' : 'is-fail'}`}
      viewBox="0 0 22 22"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path d="M0 0H22V22Z" />
      <line x1="0" y1="0" x2="22" y2="22" />
    </svg>
  );
}
