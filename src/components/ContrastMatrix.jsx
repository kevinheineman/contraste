import { memo } from 'react';
import { simulate } from '../lib/colorblind.js';
import { metricValue, cellValue, formatMetric, passesLevel } from '../lib/metrics.js';
import PassFlag from './PassFlag.jsx';

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
const Cell = memo(function Cell({ fg, bg, algorithm, level, cvd, severity, isSel, onSelect }) {
  const value = metricValue(algorithm, fg.hex, bg.hex);
  const pass = passesLevel(value, level);
  return (
    <td className="cell">
      <button
        type="button"
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
          Ag
        </span>
        <span className="cell__ratio mono" aria-hidden="true">
          {cellValue(algorithm, value)}
        </span>
        <PassFlag pass={pass} />
      </button>
    </td>
  );
});

export default function ContrastMatrix({
  palette,
  algorithm,
  level,
  cvd,
  severity,
  selected,
  onSelect,
}) {
  return (
    <div className="matrix-wrap" role="region" aria-label="Contrast matrix" tabIndex={0}>
      <table className="matrix">
        <caption className="sr-only">
          Contrast for every text-on-background pair. Rows are text colors;
          columns are background colors. Select a cell to inspect it.
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
          {palette.map((fg) => (
            <tr key={fg.id}>
              <Head color={fg} cvd={cvd} severity={severity} scope="row" />
              {palette.map((bg) =>
                fg.id === bg.id ? (
                  <td key={bg.id} className="cell cell--diag" aria-hidden="true">
                    <span className="cell__same">—</span>
                  </td>
                ) : (
                  <Cell
                    key={bg.id}
                    fg={fg}
                    bg={bg}
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
