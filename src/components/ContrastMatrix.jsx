import { memo } from 'react';
import { simulate } from '../lib/colorblind.js';
import { contrastRatio, evaluate, formatRatio } from '../lib/contrast.js';
import PassFlag from './PassFlag.jsx';

const Head = memo(function Head({ color, cvd, scope }) {
  return (
    <th scope={scope} className={`matrix__head matrix__head--${scope}`}>
      <span className="matrix__headInner">
        <span
          className="matrix__chip"
          style={{ background: simulate(color.hex, cvd) }}
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
const Cell = memo(function Cell({ fg, bg, codeBy, cvd, isSel, onSelect }) {
  const ratio = contrastRatio(fg.hex, bg.hex);
  const pass = evaluate(ratio)[codeBy];
  return (
    <td className="cell">
      <button
        type="button"
        className={`cell__btn ${isSel ? 'is-selected' : ''}`}
        style={{ background: simulate(bg.hex, cvd), color: simulate(fg.hex, cvd) }}
        onClick={() => onSelect(fg.id, bg.id)}
        aria-pressed={isSel}
        aria-label={`${fg.name} on ${bg.name}, ratio ${formatRatio(ratio)}, ${
          pass ? 'passes' : 'fails'
        } selected level`}
      >
        <span className="cell__sample" aria-hidden="true">
          Ag
        </span>
        <span className="cell__ratio mono" aria-hidden="true">
          {ratio.toFixed(2)}
        </span>
        <PassFlag pass={pass} />
      </button>
    </td>
  );
});

export default function ContrastMatrix({ palette, codeBy, cvd, selected, onSelect }) {
  return (
    <div className="matrix-wrap" role="region" aria-label="Contrast matrix" tabIndex={0}>
      <table className="matrix">
        <caption className="sr-only">
          WCAG contrast ratio for every text-on-background pair. Rows are text
          colors; columns are background colors. Select a cell to inspect it.
        </caption>
        <thead>
          <tr>
            <th className="matrix__corner" scope="col">
              <span aria-hidden="true">Text&nbsp;↓ / Bg&nbsp;→</span>
            </th>
            {palette.map((bg) => (
              <Head key={bg.id} color={bg} cvd={cvd} scope="col" />
            ))}
          </tr>
        </thead>
        <tbody>
          {palette.map((fg) => (
            <tr key={fg.id}>
              <Head color={fg} cvd={cvd} scope="row" />
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
                    codeBy={codeBy}
                    cvd={cvd}
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
