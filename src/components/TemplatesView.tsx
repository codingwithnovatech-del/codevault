/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Eye, Copy, Star, Check, X, Shield, RefreshCw, ArrowUpDown, Filter as FilterIcon } from 'lucide-react';
import { templates as staticTemplates } from '../data';
import { Template } from '../types';
import { getTemplates as fetchDbTemplates } from '../lib/db';
import { copyToClipboard } from '../lib/utils';

interface TemplatesViewProps {
  searchQuery: string;
  onCopy: () => void;
  starredIds: string[];
  onToggleStar: (id: string) => void;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

type SortMode = 'default' | 'stars' | 'views' | 'newest';

function parseViewCount(v: string): number {
  const num = parseFloat(v);
  if (v.includes('k')) return num * 1000;
  if (v.includes('m')) return num * 1000000;
  return num;
}

export default function TemplatesView({
  searchQuery,
  onCopy,
  starredIds,
  onToggleStar,
  addToast
}: TemplatesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFramework, setActiveFramework] = useState<string>('All');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Interactive Live Preview simulator state
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [simulatorLatency, setSimulatorLatency] = useState<number>(14);
  const [simulatedLoad, setSimulatedLoad] = useState<number>(31.4);
  const [templates, setTemplates] = useState<Template[]>(staticTemplates);

  useEffect(() => {
    fetchDbTemplates().then((dbTemplates) => {
      if (!dbTemplates || dbTemplates.length === 0) return;
      const merged = [...staticTemplates];
      const existingIds = new Set(merged.map((t) => t.id));
      for (const t of dbTemplates) {
        if (existingIds.has(t.id)) {
          const idx = merged.findIndex((m) => m.id === t.id);
          merged[idx] = t;
        } else {
          merged.push(t);
        }
      }
      setTemplates(merged);
    }).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(templates.map((t) => t.category))];
  const frameworks = ['All', ...new Set(templates.map((t) => t.framework))];

  // Filter + sort templates
  const filteredTemplates = [...templates]
    .filter((template) => {
      const categoryMatches = activeCategory === 'All' || template.category === activeCategory;
      const frameworkMatches = activeFramework === 'All' || template.framework === activeFramework;
      const searchMatches =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.framework.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatches && frameworkMatches && searchMatches;
    })
    .sort((a, b) => {
      if (sortMode === 'stars') return b.stars - a.stars;
      if (sortMode === 'views') return parseViewCount(b.views) - parseViewCount(a.views);
      return 0;
    });

  const handleCopyCode = (template: Template) => {
    copyToClipboard(template.code);
    setCopiedId(template.id);
    onCopy();
    addToast(`${template.title} blueprint code copied!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadSimulatedLiveAction = () => {
    setSimulatorLatency(Math.floor(10 + Math.random() * 8));
    setSimulatedLoad(Number((25 + Math.random() * 15).toFixed(1)));
    addToast('Simulated node clusters synchronized successfully!', 'success');
  };

  return (
    <div id="templates-view" className="space-y-6 animate-fade-in text-left">
      {/* Sticky Filters Bar */}
      <section className="sticky top-[64px] md:top-0 z-20 bg-background/95 backdrop-blur-md border-b border-outline-variant/30 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 md:px-0">
          {/* Category chips */}
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border whitespace-nowrap active:scale-95 transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-primary border-transparent text-on-primary shadow-md shadow-primary/10'
                  : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
              }`}>
              {cat}
            </button>
          ))}

          <div className="w-px h-5 bg-outline-variant/40 shrink-0" />

          {/* Framework filter */}
          <div className="flex items-center gap-1.5 shrink-0 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
            <FilterIcon className="h-3 w-3 text-on-surface-variant/60 shrink-0" />
            <select value={activeFramework} onChange={(e) => setActiveFramework(e.target.value)}
              className="bg-transparent border-none text-[10px] font-mono text-on-surface focus:outline-none cursor-pointer pr-1">
              {frameworks.map((f) => <option key={f} value={f} className="bg-surface-container text-on-surface">{f}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 shrink-0 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
            <ArrowUpDown className="h-3 w-3 text-on-surface-variant/60 shrink-0" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent border-none text-[10px] font-mono text-on-surface focus:outline-none cursor-pointer pr-1">
              <option value="default" className="bg-surface-container text-on-surface">Default</option>
              <option value="stars" className="bg-surface-container text-on-surface">Most Stars</option>
              <option value="views" className="bg-surface-container text-on-surface">Most Views</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid listing */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const isStarred = starredIds.includes(template.id);
            const isCopied = copiedId === template.id;

            return (
              <article
                id={`template-card-${template.id}`}
                key={template.id}
                className="bg-surface-container/75 border border-outline-variant rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-primary/80 transition-all duration-300 transform"
              >
                {/* Visual Thumbnail — live preview on hover, gradient fallback */}
                <div className="aspect-video w-full relative overflow-hidden select-none group/thumb">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/30 transition-opacity duration-300 group-hover/thumb:opacity-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <div className="text-3xl">
                          {{
                            SaaS: '☁️', 'E-Commerce': '🛍️', Blogs: '📝',
                            'Social Media': '💬', Authentication: '🔐',
                            'Cloud/DevOps': '☁️', 'Chat/Messaging': '💭',
                            'AI/ML': '🤖', 'Mobile/Responsive': '📱',
                            'Real Estate': '🏠', Music: '🎵', Gaming: '🎮',
                            'Health/Fitness': '💪', Finance: '📈',
                            Travel: '✈️', Educational: '📚',
                            'Marketing Sites': '📢', Weather: '🌤️',
                            'News/Media': '📰', Collaboration: '👥',
                            Tools: '🔧', Entertainment: '🎬',
                            'Food/Restaurant': '🍽️', Documentation: '📄',
                            Dashboards: '📊', 'Landing Pages': '🚀',
                            Portfolios: '🎨'
                          }[template.category] || '📦'}
                        </div>
                        <p className="text-[10px] font-mono text-white/60">{template.title}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-white/70">{template.category}</div>
                  </div>
                  <iframe
                    srcDoc={template.code}
                    className="absolute inset-0 w-full h-full opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 pointer-events-none"
                    sandbox="allow-scripts"
                    title={`${template.id} preview`}
                    style={{ background: '#0f172a' }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    <button
                      id={`star-${template.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(template.id);
                      }}
                      className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                        isStarred
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-surface-container-low/60 border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60'
                      }`}
                      title={isStarred ? 'Starred' : 'Star template'}
                    >
                      <Star className={`h-4 w-4 ${isStarred ? 'fill-primary' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-surface-container-low/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-outline-variant/50 z-10">
                    <span className="font-sans text-[11px] font-bold text-primary">{template.framework}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-white/80 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 z-10">Live Preview</div>
                </div>

                {/* Content Box */}
                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70">
                        {template.category}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant/60">
                        by @{template.author}
                      </span>
                    </div>
                    
                    <h2 className="font-headline-md text-base font-bold text-on-surface leading-tight">
                      {template.title}
                    </h2>
                    
                    <p className="font-sans text-xs text-on-surface-variant/80 font-light leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-auto flex gap-2 pt-2 border-t border-outline-variant/20">
                    {/* Live Preview Eyeball Trigger */}
                    <button
                      id={`preview-trigger-${template.id}`}
                      onClick={() => {
                        setPreviewTemplate(template);
                        addToast(`Entering interactive live sandbox device preview`, 'info');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl border border-outline-variant bg-surface-container/50 hover:bg-surface-container-highest hover:border-primary/50 text-center font-sans text-xs font-semibold flex items-center justify-center gap-1.5 text-on-surface transition-all active:scale-95 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Live Preview
                    </button>

                    {/* Copy Code */}
                    <button
                      id={`copy-trigger-${template.id}`}
                      onClick={() => handleCopyCode(template)}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-center font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(173,198,255,0.15)]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-on-primary" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center space-y-3 bg-surface-container/20 border border-dashed border-outline-variant rounded-2xl">
            <span className="text-xs font-mono text-on-surface-variant">NO_MATCHING_BLUEPRINTS</span>
            <p className="text-xs text-on-surface-variant/60 font-light">
              No developer blueprints found matching "{searchQuery}" under {activeCategory}.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Reset active filters
            </button>
          </div>
        )}
      </section>

      {/* LIVE SIMULATOR DEVICE PREVIEW MODAL */}
      {previewTemplate && (
        <div id="simulator-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px] md:h-[650px] animate-fade-in">
            {/* Top Device Status Bar */}
            <header className="bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-on-surface-variant/70 ml-2">Sandbox Simulator 1.2 — {previewTemplate.framework} App</span>
              </div>
              <button
                id="close-simulator"
                onClick={() => setPreviewTemplate(null)}
                className="hover:bg-surface-container-highest text-on-surface-variant hover:text-primary p-1 rounded-lg transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            {/* Simulated Live URL Bar */}
            <div className="bg-surface-container-high/55 border-b border-outline-variant/60 px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">HTTPS Secure</span>
              </div>
              <div className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-md px-3 py-1 font-mono text-[10px] text-on-surface-variant/80 text-left select-all truncate">
                codevault-dev-sandbox-{previewTemplate.id}.run.app
              </div>
              <button 
                onClick={loadSimulatedLiveAction}
                className="hover:bg-surface-container-highest hover:text-primary p-1 rounded transition-colors text-on-surface-variant"
                title="Synchronize sandbox nodes"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

              {/* Simulator Live Screen Sandbox viewport (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 flex flex-col space-y-6">
              
              {(
                <iframe
                  srcDoc={previewTemplate.code}
                  title="Live Preview"
                  className="w-full flex-1 min-h-[400px] rounded-xl border border-slate-800 bg-white"
                  sandbox="allow-scripts"
                />
              )}
              {false && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{previewTemplate.category} Preview</h4>
                    <span className="text-lg font-bold text-white tracking-tight">{previewTemplate.title}</span>
                  </div>
                  <div className="text-xs font-mono text-right bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <span className="text-blue-400">Latency: {simulatorLatency}ms</span>
                    <br />
                    <span className="text-emerald-400">CPU Stream: {simulatedLoad}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Interactive wireframe mock containing simulated actions & UI parameters:
                </p>

                {/* Render corresponding simulated responsive visuals based on template ID */}
                {previewTemplate.category === 'Dashboards' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">CLUSTER_LOAD</span>
                        <h5 className="text-xl font-mono font-bold text-white">12.4 GB/s</h5>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full w-[65%]" />
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">PACKET_LOSS</span>
                        <h5 className="text-xl font-mono font-bold text-emerald-400">0.00%</h5>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[100%]" />
                        </div>
                      </div>
                    </div>
                    {/* Simple graph element */}
                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">TELEMETRY_FLOW_RATE</span>
                      <div className="flex items-end gap-1.5 h-16 pt-2">
                        {[15, 30, 45, 20, 60, 80, 50, 40, 75, 95, 60, 42, 58].map((val, idx) => (
                          <div key={idx} className="flex-1 bg-gradient-to-t from-blue-900 to-blue-400 rounded-sm" style={{ height: `${val}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {previewTemplate.category === 'Landing Pages' && (
                  <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center space-y-4">
                    <span className="inline-flex px-2 py-0.5 bg-blue-500/10 text-[9px] font-mono border border-blue-500/20 text-blue-400 rounded-full">v1.2 Release</span>
                    <h4 className="text-xl font-bold text-white tracking-tight leading-none">Infinite Network Elasticity</h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                      Auto-provision containers, encrypt cloud parameters, synchronize client logs effortlessly.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button className="bg-blue-500 text-slate-950 font-bold text-[10px] py-1.5 px-3.5 rounded-lg">Deploy Engine</button>
                      <button className="bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[10px] py-1.5 px-3.5 rounded-lg">Read Docs</button>
                    </div>
                  </div>
                )}

                {previewTemplate.category === 'Portfolios' && (
                  <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 font-mono text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Alex Rivera</span>
                      <span className="text-[10px] text-slate-500">Tokyo, JP</span>
                    </div>
                    <div className="space-y-2 border-t border-slate-800/80 pt-3">
                      {[
                        { name: 'hyperscale-routing', lines: '+12.4k' },
                        { name: 'tail-trace', lines: '+4.9k' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-emerald-400 font-bold">{item.lines}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewTemplate.category === 'SaaS' && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Subscription</span>
                        <span className="text-xs font-bold text-emerald-400">Active</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Pro Plan</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">$29</span>
                        <span className="text-xs text-slate-400">/month</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        {['Unlimited projects', 'Team members', 'Priority support'].map(f => (
                          <div key={f} className="flex items-center gap-2"><span className="text-emerald-400">&#10003;</span>{f}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {['E-Commerce', 'Blogs', 'Social Media', 'Authentication', 'Cloud/DevOps', 'Chat/Messaging', 'AI/ML', 'Mobile/Responsive', 'Real Estate', 'Music', 'Gaming', 'Health/Fitness', 'Finance', 'Travel', 'Educational', 'Marketing Sites', 'Weather', 'News/Media', 'Collaboration', 'Tools', 'Entertainment', 'Food/Restaurant', 'Documentation'].includes(previewTemplate.category) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="h-16 bg-slate-800/60 rounded-lg flex items-center justify-center text-2xl">
                        {previewTemplate.category === 'E-Commerce' && '🛍️'}
                        {previewTemplate.category === 'Blogs' && '📝'}
                        {previewTemplate.category === 'Social Media' && '💬'}
                        {previewTemplate.category === 'Authentication' && '🔐'}
                        {previewTemplate.category === 'Cloud/DevOps' && '☁️'}
                        {previewTemplate.category === 'Chat/Messaging' && '💭'}
                        {previewTemplate.category === 'AI/ML' && '🤖'}
                        {previewTemplate.category === 'Mobile/Responsive' && '📱'}
                        {previewTemplate.category === 'Real Estate' && '🏠'}
                        {previewTemplate.category === 'Music' && '🎵'}
                        {previewTemplate.category === 'Gaming' && '🎮'}
                        {previewTemplate.category === 'Health/Fitness' && '💪'}
                        {previewTemplate.category === 'Finance' && '📈'}
                        {previewTemplate.category === 'Travel' && '✈️'}
                        {previewTemplate.category === 'Educational' && '📚'}
                        {previewTemplate.category === 'Marketing Sites' && '📢'}
                        {previewTemplate.category === 'Weather' && '🌤️'}
                        {previewTemplate.category === 'News/Media' && '📰'}
                        {previewTemplate.category === 'Collaboration' && '👥'}
                        {previewTemplate.category === 'Tools' && '🔧'}
                        {previewTemplate.category === 'Entertainment' && '🎬'}
                        {previewTemplate.category === 'Food/Restaurant' && '🍽️'}
                        {previewTemplate.category === 'Documentation' && '📄'}
                        {!['E-Commerce', 'Blogs', 'Social Media', 'Authentication', 'Cloud/DevOps', 'Chat/Messaging', 'AI/ML', 'Mobile/Responsive', 'Real Estate', 'Music', 'Gaming', 'Health/Fitness', 'Finance', 'Travel', 'Educational', 'Marketing Sites', 'Weather', 'News/Media', 'Collaboration', 'Tools', 'Entertainment', 'Food/Restaurant', 'Documentation'].includes(previewTemplate.category) && '📦'}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{previewTemplate.category}</span>
                      <h5 className="text-sm font-bold text-white truncate">{previewTemplate.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{previewTemplate.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Framework</span>
                        <p className="text-xs font-semibold text-white mt-1">{previewTemplate.framework}</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Author</span>
                        <p className="text-xs font-semibold text-white mt-1">{previewTemplate.author}</p>
                      </div>
                      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Stars</span>
                        <p className="text-xs font-bold text-amber-400 mt-1">{previewTemplate.stars}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Action buttons embedded inside screen simulator */}
              <div className="pt-4 border-t border-slate-800 mt-auto flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => handleCopyCode(previewTemplate)}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Acquire Template Code Fragment
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 rounded-xl text-xs transition-colors duration-200"
                >
                  Conclude Preview
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
