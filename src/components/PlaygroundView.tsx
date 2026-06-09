import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, Download, Code2, Smartphone, Tablet, Monitor, X, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';
import { templates } from '../data';
import { componentsList } from '../data';
import { copyToClipboard } from '../lib/utils';

type PreviewSize = 'mobile' | 'tablet' | 'desktop';

const defaultHtml = `<div class="flex items-center justify-center min-h-screen bg-slate-950 p-8">
  <div class="max-w-md w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center space-y-4">
    <h1 class="text-2xl font-bold text-white">Hello, CodeVault!</h1>
    <p class="text-slate-400">Edit the code to see live preview.</p>
    <button class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all">
      Click Me
    </button>
  </div>
</div>`;

export default function PlaygroundView() {
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [editorTab, setEditorTab] = useState<'html' | 'css' | 'js'>('html');
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [autoPreview, setAutoPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoRunTimer = useRef<number | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  const renderPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setPreviewError('');
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Could not access iframe document');
      let safeJs = js;
      safeJs = safeJs.replace(/<\/script>/gi, '<\\/script>');
      const fullHtml = [
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">',
        '<script src="https://cdn.tailwindcss.com"><\/script>',
        '<style>', css, '*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a}</style>',
        '</head><body>',
        html,
        '<script>',
        '(function(){',
        'var origLog=console.log,origError=console.error,logs=[];',
        'console.log=function(){for(var a=[],i=0;i<arguments.length;i++)a.push(typeof arguments[i]==="object"?JSON.stringify(arguments[i]):String(arguments[i]));logs.push(a.join(" "));origLog.apply(console,arguments);window.parent.postMessage({type:"console",data:logs.join("\\n")},"*")};',
        'console.error=function(){for(var a=[],i=0;i<arguments.length;i++)a.push("[ERROR] "+(typeof arguments[i]==="object"?JSON.stringify(arguments[i]):String(arguments[i])));logs.push(a.join(" "));origError.apply(console,arguments);window.parent.postMessage({type:"console",data:logs.join("\\n")},"*")};',
        'try{',
        safeJs,
        '}catch(e){console.error(e.message)}',
        '})()',
        '<\/script>',
        '</body></html>'
      ].join('');
      doc.open();
      doc.write(fullHtml);
      doc.close();
    } catch (e: any) {
      setPreviewError(e.message || 'Preview render failed');
    }
  }, [html, css, js]);

  useEffect(() => {
    if (!autoPreview) return;
    if (autoRunTimer.current) clearTimeout(autoRunTimer.current);
    autoRunTimer.current = window.setTimeout(() => renderPreview(), 800);
    return () => { if (autoRunTimer.current) clearTimeout(autoRunTimer.current); };
  }, [html, css, js, autoPreview, renderPreview]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'console') {
        setConsoleLogs(prev => [...prev.slice(-50), e.data.data]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  function loadPreset(id: string) {
    const t = templates.find(t => t.id === id);
    if (t) {
      setHtml(t.code);
      setCss('');
      setJs('');
      setSelectedPreset(id);
      return;
    }
    const c = componentsList.find(c => c.id === id);
    if (c) {
      setHtml(c.code);
      setCss('');
      setJs('');
      setSelectedPreset(id);
    }
  }

  function handleCopyCode() {
    const val = editorTab === 'html' ? html : editorTab === 'css' ? css : js;
    copyToClipboard(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const full = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">',
      '<script src="https://cdn.tailwindcss.com"><\/script>',
      '<style>', css, '</style>',
      '</head><body>',
      html,
      '<script>', js, '<\/script>',
      '</body></html>'
    ].join('');
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'codevault-playground.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleReset() {
    setHtml(defaultHtml);
    setCss('');
    setJs('');
    setSelectedPreset('');
    setConsoleLogs([]);
    setPreviewError('');
  }

  function getEditorLanguage() {
    if (editorTab === 'html') return 'html';
    if (editorTab === 'css') return 'css';
    return 'javascript';
  }

  function getEditorValue() {
    if (editorTab === 'html') return html;
    if (editorTab === 'css') return css;
    return js;
  }

  function setEditorValue(val: string | undefined) {
    const v = val || '';
    if (editorTab === 'html') setHtml(v);
    else if (editorTab === 'css') setCss(v);
    else setJs(v);
  }

  function handleEditorBeforeMount(monaco: any) {
    monaco.editor.defineTheme('codevault', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#334155',
        'editorCursor.foreground': '#60a5fa',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#94a3b8',
      },
    });
  }

  function handleEditorDidMount() {
    setEditorReady(true);
  }

  return (
    <div className="space-y-4 text-left">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-on-surface">Playground</h2>
          <select value={selectedPreset} onChange={(e) => loadPreset(e.target.value)}
            className="bg-surface-container border border-outline-variant/40 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/60">
            <option value="">Load a preset...</option>
            <optgroup label="Components (works in preview)">
              {componentsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </optgroup>
            <optgroup label="Templates (framework code, preview may not render)">
              {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </optgroup>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:bg-surface-container transition-all"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          <button onClick={handleCopyCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:bg-surface-container transition-all">{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}</button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95"><Download className="h-3.5 w-3.5" /> Download</button>
        </div>
      </div>

      {previewError && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span className="text-xs text-rose-400">{previewError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '70vh' }}>
        {/* Editor panel */}
        <div className="lg:col-span-2 flex flex-col bg-surface-container/30 border border-outline-variant/30 rounded-xl overflow-hidden">
          <div className="flex items-center border-b border-outline-variant/20 bg-surface-container/50">
            {(['html', 'css', 'js'] as const).map(tab => (
              <button key={tab} onClick={() => setEditorTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all border-b-2 ${
                  editorTab === tab ? 'border-primary text-primary bg-surface-container-lowest' : 'border-transparent text-on-surface-variant/50 hover:text-on-surface-variant'
                }`}>
                {tab === 'html' && <Code2 className="h-3.5 w-3.5" />}
                {tab === 'css' && <span className="text-xs font-bold" style={{color: '#06f'}}>#</span>}
                {tab === 'js' && <TerminalIcon className="h-3.5 w-3.5" />}
                {tab.toUpperCase()}
              </button>
            ))}
            <button onClick={() => setShowConsole(!showConsole)}
              className={`ml-auto mr-2 px-2.5 py-1 rounded text-[10px] font-mono transition-all ${showConsole ? 'bg-amber-500/10 text-amber-400' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}>
              Console {consoleLogs.length > 0 && `(${consoleLogs.length})`}
            </button>
          </div>
          <Editor
            key={editorTab}
            language={getEditorLanguage()}
            value={getEditorValue()}
            onChange={setEditorValue}
            beforeMount={handleEditorBeforeMount}
            onMount={handleEditorDidMount}
            theme="codevault"
            loading={
              <div className="flex items-center justify-center py-20 text-xs text-on-surface-variant/50">
                <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                Loading editor...
              </div>
            }
            options={{
              fontSize: 13,
              fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12 },
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              bracketPairColorization: { enabled: true },
              renderWhitespace: 'selection',
            }}
            height="450px"
          />
          {showConsole && (
            <div className="border-t border-outline-variant/20 bg-slate-950/90 p-3 max-h-32 overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-amber-400/70 uppercase">Console Output</span>
                <button onClick={() => setConsoleLogs([])} className="text-[9px] text-on-surface-variant/40 hover:text-on-surface-variant"><X className="h-3 w-3" /></button>
              </div>
              {consoleLogs.length === 0 ? (
                <span className="text-[10px] font-mono text-on-surface-variant/30">No output</span>
              ) : (
                consoleLogs.slice(-20).map((log, i) => (
                  <div key={i} className="text-[10px] font-mono text-emerald-400/80 border-b border-white/5 py-0.5">{log}</div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-3 flex flex-col bg-surface-container/30 border border-outline-variant/30 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/20 bg-surface-container/50">
            <div className="flex items-center gap-2">
              <button onClick={renderPreview} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/25 transition-all active:scale-95"><Play className="h-3.5 w-3.5" /> Run</button>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={autoPreview} onChange={(e) => setAutoPreview(e.target.checked)} className="w-3 h-3 rounded border-outline-variant text-primary focus:ring-primary/30" />
                <span className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-wider">Auto</span>
              </label>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-lowest/60 rounded-lg p-0.5">
              <button onClick={() => setPreviewSize('mobile')} className={`p-1.5 rounded ${previewSize === 'mobile' ? 'bg-surface-container shadow-sm text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'} transition-all`} title="Mobile"><Smartphone className="h-3.5 w-3.5" /></button>
              <button onClick={() => setPreviewSize('tablet')} className={`p-1.5 rounded ${previewSize === 'tablet' ? 'bg-surface-container shadow-sm text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'} transition-all`} title="Tablet"><Tablet className="h-3.5 w-3.5" /></button>
              <button onClick={() => setPreviewSize('desktop')} className={`p-1.5 rounded ${previewSize === 'desktop' ? 'bg-surface-container shadow-sm text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'} transition-all`} title="Desktop"><Monitor className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-start justify-center p-4 bg-zinc-900/50 overflow-auto">
            <iframe ref={iframeRef} className="w-full rounded-lg shadow-2xl bg-white" style={{ minHeight: '450px', maxWidth: previewSize === 'mobile' ? '375px' : previewSize === 'tablet' ? '768px' : '100%' }} title="Preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
