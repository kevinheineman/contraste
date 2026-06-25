// At-a-glance palette health: what share of the n×n pairs clear the active
// pass level. Computed from the true colors (independent of the CVD lens).
import { useMemo } from 'react';
import { metricValue, passesLevel, findLevel } from '../lib/metrics.js';

export default function MatrixSummary({ palette, algorithm, level }) {
  const stat = useMemo(() => {
    let pass = 0;
    let total = 0;
    for (const fg of palette) {
      for (const bg of palette) {
        if (fg.id === bg.id) continue;
        total += 1;
        if (passesLevel(metricValue(algorithm, fg.hex, bg.hex), level)) pass += 1;
      }
    }
    return { pass, total, pct: total ? Math.round((pass / total) * 100) : 0 };
  }, [palette, algorithm, level]);

  const lv = findLevel(level);

  return (
    <div className="summary">
      <span className="summary__pct mono">{stat.pct}%</span>
      <span className="summary__text">
        of pairs pass <strong>{lv.short}</strong>
        <span className="summary__count">
          {' '}
          · {stat.pass} of {stat.total}
        </span>
      </span>
      <span className="summary__bar" aria-hidden="true">
        <span className="summary__fill" style={{ width: `${stat.pct}%` }} />
      </span>
    </div>
  );
}
