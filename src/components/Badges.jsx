// Pass/fail badges. Status is conveyed by icon SHAPE and text, never by color
// alone — a baseline accessibility requirement the tool has to model itself.
import Icon from './Icon.jsx';
import { THRESHOLDS } from '../lib/contrast.js';

const CRITERIA = [
  { key: 'aaNormal', label: 'AA · Normal text', req: THRESHOLDS.aaNormal },
  { key: 'aaLarge', label: 'AA · Large text', req: THRESHOLDS.aaLarge },
  { key: 'aaaNormal', label: 'AAA · Normal text', req: THRESHOLDS.aaaNormal },
  { key: 'aaaLarge', label: 'AAA · Large text', req: THRESHOLDS.aaaLarge },
  { key: 'ui', label: 'UI & graphics', req: THRESHOLDS.ui },
];

export function Criteria({ ev }) {
  return (
    <ul className="criteria" aria-label="WCAG conformance results">
      {CRITERIA.map((c) => {
        const pass = ev[c.key];
        return (
          <li
            key={c.key}
            className={`criteria__row criteria__row--${pass ? 'pass' : 'fail'}`}
          >
            <span className="criteria__icon" aria-hidden="true">
              <Icon name={pass ? 'check' : 'x'} size={14} />
            </span>
            <span className="criteria__label">{c.label}</span>
            <span className="criteria__req mono">{c.req.toFixed(1)}:1</span>
            <span className="criteria__verdict">{pass ? 'Pass' : 'Fail'}</span>
          </li>
        );
      })}
    </ul>
  );
}
