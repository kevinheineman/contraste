import { useMemo } from 'react';
import { contrastRatio, evaluate, formatRatio } from '../lib/contrast.js';
import { suggestAccessible } from '../lib/fix.js';
import { simulate, CVD_TYPES } from '../lib/colorblind.js';
import { Criteria } from './Badges.jsx';
import Icon from './Icon.jsx';

const pct = (l) => `${Math.round(l * 100)}%`;

function FixCard({ title, adjustName, result, onApply }) {
  if (!result) return null;
  return (
    <div className="fix">
      <div className="fix__head">
        <span className="fix__title">{title}</span>
        <span className={`fix__ratio mono ${result.met ? 'is-pass' : 'is-fail'}`}>
          {formatRatio(result.ratio)}
        </span>
      </div>
      <div className="fix__body">
        <span className="fix__swatch" style={{ background: result.hex }} aria-hidden="true" />
        <span className="fix__hex mono">{result.hex}</span>
        <span className="fix__delta">
          L {pct(result.lightnessFrom)} → {pct(result.lightnessTo)}
        </span>
      </div>
      <button
        type="button"
        className="btn btn--primary btn--sm"
        onClick={() => onApply(result.hex)}
        disabled={!result.met}
      >
        Apply to {adjustName}
      </button>
      {!result.met && (
        <p className="fix__note">Can’t reach AA on this pair by lightness alone.</p>
      )}
    </div>
  );
}

export default function PairDetail({ palette, selected, onApplyFix }) {
  const fg = selected ? palette.find((c) => c.id === selected.fgId) : null;
  const bg = selected ? palette.find((c) => c.id === selected.bgId) : null;

  const data = useMemo(() => {
    if (!fg || !bg) return null;
    const ratio = contrastRatio(fg.hex, bg.hex);
    return {
      ratio,
      ev: evaluate(ratio),
      fixFg: suggestAccessible(fg.hex, bg.hex, 4.5),
      fixBg: suggestAccessible(bg.hex, fg.hex, 4.5),
    };
  }, [fg, bg]);

  if (!fg || !bg || !data) {
    return (
      <div className="panel detail detail--empty">
        <p>
          Select any cell in the matrix to inspect a pair — live preview, the
          full WCAG checklist, and one-click accessible fixes.
        </p>
      </div>
    );
  }

  const { ratio, ev, fixFg, fixBg } = data;

  return (
    <div className="panel detail">
      <div className="detail__header">
        <div className="detail__pair">
          <span className="detail__swatch" style={{ background: fg.hex }} aria-hidden="true" />
          <strong>{fg.name}</strong>
          <span className="detail__sep">on</span>
          <span className="detail__swatch" style={{ background: bg.hex }} aria-hidden="true" />
          <strong>{bg.name}</strong>
        </div>
        <div className={`detail__ratio mono ${ev.aaNormal ? 'is-pass' : 'is-fail'}`}>
          {formatRatio(ratio)}
        </div>
      </div>

      <div className="detail__grid">
        <div className="detail__preview" style={{ background: bg.hex, color: fg.hex }}>
          <p className="preview__large">Large heading</p>
          <p className="preview__body">
            Body copy at a normal size — the case AA holds to 4.5:1. The quick
            brown fox jumps over the lazy dog.
          </p>
          <div className="preview__row">
            <span className="preview__btn" style={{ background: fg.hex, color: bg.hex }}>
              Button
            </span>
            <span className="preview__link">A text link →</span>
          </div>
        </div>
        <Criteria ev={ev} />
      </div>

      {!ev.aaNormal && (
        <div className="detail__fixes">
          <h3 className="detail__subhead">
            <Icon name="wand" size={15} /> Nearest accessible fix · AA 4.5:1
          </h3>
          <div className="fix-grid">
            <FixCard
              title="Adjust text"
              adjustName={fg.name}
              result={fixFg}
              onApply={(hex) => onApplyFix(fg.id, hex)}
            />
            <FixCard
              title="Adjust background"
              adjustName={bg.name}
              result={fixBg}
              onApply={(hex) => onApplyFix(bg.id, hex)}
            />
          </div>
        </div>
      )}

      <div className="detail__cvd">
        <h3 className="detail__subhead">Color-vision preview</h3>
        <div className="cvd-row">
          {CVD_TYPES.map((t) => (
            <div key={t.id} className="cvd-chip">
              <span
                className="cvd-chip__sample"
                style={{ background: simulate(bg.hex, t.id), color: simulate(fg.hex, t.id) }}
              >
                Ag
              </span>
              <span className="cvd-chip__label">{t.short}</span>
            </div>
          ))}
        </div>
        <p className="detail__hint">
          Ratios are measured from the true colors; this row only previews how
          the pair is perceived.
        </p>
      </div>
    </div>
  );
}
