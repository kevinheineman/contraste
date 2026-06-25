// Distinguishability panel — surfaces palette colors that collapse to
// near-identical under the active color-vision deficiency. Only shown when a
// CVD lens is active, since that's the only time the question applies.
import { confusablePairs } from '../lib/separation.js';
import { CVD_TYPES } from '../lib/colorblind.js';
import Icon from './Icon.jsx';

const MAX_SHOWN = 8;

export default function Separation({ palette, cvd, severity }) {
  if (cvd === 'none') return null;
  const pairs = confusablePairs(palette, cvd, severity);
  const label = CVD_TYPES.find((t) => t.id === cvd)?.short || cvd;

  return (
    <div className="panel separation">
      <div className="panel__head">
        <h2 className="panel__title">Color separation</h2>
        <span className="panel__count mono">{label}</span>
      </div>

      {pairs.length === 0 ? (
        <p className="separation__ok">
          <Icon name="check" size={14} /> All colors stay distinguishable.
        </p>
      ) : (
        <>
          <p className="separation__intro">Hard to tell apart — they look alike:</p>
          <ul className="separation__list">
            {pairs.slice(0, MAX_SHOWN).map((p) => (
              <li key={p.a.id + p.b.id} className="separation__pair">
                <span className="separation__sw" style={{ background: p.a.hex }} aria-hidden="true" />
                <span className="separation__sw" style={{ background: p.b.hex }} aria-hidden="true" />
                <span className="separation__names">
                  {p.a.name || p.a.hex} &amp; {p.b.name || p.b.hex}
                </span>
              </li>
            ))}
          </ul>
          {pairs.length > MAX_SHOWN && (
            <p className="separation__more">+{pairs.length - MAX_SHOWN} more</p>
          )}
        </>
      )}
    </div>
  );
}
