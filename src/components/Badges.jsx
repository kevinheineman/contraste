// Pass/fail checklist. Status is conveyed by icon SHAPE and text, never by color
// alone. Algorithm-aware: shows WCAG success criteria or APCA Lc levels.
import Icon from './Icon.jsx';
import { CRITERIA } from '../lib/metrics.js';

export function Criteria({ algorithm, value }) {
  return (
    <ul className="criteria" aria-label="Conformance results">
      {CRITERIA[algorithm].map((c) => {
        const pass = value != null && c.test(value);
        return (
          <li
            key={c.id}
            className={`criteria__row criteria__row--${pass ? 'pass' : 'fail'}`}
          >
            <span className="criteria__icon" aria-hidden="true">
              <Icon name={pass ? 'check' : 'x'} size={14} />
            </span>
            <span className="criteria__label">{c.label}</span>
            <span className="criteria__req mono">{c.req}</span>
            <span className="criteria__verdict">{pass ? 'Pass' : 'Fail'}</span>
          </li>
        );
      })}
    </ul>
  );
}
