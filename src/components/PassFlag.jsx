// Pass/fail indicator: a colored right-triangle hugging the top-right corner of
// a matrix cell, with a thin white stroke along its inner (bottom-left) edge and
// a small check / cross so pass-vs-fail reads by shape, not color alone. The
// stroke overshoots the box (clipped to the viewBox) so it meets both edges.
export default function PassFlag({ pass }) {
  return (
    <svg
      className={`cell__pip ${pass ? 'is-pass' : 'is-fail'}`}
      viewBox="0 0 22 22"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <path className="cell__pip-tri" d="M0 0H22V22Z" />
      <line className="cell__pip-edge" x1="-1" y1="-1" x2="23" y2="23" />
      {pass ? (
        <path className="cell__pip-mark" d="M11.7 6.4 13.7 8.5 17.8 3.9" />
      ) : (
        <path className="cell__pip-mark" d="M12.3 4 16.7 8.6M16.7 4 12.3 8.6" />
      )}
    </svg>
  );
}
