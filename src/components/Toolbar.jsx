import Icon from './Icon.jsx';
import { CVD_TYPES } from '../lib/colorblind.js';

const CODE_OPTIONS = [
  { id: 'aaNormal', label: 'AA · Normal (4.5:1)' },
  { id: 'aaLarge', label: 'AA · Large (3:1)' },
  { id: 'aaaNormal', label: 'AAA · Normal (7:1)' },
  { id: 'ui', label: 'UI & graphics (3:1)' },
];

export default function Toolbar({
  theme,
  onToggleTheme,
  cvd,
  onCvd,
  codeBy,
  onCodeBy,
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
          <span className="field__label">Pass level</span>
          <select className="select" value={codeBy} onChange={(e) => onCodeBy(e.target.value)}>
            {CODE_OPTIONS.map((o) => (
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
