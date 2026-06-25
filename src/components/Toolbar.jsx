import Icon from './Icon.jsx';
import { CVD_TYPES } from '../lib/colorblind.js';
import { ALGORITHMS, LEVELS } from '../lib/metrics.js';

export default function Toolbar({
  theme,
  onToggleTheme,
  algorithm,
  onAlgorithm,
  level,
  onLevel,
  cvd,
  onCvd,
  severity,
  onSeverity,
  onShare,
  shareLabel,
  samples,
  onSample,
  onReset,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <label className="field">
          <span className="field__label">Algorithm</span>
          <select className="select" value={algorithm} onChange={(e) => onAlgorithm(e.target.value)}>
            {ALGORITHMS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Pass level</span>
          <select className="select" value={level} onChange={(e) => onLevel(e.target.value)}>
            {LEVELS[algorithm].map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Vision</span>
          <select className="select" value={cvd} onChange={(e) => onCvd(e.target.value)}>
            {CVD_TYPES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {cvd !== 'none' && (
          <label className="field field--slider">
            <span className="field__label">Severity · {Math.round(severity * 100)}%</span>
            <input
              type="range"
              className="slider"
              min="0"
              max="1"
              step="0.05"
              value={severity}
              onChange={(e) => onSeverity(Number(e.target.value))}
              aria-label="Vision deficiency severity"
            />
          </label>
        )}

        <label className="field">
          <span className="field__label">Sample</span>
          <select
            className="select"
            value=""
            onChange={(e) => e.target.value !== '' && onSample(Number(e.target.value))}
          >
            <option value="" disabled>
              Load…
            </option>
            {samples.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="toolbar__group">
        <button type="button" className="btn btn--ghost" onClick={onShare}>
          <Icon name="link" /> {shareLabel}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Reset
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </div>
  );
}
