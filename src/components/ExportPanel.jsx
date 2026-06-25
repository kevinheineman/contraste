import { useState } from 'react';
import { EXPORTERS } from '../lib/exporters.js';
import Icon from './Icon.jsx';

export default function ExportPanel({ palette }) {
  const [active, setActive] = useState(EXPORTERS[0].id);
  const [copied, setCopied] = useState(false);
  const current = EXPORTERS.find((e) => e.id === active);
  const code = current.fn(palette);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — no-op */
    }
  };

  return (
    <div className="panel export">
      <div className="panel__head">
        <h2 className="panel__title">Export</h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Export format">
        {EXPORTERS.map((e) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={active === e.id}
            className={`tab ${active === e.id ? 'is-active' : ''}`}
            onClick={() => setActive(e.id)}
          >
            {e.label}
          </button>
        ))}
      </div>

      <pre className="export__code mono" tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
