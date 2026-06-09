import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { componentsList as staticComponents } from '../data';
import { ComponentAsset } from '../types';
import { getComponents as fetchDbComponents } from '../lib/db';
import { copyToClipboard } from '../lib/utils';

interface ComponentsViewProps {
  searchQuery: string;
  onCopy: () => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

type ComponentCategory = 'All' | 'Buttons' | 'Cards' | 'Navigation' | 'Forms' | 'Overlays';

export default function ComponentsView({ searchQuery, onCopy, savedIds, onToggleSave, addToast }: ComponentsViewProps) {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentAsset[]>(staticComponents);

  useEffect(() => {
    fetchDbComponents().then((dbComponents) => {
      if (!dbComponents || dbComponents.length === 0) return;
      const merged = [...staticComponents];
      const existingIds = new Set(merged.map((c) => c.id));
      for (const c of dbComponents) {
        if (existingIds.has(c.id)) {
          const idx = merged.findIndex((m) => m.id === c.id);
          merged[idx] = c;
        } else {
          merged.push(c);
        }
      }
      setComponents(merged);
    }).catch(() => {});
  }, []);

  const categories: ComponentCategory[] = ['All', 'Buttons', 'Cards', 'Navigation', 'Forms', 'Overlays'];

  const filteredComponents = components.filter((comp) => {
    const categoryMatches = activeCategory === 'All' || comp.category === activeCategory;
    const searchMatches = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });

  const handleCopyCode = (comp: ComponentAsset) => {
    copyToClipboard(comp.code);
    setCopiedId(comp.id);
    onCopy();
    addToast(`${comp.title} code fragment copied!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="components-view" className="space-y-6 animate-fade-in text-left">
      {/* Sticky Chip Navigation */}
      <section className="overflow-x-auto no-scrollbar py-2 sticky top-[64px] md:top-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex gap-2 w-max px-2 md:px-0">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold border whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary border-transparent text-on-primary shadow-md shadow-primary/10'
                  : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Components listing */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredComponents.length > 0 ? (
          filteredComponents.map((comp) => {
            const isSaved = savedIds.includes(comp.id);
            const isCopied = copiedId === comp.id;

            return (
              <article key={comp.id} className="bg-surface-container/70 border border-outline-variant rounded-2xl overflow-hidden shadow-xl flex flex-col space-y-4 p-5 hover:border-primary/50 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/60 font-mono text-[9px] text-primary uppercase">{comp.category}</span>
                      <span className="text-[10px] font-mono text-on-surface-variant/70">ID: {comp.id}</span>
                    </div>
                    <h3 className="font-headline-md text-base font-bold text-on-surface tracking-tight mt-1">{comp.title}</h3>
                  </div>
                  <button onClick={() => { onToggleSave(comp.id); addToast(isSaved ? 'Removed from saved' : 'Saved to workspace', 'info'); }}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all ${isSaved ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-high border-outline-variant/40 text-on-surface-variant hover:text-primary'}`}>
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                <p className="font-sans text-xs text-on-surface-variant/80 font-light leading-relaxed">{comp.description}</p>

                {/* Visual / Live Preview toggle */}
                <div className="relative">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl min-h-[140px] relative select-none overflow-hidden">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-outline/50 flex items-center gap-1">
                        <Terminal className="h-2.5 w-2.5" />
                        {livePreview === comp.id ? 'LIVE PREVIEW' : 'STATIC PREVIEW'}
                      </span>
                      <button onClick={() => setLivePreview(livePreview === comp.id ? null : comp.id)}
                        className="p-1 rounded bg-surface-container/60 border border-outline-variant/30 text-on-surface-variant/60 hover:text-primary transition-all">
                        {livePreview === comp.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>

                    {livePreview === comp.id ? (
                      <iframe srcdoc={comp.code} title={comp.id} className="w-full h-[180px] border-none" sandbox="allow-scripts" />
                    ) : (
                      <div className="p-6 flex items-center justify-center min-h-[140px]">
                        {comp.id === 'glass-btn' && (
                          <button className="relative px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-slate-200 shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95">Interactive Glass</button>
                        )}
                        {comp.id === 'glowing-card' && (
                          <div className="p-5 bg-slate-900/40 border border-slate-800/85 rounded-xl space-y-2.5 text-left w-full max-w-xs hover:border-[#adc6ff] hover:shadow-[0_0_15px_rgba(173,198,255,0.12)] transition-all cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-500 font-mono">NODE_CLUSTER_01</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <h4 className="text-sm font-bold text-white tracking-tight">Ingress Gateway</h4>
                            <p className="text-[11px] text-slate-400 font-light">Router forwarding client packaging handshake packets.</p>
                          </div>
                        )}
                        {comp.id === 'sidebar-nav' && (
                          <div className="w-14 bg-slate-950 border border-slate-900 rounded-lg py-4 flex flex-col items-center justify-between shadow-lg">
                            <div className="h-6 w-6 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[10px]">C</div>
                            <div className="h-3 w-3 bg-blue-500 rounded-full my-4" />
                          </div>
                        )}
                        {comp.id === 'animated-input' && (
                          <div className="space-y-1.5 w-full max-w-xs text-left">
                            <label className="text-[9px] font-mono font-medium text-slate-500 uppercase tracking-wider">Access Secret Key</label>
                            <input type="text" placeholder="cv_token_..." readOnly
                              className="w-full bg-slate-900/40 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white/80 placeholder-slate-600 focus:outline-none" />
                          </div>
                        )}
                        {comp.id === 'blur-overlay' && (
                          <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 shadow-xl text-left w-full max-w-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white">Ingress Action Secure</span>
                              <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-light">Authenticating Node connection parameters.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Code block */}
                <div className="relative group/code flex-1 flex flex-col min-w-0">
                  <div className="absolute top-2 right-2 opacity-80 group-hover/code:opacity-100 transition-opacity z-10">
                    <button onClick={() => handleCopyCode(comp)}
                      className="p-1 px-2.5 rounded bg-surface-container hover:bg-surface-container-highest text-[10px] font-mono font-bold text-on-surface-variant hover:text-primary border border-outline-variant flex items-center gap-1 shadow-md transition-colors">
                      {isCopied ? <><Check className="h-3 w-3 text-emerald-400" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Code</>}
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 bg-surface-container-lowest/70 border border-outline-variant/30 rounded-xl font-mono text-xs text-on-surface/90 text-left whitespace-pre select-all leading-relaxed max-h-[160px]">
                    <code>{comp.code}</code>
                  </pre>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center space-y-3 bg-surface-container/20 border border-dashed border-outline-variant rounded-2xl">
            <span className="text-xs font-mono text-on-surface-variant">NO_MATCHING_COMPONENTS</span>
            <p className="text-xs text-on-surface-variant/60 font-light">No developer component fragments found matching "{searchQuery}" under {activeCategory}.</p>
            <button onClick={() => setActiveCategory('All')} className="text-xs text-primary font-semibold hover:underline">Reset active filters</button>
          </div>
        )}
      </section>
    </div>
  );
}
