import { useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { isValidHex, parseHex, toHex } from '../lib/color.js';
import { parseColorList } from '../lib/parse.js';

function ColorRow({ color, onUpdate, onRemove, canRemove }) {
  const [hexText, setHexText] = useState(color.hex);
  useEffect(() => setHexText(color.hex), [color.hex]);

  const valid = isValidHex(hexText);
  const commit = (val) => {
    setHexText(val);
    if (isValidHex(val)) onUpdate(color.id, { hex: toHex(parseHex(val)) });
  };

  return (
    <li className="palette__row">
      <span className="palette__swatch" style={{ background: color.hex }}>
        <input
          type="color"
          className="palette__picker"
          value={valid ? toHex(parseHex(hexText)) : color.hex}
          onChange={(e) => commit(e.target.value)}
          aria-label={`Color picker for ${color.name || color.hex}`}
        />
      </span>
      <input
        className="palette__name"
        value={color.name}
        onChange={(e) => onUpdate(color.id, { name: e.target.value })}
        aria-label="Color name"
        placeholder="Name"
      />
      <input
        className={`palette__hex mono ${valid ? '' : 'is-invalid'}`}
        value={hexText}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => !valid && setHexText(color.hex)}
        aria-label="Hex value"
        aria-invalid={!valid}
        spellCheck="false"
      />
      <button
        type="button"
        className="icon-btn"
        onClick={() => onRemove(color.id)}
        disabled={!canRemove}
        aria-label={`Remove ${color.name || color.hex}`}
      >
        <Icon name="trash" />
      </button>
    </li>
  );
}

export default function PaletteEditor({ palette, onUpdate, onRemove, onAdd, onImport, onPick }) {
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const parsed = parseColorList(importText);
  const canPick = typeof window !== 'undefined' && 'EyeDropper' in window;
  const pick = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      onPick(sRGBHex);
    } catch {
      /* user dismissed the eyedropper */
    }
  };

  const handleImport = () => {
    if (parsed.length) {
      onImport(parsed);
      setImportText('');
      setImportOpen(false);
    }
  };

  return (
    <div className="panel palette">
      <div className="panel__head">
        <h2 className="panel__title">Palette</h2>
        <span className="panel__count mono">{palette.length}</span>
      </div>

      <ul className="palette__list">
        {palette.map((c) => (
          <ColorRow
            key={c.id}
            color={c}
            onUpdate={onUpdate}
            onRemove={onRemove}
            canRemove={palette.length > 2}
          />
        ))}
      </ul>

      <div className="palette__actions">
        <button type="button" className="btn btn--ghost" onClick={onAdd}>
          <Icon name="plus" /> Add color
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setImportOpen((o) => !o)}
          aria-expanded={importOpen}
        >
          Import…
        </button>
        {canPick && (
          <button
            type="button"
            className="icon-btn"
            onClick={pick}
            aria-label="Pick a color from your screen"
            title="Eyedropper"
          >
            <Icon name="dropper" />
          </button>
        )}
      </div>

      {importOpen && (
        <div className="import">
          <label className="import__label" htmlFor="import-text">
            Paste hex colors, CSS variables, Tailwind config, or JSON tokens
          </label>
          <textarea
            id="import-text"
            className="import__text mono"
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'#11181C Ink\n--color-brand: #2B6CB0;\n"danger": "#C0362C"'}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleImport}
            disabled={!parsed.length}
          >
            Load {parsed.length || ''} colors
          </button>
        </div>
      )}
    </div>
  );
}
