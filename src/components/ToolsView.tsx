/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sliders, Grid3X3, SearchCode, Copy, Check, Info } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';

interface ToolsViewProps {
  onCopy: () => void;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

type ToolOption = 'glass' | 'grid' | 'regex';

export default function ToolsView({ onCopy, addToast }: ToolsViewProps) {
  const [activeTool, setActiveTool] = useState<ToolOption>('glass');

  // Glassmorphism States
  const [opacity, setOpacity] = useState(15);
  const [blur, setBlur] = useState(12);
  const [radius, setRadius] = useState(16);
  const [color, setColor] = useState('#ffffff');
  const [copiedGlass, setCopiedGlass] = useState(false);

  // Grid States
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [gap, setGap] = useState(4);
  const [copiedGrid, setCopiedGrid] = useState(false);

  // Regex States
  const [regexStr, setRegexStr] = useState('\\d+');
  const [testText, setTestText] = useState('My system has 28 dynamic clusters active across 4 primary cloud regions.');
  const [matches, setMatches] = useState<string[]>([]);
  const [regexError, setRegexError] = useState<string | null>(null);

  // Glass CSS calculated string
  const glassStyle = {
    background: `rgba(${hexToRgb(color)}, ${opacity / 100})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: `${radius}px`,
  };

  const glassCssString = `background: rgba(${hexToRgb(color)}, ${opacity / 100});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder-radius: ${radius}px;\nborder: 1px solid rgba(255, 255, 255, 0.1);`;

  // Tailwind Grid class calculated
  const gridTailwindClass = `grid grid-cols-${cols} grid-rows-${rows} gap-${gap}`;

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  }

  // Handle live regex calculation
  useEffect(() => {
    if (!regexStr) {
      setMatches([]);
      setRegexError(null);
      return;
    }
    try {
      const regex = new RegExp(regexStr, 'gi');
      const found = testText.match(regex);
      setMatches(found ? Array.from(new Set(found)) : []);
      setRegexError(null);
    } catch (err: any) {
      setRegexError(err.message || 'Invalid regular expression syntax');
      setMatches([]);
    }
  }, [regexStr, testText]);

  const handleCopyGlass = () => {
    copyToClipboard(glassCssString);
    setCopiedGlass(true);
    onCopy();
    addToast('Glassmorphism CSS code generated and copied!', 'success');
    setTimeout(() => setCopiedGlass(false), 2000);
  };

  const handleCopyGrid = () => {
    copyToClipboard(gridTailwindClass);
    setCopiedGrid(true);
    onCopy();
    addToast('Tailwind Grid layout class string copied!', 'success');
    setTimeout(() => setCopiedGrid(false), 2000);
  };

  return (
    <div id="tools-view" className="space-y-6 animate-fade-in text-left">
      {/* Sub menu Tabs */}
      <section className="border-b border-outline-variant/30 pb-3 flex flex-wrap gap-2 justify-start select-none">
        <button
          id="tab-tool-glass"
          onClick={() => setActiveTool('glass')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'glass'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Glassmorphism Lab
        </button>
        <button
          id="tab-tool-grid"
          onClick={() => setActiveTool('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'grid'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Grid Layout Sizer
        </button>
        <button
          id="tab-tool-regex"
          onClick={() => setActiveTool('regex')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'regex'
              ? 'bg-primary/15 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
          }`}
        >
          <SearchCode className="h-4 w-4" />
          RegEx Inspector
        </button>
      </section>

      {/* CORE TOOL INTERFACES */}
      <main className="grid grid-cols-1 gap-6">

        {/* GLASSMORPHISM LAB */}
        {activeTool === 'glass' && (
          <article className="bg-surface-container/70 border border-outline-variant rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">CSS Glassmorphism Lab</h3>
              <p className="text-xs text-on-surface-variant/85 font-light">
                Fine-tune tactile translucent components, compiling inline CSS values dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Slider Controller inputs */}
              <div className="space-y-5 bg-surface-container-lowest/40 border border-outline-variant/30 rounded-xl p-5">
                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Glass Opacity</span>
                    <span className="text-primary font-bold">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>

                {/* Backdrop Blur */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Backdrop Blur Radius</span>
                    <span className="text-primary font-bold">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Border Radius</span>
                    <span className="text-primary font-bold">{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>

                {/* Base Color HEX */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Glass Background Tint</span>
                    <span className="text-primary font-bold uppercase">{color}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      aria-label="Color Selection Field"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 rounded border border-outline-variant/50 cursor-pointer bg-transparent"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {['#ffffff', '#000000', '#adc6ff', '#0071c7', '#93000a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className="h-5 w-5 rounded border border-white/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER PREVIEW ZONE */}
              <div className="space-y-5">
                <span className="text-xs font-mono tracking-wider font-bold text-on-surface-variant/70 uppercase">Tactile Visual Output</span>
                
                {/* Background grid simulator underneath the panel to prove blur efficacy */}
                <div className="aspect-video w-full rounded-xl relative overflow-hidden bg-gradient-to-tr from-indigo-900/60 via-slate-900 to-primary-container/30 border border-outline-variant/30 flex items-center justify-center p-8 select-none">
                  {/* Floating colorful geometric shapes beneath glass pane to showcase blur */}
                  <div className="absolute top-4 left-6 h-12 w-12 rounded-full bg-blue-500 animate-pulse" />
                  <div className="absolute bottom-6 right-8 h-10 w-16 bg-pink-500 rounded transform rotate-12" />
                  <div className="absolute top-1/2 left-1/3 h-6 w-20 bg-emerald-500 rounded-full" />

                  {/* GLASS PANE ACCENT */}
                  <div
                    className="w-full h-full border border-white/15 shadow-2xl flex flex-col items-center justify-center p-4 text-center text-white font-sans relative z-10"
                    style={glassStyle}
                  >
                    <span className="text-sm font-bold tracking-tight">Dynamic Glass Container</span>
                    <p className="text-[10px] text-white/70 max-w-[200px] mt-1 font-light leading-relaxed">
                      Watch how blur blends color clusters dynamically underneath.
                    </p>
                  </div>
                </div>

                {/* Raw generated code text section */}
                <div className="relative">
                  <button
                    onClick={handleCopyGlass}
                    className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-sans text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-lg active:scale-95"
                  >
                    {copiedGlass ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy CSS
                  </button>
                  <pre className="overflow-x-auto p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-xs text-on-surface-variant text-left leading-relaxed">
                    <code>{glassCssString}</code>
                  </pre>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* TAILWIND GRID CONSTRUCTOR */}
        {activeTool === 'grid' && (
          <article className="bg-surface-container/70 border border-outline-variant rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">Tailwind Grid Constructor</h3>
              <p className="text-xs text-on-surface-variant/85 font-light">
                Graph columns & row arrays visually, exporting production ready Tailwind classes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Controllers sliders */}
              <div className="space-y-6 bg-surface-container-lowest/40 border border-outline-variant/30 rounded-xl p-5">
                {/* Columns */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Columns Count</span>
                    <span className="text-primary font-bold">{cols} col</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>

                {/* Rows */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Rows Count</span>
                    <span className="text-primary font-bold">{rows} row</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>

                {/* Gap */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant/80">Gap spacing magnitude</span>
                    <span className="text-primary font-bold">gap-{gap} ({gap * 4}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded bg-surface-container-highest cursor-pointer"
                  />
                </div>
              </div>

              {/* RENDER PLAYGROUND GRID */}
              <div className="space-y-5">
                <span className="text-xs font-mono tracking-wider font-bold text-on-surface-variant/70 uppercase">Visual Grid Blueprint Preview</span>
                
                {/* Simulated workspace visualizer */}
                <div className="bg-surface-container-lowest/90 border border-outline-variant/20 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
                  <div
                    className="w-full h-full max-w-sm mx-auto"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                      gap: `${gap * 4}px`
                    }}
                  >
                    {Array.from({ length: rows * cols }).map((_, i) => (
                      <div
                        key={i}
                        className="p-3 bg-primary/10 border border-primary/20 rounded-md font-mono text-[9px] text-primary flex items-center justify-center text-center font-bold h-10 select-none hover:bg-primary/25 cursor-help transition-colors"
                        title={`Cell ID ${i + 1}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export copy string */}
                <div className="relative">
                  <button
                    onClick={handleCopyGrid}
                    className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-sans text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-lg active:scale-95"
                  >
                    {copiedGrid ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Class String
                  </button>
                  <pre className="p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-xs text-on-surface-variant text-left">
                    <code>{gridTailwindClass}</code>
                  </pre>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* REGEX INJECTOR INSPECTOR */}
        {activeTool === 'regex' && (
          <article className="bg-surface-container/70 border border-outline-variant rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">Active RegEx Inspector</h3>
              <p className="text-xs text-on-surface-variant/85 font-light">
                Execute client-side regular expressions in real-time, displaying live query-highlights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Parameters input box */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-on-surface-variant/70 uppercase">Search Pattern String</label>
                  <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg p-1 px-3 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/25 transition-all">
                    <span className="text-xs font-mono text-slate-500 font-bold select-none mr-2">/</span>
                    <input
                      type="text"
                      placeholder="\d+"
                      value={regexStr}
                      onChange={(e) => setRegexStr(e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs font-mono text-on-surface focus:outline-none focus:ring-0 placeholder-slate-700 py-1.5"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold select-none ml-2">/gi</span>
                  </div>
                  {regexError ? (
                    <p className="text-[10px] text-red-400 font-mono italic mt-1">{regexError}</p>
                  ) : (
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">✓ Syntax valid. Pattern synchronized.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-on-surface-variant/70 uppercase">Input Text Workspace</label>
                  <textarea
                    rows={4}
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Input code or statements here..."
                    className="w-full bg-surface-container-lowest/90 border border-outline-variant rounded-xl p-3.5 text-xs text-sans text-on-surface focus:outline-none focus:border-primary/80 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* LIVE PLAYGROUND MATCH HIGHLIGHTS */}
              <div className="space-y-4 bg-surface-container-lowest/30 border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-2.5 text-left">
                  <span className="text-xs font-mono tracking-wider font-bold text-on-surface-variant/70 uppercase">Live Output Highlights</span>
                  
                  {/* Visual Render Container */}
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl min-h-[140px] text-xs font-sans leading-relaxed text-on-surface">
                    {/* Render text with highlights */}
                    {regexStr && !regexError ? (
                      highlightMatches(testText, regexStr)
                    ) : (
                      <span className="text-on-surface-variant/50 italic font-light">Input high-performing search strings to test.</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center text-xs font-mono text-on-surface-variant select-none">
                  <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    <span>Dynamic Matcher Verified</span>
                  </div>
                  <span>Matches count: {matches.length}</span>
                </div>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );

  // Helper rendering function to inject HTML span highlights safely
  function highlightMatches(text: string, pattern: string) {
    if (!pattern.trim()) return <span>{text}</span>;
    try {
      const regex = new RegExp(`(${pattern})`, 'gi');
      const parts = text.split(regex);
      return (
        <p>
          {parts.map((part, index) => {
            const matchesRegex = new RegExp(pattern, 'i').test(part);
            return matchesRegex ? (
              <span key={index} className="bg-primary/25 border-b border-primary text-primary font-bold px-0.5 rounded-sm">
                {part}
              </span>
            ) : (
              <span key={index}>{part}</span>
            );
          })}
        </p>
      );
    } catch {
      return <span>{text}</span>;
    }
  }
}
