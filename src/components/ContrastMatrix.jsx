import { simulate } from '../lib/colorblind.js';
import { contrastRatio, evaluate, formatRatio } from '../lib/contrast.js';
import PassFlag from './PassFlag.jsx';

function Head({ color, cvd, scope }) {
  return (
    <th scope={scope} className={`matrix__head matrix__head--${scope}`}>
      <span
        className="matrix__chip"
        style={{ background: simulate(color.hex, cvd) }}
        aria-hidden="true"
      />
      <span className="matrix__headName">{color.name || '—'}</span>
      <span className="matrix__headHex mono">{color.hex}</span>
    </th>
  );
}

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
              {palette.map((bg) => {
                if (fg.id === bg.id) {
                  return (
                    <td key={bg.id} className="cell cell--diag" aria-hidden="true">
                      <span className="cell__same">—</span>
                    </td>
                  );
                }
                const ratio = contrastRatio(fg.hex, bg.hex);
                const ev = evaluate(ratio);
                const pass = ev[codeBy];
                const isSel =
                  selected && selected.fgId === fg.id && selected.bgId === bg.id;
                return (
                  <td key={bg.id} className="cell">
                    <button
                      type="button"
                      className={`cell__btn ${isSel ? 'is-selected' : ''}`}
                      style={{
                        background: simulate(bg.hex, cvd),
                        color: simulate(fg.hex, cvd),
                      }}
                      onClick={() => onSelect(fg.id, bg.id)}
                      aria-pressed={Boolean(isSel)}
                      aria-label={`${fg.name} on ${bg.name}, ratio ${formatRatio(
                        ratio,
                      )}, ${pass ? 'passes' : 'fails'} selected level`}
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
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
