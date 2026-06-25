import { useCallback, useEffect, useState } from 'react';
import Toolbar from './components/Toolbar.jsx';
import PaletteEditor from './components/PaletteEditor.jsx';
import ContrastMatrix from './components/ContrastMatrix.jsx';
import PairDetail from './components/PairDetail.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import Icon from './components/Icon.jsx';
import { DEFAULT_PALETTE, SAMPLES } from './lib/palettes.js';
import { encodePalette, decodePalette } from './lib/url.js';
import { toHex, parseHex } from './lib/color.js';

const MAX_COLORS = 14;
const ADD_COLORS = ['#6B7280', '#0EA5E9', '#16A34A', '#D946EF', '#F59E0B', '#EF4444'];

let seq = 0;
const newId = () => `c${seq++}`;

function initialPalette() {
  if (typeof window !== 'undefined') {
    const fromUrl = decodePalette(window.location.hash);
    if (fromUrl && fromUrl.length >= 2) return fromUrl.slice(0, MAX_COLORS);
  }
  return DEFAULT_PALETTE;
}

// First, illustrative selection: dark text on a light background a few apart.
function firstPair(palette) {
  if (palette.length < 2) return null;
  return { fgId: palette[0].id, bgId: (palette[2] || palette[1]).id };
}

const LEVEL_LABEL = {
  aaNormal: 'AA normal · 4.5:1',
  aaLarge: 'AA large · 3:1',
  aaaNormal: 'AAA normal · 7:1',
  ui: 'UI & graphics · 3:1',
};

function Legend({ codeBy }) {
  return (
    <div className="legend">
      <span className="legend__title">Cells coded by</span>
      <strong className="legend__level">{LEVEL_LABEL[codeBy]}</strong>
      <div className="legend__keys">
        <span className="legend__key">
          <span className="cell__pip is-pass">
            <Icon name="check" size={11} />
          </span>
          Passes
        </span>
        <span className="legend__key">
          <span className="cell__pip is-fail">
            <Icon name="x" size={11} />
          </span>
          Fails
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [palette, setPalette] = useState(initialPalette);
  const [selected, setSelected] = useState(() => firstPair(palette));
  const [theme, setTheme] = useState('light');
  const [cvd, setCvd] = useState('none');
  const [codeBy, setCodeBy] = useState('aaNormal');
  const [shareLabel, setShareLabel] = useState('Share');

  // Theme: hydrate from storage / system once, then reflect to <html>.
  useEffect(() => {
    const stored = localStorage.getItem('contraste-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored || (prefersDark ? 'dark' : 'light'));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('contraste-theme', theme);
  }, [theme]);

  // Mirror the palette into the URL hash so any palette is a shareable link.
  useEffect(() => {
    window.history.replaceState(null, '', `#${encodePalette(palette)}`);
  }, [palette]);

  // Keep the selection pointing at colors that still exist.
  useEffect(() => {
    setSelected((sel) => {
      const ok =
        sel &&
        palette.some((c) => c.id === sel.fgId) &&
        palette.some((c) => c.id === sel.bgId);
      return ok ? sel : firstPair(palette);
    });
  }, [palette]);

  const updateColor = useCallback((id, patch) => {
    setPalette((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const removeColor = useCallback((id) => {
    setPalette((p) => (p.length > 2 ? p.filter((c) => c.id !== id) : p));
  }, []);

  const addColor = useCallback(() => {
    setPalette((p) => {
      if (p.length >= MAX_COLORS) return p;
      return [
        ...p,
        {
          id: newId(),
          name: `Color ${p.length + 1}`,
          hex: ADD_COLORS[p.length % ADD_COLORS.length],
        },
      ];
    });
  }, []);

  const importColors = useCallback((list) => {
    const next = list
      .slice(0, MAX_COLORS)
      .map((c) => ({ id: newId(), name: c.name, hex: toHex(parseHex(c.hex)) }));
    if (next.length >= 2) setPalette(next);
    else if (next.length === 1)
      setPalette([next[0], { ...DEFAULT_PALETTE[2], id: newId() }]);
  }, []);

  const loadSample = useCallback((i) => {
    const s = SAMPLES[i];
    if (s) setPalette(s.colors());
  }, []);

  const resetPalette = useCallback(
    () => setPalette(DEFAULT_PALETTE.map((c) => ({ ...c }))),
    [],
  );

  const applyFix = useCallback((id, hex) => updateColor(id, { hex }), [updateColor]);
  const selectPair = useCallback((fgId, bgId) => setSelected({ fgId, bgId }), []);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel('Link copied');
    } catch {
      setShareLabel('Copy failed');
    }
    setTimeout(() => setShareLabel('Share'), 1600);
  }, []);

  return (
    <>
      <a className="skip-link" href="#matrix">
        Skip to contrast matrix
      </a>

      <header className="site-header">
        <div className="brand">
          <img className="brand__mark" src="/favicon.svg" alt="" width="36" height="36" />
          <div>
            <h1 className="brand__name">Contraste</h1>
            <p className="brand__tag">Accessible color, verified.</p>
          </div>
        </div>
        <a
          className="btn btn--ghost"
          href="https://github.com/kevinheineman/contraste"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="github" /> <span className="hide-sm">View source</span>
        </a>
      </header>

      <main className="app">
        <Toolbar
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          cvd={cvd}
          onCvd={setCvd}
          codeBy={codeBy}
          onCodeBy={setCodeBy}
          onShare={share}
          shareLabel={shareLabel}
          samples={SAMPLES}
          onSample={loadSample}
          onReset={resetPalette}
        />

        <div className="layout">
          <aside className="layout__aside">
            <PaletteEditor
              palette={palette}
              onUpdate={updateColor}
              onRemove={removeColor}
              onAdd={addColor}
              onImport={importColors}
              max={MAX_COLORS}
            />
            <Legend codeBy={codeBy} />
          </aside>

          <section className="layout__main" id="matrix">
            <ContrastMatrix
              palette={palette}
              codeBy={codeBy}
              cvd={cvd}
              selected={selected}
              onSelect={selectPair}
            />
            <PairDetail palette={palette} selected={selected} onApplyFix={applyFix} />
          </section>
        </div>

        <ExportPanel palette={palette} />
      </main>

      <footer className="site-footer">
        <p>
          Built by{' '}
          <a href="https://www.kevinheineman.com/" target="_blank" rel="noreferrer">
            Kevin Heineman
          </a>
          . Ratios follow{' '}
          <a
            href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
            target="_blank"
            rel="noreferrer"
          >
            WCAG 2.1
          </a>{' '}
          and match WebAIM to the decimal.
        </p>
        <p className="site-footer__credit">
          Matrix concept after{' '}
          <a href="https://contrast-grid.eightshapes.com/" target="_blank" rel="noreferrer">
            EightShapes Contrast Grid
          </a>
          . CVD simulation after Viénot, Brettel &amp; Mollon (1999).
        </p>
      </footer>
    </>
  );
}
