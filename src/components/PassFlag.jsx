// Pass/fail indicator: a colored right-triangle hugging the top-right corner of
// a matrix cell, with a thin white stroke along its inner (bottom-left) edge and
// a check / cross so pass-vs-fail reads by shape, not color alone. The icon is
// sized for comfortable margin inside the triangle; the stroke overshoots the
// box (clipped to the viewBox) so it meets both edges.
export default function PassFlag({ pass }) {
  return (
    <svg
      className={`cell__pip ${pass ? 'is-pass' : 'is-fail'}`}
      viewBox="0 0 33 33"
      width="33"
      height="33"
      aria-hidden="true"
    >
      <path className="cell__pip-tri" d="M0 0H33V33Z" />
      <line className="cell__pip-edge" x1="-1" y1="-1" x2="34" y2="34" />
      {pass ? (
        <path className="cell__pip-mark" d="M17.5 10.2 20.3 13 26.5 6.3" />
      ) : (
        <path className="cell__pip-mark" d="M19 7 25 13M25 7 19 13" />
      )}
    </svg>
  );
}
