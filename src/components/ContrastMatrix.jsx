import { memo, useRef } from 'react';
import { simulate } from '../lib/colorblind.js';
import { metricValue, cellValue, formatMetric, passesLevel } from '../lib/metrics.js';
import PassFlag from './PassFlag.jsx';
import Icon from './Icon.jsx';

const Head = memo(function Head({ color, cvd, severity, scope }) {
  return (
    <th scope={scope} className={`matrix__head matrix__head--${scope}`}>
      <span className="matrix__headInner">
        <span
          className="matrix__chip"
          style={{ background: simulate(color.hex, cvd, severity) }}
          aria-hidden="true"
        />
        <span className="matrix__headText">
          <span className="matrix__headName">{color.name || '—'}</span>
          <span className="matrix__headHex mono">{color.hex}</span>
        </span>
      </span>
    </th>
  );
});

// Memoized so that in a large matrix, editing one color or moving the selection
// only re-renders the cells that actually changed — not all N² of them.
const Cell = memo(function Cell({
  fg,
  bg,
  fgIndex,
  bgIndex,
  algorithm,
  level,
  cvd,
  severity,
  isSel,
  onSelect,
}) {
  const value = metricValue(algorithm, fg.hex, bg.hex);
  const pass = passesLevel(value, level);
  return (
    <td className="cell">
      <button
        type="button"
        data-fg={fgIndex}
        data-bg={bgIndex}
        className={`cell__btn ${isSel ? 'is-selected' : ''}`}
        style={{
          background: simulate(bg.hex, cvd, severity),
          color: simulate(fg.hex, cvd, severity),
        }}
        onClick={() => onSelect(fg.id, bg.id)}
        aria-pressed={isSel}
        aria-label={`${fg.name} on ${bg.name}, ${formatMetric(algorithm, value)}, ${
          pass ? 'passes' : 'fails'
        } selected level`}
      >
        <span className="cell__sample" aria-hidden="true">
          {level === 'ui' ? <Icon name="star" size={18} /> : 'Ag'}
        </span>
        <span className="cell__ratio mono" aria-hidden="true">
          {cellValue(algorithm, value)}
        </span>
        <PassFlag pass={pass} />
      </button>
    </td>
  );
});

const ARROWS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export default function ContrastMatrix({
  palette,
  algorithm,
  level,
  cvd,
  severity,
  selected,
  onSelect,
}) {
  const tableRef = useRef(null);

  // Arrow keys move the selection between cells (skipping the diagonal).
  const handleKeyNav = (e) => {
    const d = ARROWS[e.key];
    if (!d) return;
    const a = document.activeElement;
    if (!a || a.dataset.fg === undefined) return;
    const fg = Number(a.dataset.fg);
    const bg = Number(a.dataset.bg);
    if (Number.isNaN(fg) || Number.isNaN(bg)) return;
    e.preventDefault();

    const clamp = (v) => Math.min(palette.length - 1, Math.max(0, v));
    let nf = clamp(fg + d[0]);
    let nb = clamp(bg + d[1]);
    if (nf === nb) {
      // Step once more in the same direction to skip the (unselectable) diagonal.
      nf = clamp(nf + d[0]);
      nb = clamp(nb + d[1]);
    }
    if (nf === nb) return; // couldn't avoid the diagonal at an edge

    onSelect(palette[nf].id, palette[nb].id);
    requestAnimationFrame(() => {
      tableRef.current
        ?.querySelector(`[data-fg="${nf}"][data-bg="${nb}"]`)
        ?.focus();
    });
  };

  return (
    <div className="matrix-wrap" role="region" aria-label="Contrast matrix" tabIndex={0}>
      <table className="matrix" ref={tableRef} onKeyDown={handleKeyNav}>
        <caption className="sr-only">
          Contrast for every text-on-background pair. Rows are text colors;
          columns are background colors. Select a cell to inspect it, or use the
          arrow keys to move between cells.
        </caption>
        <thead>
          <tr>
            <th className="matrix__corner" scope="col">
              <span aria-hidden="true">Text&nbsp;↓ / Bg&nbsp;→</span>
            </th>
            {palette.map((bg) => (
              <Head key={bg.id} color={bg} cvd={cvd} severity={severity} scope="col" />
            ))}
          </tr>
        </thead>
        <tbody>
          {palette.map((fg, fi) => (
            <tr key={fg.id}>
              <Head color={fg} cvd={cvd} severity={severity} scope="row" />
              {palette.map((bg, bi) =>
                fg.id === bg.id ? (
                  <td key={bg.id} className="cell cell--diag" aria-hidden="true">
                    <span className="cell__same">—</span>
                  </td>
                ) : (
                  <Cell
                    key={bg.id}
                    fg={fg}
                    bg={bg}
                    fgIndex={fi}
                    bgIndex={bi}
                    algorithm={algorithm}
                    level={level}
                    cvd={cvd}
                    severity={severity}
                    isSel={Boolean(
                      selected && selected.fgId === fg.id && selected.bgId === bg.id,
                    )}
                    onSelect={onSelect}
                  />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
