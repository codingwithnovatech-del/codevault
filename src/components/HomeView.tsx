import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trophy, Cpu, Code2, ArrowRight, Zap, Copy, Check, Wrench, TrendingUp, Sparkles, Star, Eye, Download, Grid3X3, Flame, Clock, Compass, Shield } from 'lucide-react';
import { templates, componentsList } from '../data';
import { Tab } from '../types';
import { copyToClipboard } from '../lib/utils';

interface HomeViewProps {
  onNavigate: (tab: Tab) => void;
  onSearch: (query: string) => void;
  copiesCount: number;
  starsCount: number;
  apiTokensCount: number;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

export default function HomeView({
  onNavigate,
  onSearch,
  copiesCount,
  starsCount,
  apiTokensCount,
  addToast
}: HomeViewProps) {
  const [searchVal, setSearchVal] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState<'all' | 'templates' | 'components'>('all');

  const topTemplates = useMemo(() => [...templates].sort((a, b) => b.stars - a.stars).slice(0, 4), []);
  const topComponents = useMemo(() => [...componentsList].slice(0, 4), []);

  const searchResults = useMemo(() => {
    if (!searchVal.trim()) return [];
    const q = searchVal.toLowerCase();
    return [
      ...templates.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).map(t => ({ ...t, type: 'template' as const })),
      ...componentsList.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).map(c => ({ ...c, type: 'component' as const })),
    ].slice(0, 6);
  }, [searchVal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal);
      setShowSearchResults(false);
      const hasTemplates = templates.some(t => t.title.toLowerCase().includes(searchVal.toLowerCase()));
      onNavigate(hasTemplates ? 'templates' : 'components');
      addToast(`Searching for "${searchVal}"`, 'info');
    }
  };

  const quickNavigate = (tab: Tab, msg: string) => {
    onNavigate(tab);
    addToast(msg, 'info');
  };

  const totalEvents = copiesCount + starsCount + apiTokensCount;

  const statCards = [
    { label: 'Code Copies', value: copiesCount, icon: Copy, accent: 'blue' },
    { label: 'Starred', value: starsCount, icon: Star, accent: 'amber' },
    { label: 'API Tokens', value: apiTokensCount, icon: Code2, accent: 'emerald' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.aclib) {
        try { aclib.runInPagePush({ zoneId: '11410646', maxAds: 2 }); } catch {}
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = activeQuickTab === 'all'
    ? [...topTemplates.map(t => ({ ...t, type: 'template' as const })), ...topComponents.map(c => ({ ...c, type: 'component' as const }))]
    : activeQuickTab === 'templates' ? topTemplates.map(t => ({ ...t, type: 'template' as const }))
    : topComponents.map(c => ({ ...c, type: 'component' as const }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero + Search */}
      <section className="relative p-6 md:p-8 rounded-2xl border border-outline-variant/20 overflow-hidden bg-gradient-to-br from-surface-container/50 via-primary/5 to-surface-container-lowest/80">
        <div className="absolute top-[-30%] right-[-5%] w-96 h-96 bg-primary/8 rounded-full blur-[100px]" />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-mono font-semibold text-primary tracking-wider uppercase">Developer Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight leading-tight">
            Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ready-to-use</span> components
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <div className="flex items-center gap-2 bg-surface-container-low/90 border border-outline-variant/50 rounded-xl p-1.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Search className="h-4 w-4 text-on-surface-variant/40 ml-3 shrink-0" />
              <input type="text" placeholder="Search templates, components, tools..." value={searchVal}
                onChange={(e) => { setSearchVal(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0" />
              <button type="submit" className="bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs py-1.5 px-4 rounded-lg transition-all active:scale-95">Go</button>
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-surface-container border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.map((r) => (
                  <button key={`${r.type}-${r.id}`} onMouseDown={() => { onSearch(searchVal); onNavigate(r.type === 'template' ? 'templates' : 'components'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-highest transition-colors border-b border-outline-variant/10 last:border-0">
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${r.type === 'template' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {r.type === 'template' ? 'T' : 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-on-surface truncate">{r.title}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant/50 truncate">{r.type} - {'category' in r ? r.category : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-3 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          const sBg = s.accent === 'blue' ? 'bg-blue-500/10' : s.accent === 'amber' ? 'bg-amber-500/10' : 'bg-emerald-500/10';
          const sBorder = s.accent === 'blue' ? 'border-blue-500/20' : s.accent === 'amber' ? 'border-amber-500/20' : 'border-emerald-500/20';
          const sColor = s.accent === 'blue' ? 'text-blue-400' : s.accent === 'amber' ? 'text-amber-400' : 'text-emerald-400';
          return (
            <div key={s.label} className={`${sBg} ${sBorder} border rounded-xl p-4 text-left`}>
              <Icon className={`h-4 w-4 ${sColor} mb-2`} />
              <p className="text-lg font-bold text-on-surface font-mono">{s.value}</p>
              <p className="text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </section>

      {/* Quick Access Tabs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-on-surface tracking-tight">Quick Access</h2>
          </div>
          <div className="flex gap-1 bg-surface-container-lowest/50 border border-outline-variant/20 rounded-lg p-0.5">
            {(['all', 'templates', 'components'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveQuickTab(tab)}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${activeQuickTab === tab ? 'bg-surface-container shadow-sm text-on-surface' : 'text-on-surface-variant/50 hover:text-on-surface'}`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.slice(0, 6).map((item) => (
            <div key={`${item.type}-${item.id}`} onClick={() => quickNavigate(item.type === 'template' ? 'templates' : 'components', `Opening ${item.title}`)}
              className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-3.5 hover:border-primary/50 hover:bg-surface-container/40 transition-all cursor-pointer group flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${item.type === 'template' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {item.type === 'template' ? 'T' : 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">{item.title}</h4>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5 line-clamp-1">
                  {'framework' in item ? `${item.category} - ${item.framework}` : 'category' in item ? item.category : ''}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant/30 group-hover:text-primary transition-all shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Templates */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-on-surface tracking-tight">Trending Templates</h2>
          <span className="text-[10px] font-mono text-on-surface-variant/40">Top by stars</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {topTemplates.map((t) => (
            <div key={t.id} onClick={() => quickNavigate('templates', `Viewing ${t.title}`)}
              className="bg-surface-container/15 border border-outline-variant/20 rounded-xl p-3.5 hover:border-primary/50 transition-all cursor-pointer group space-y-2">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">{t.title}</p>
                <div className="flex items-center gap-0.5 text-[10px] font-mono text-amber-400 shrink-0 ml-1">
                  <Star className="h-2.5 w-2.5 fill-amber-400/60" /> {t.stars}
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/60 line-clamp-1">{t.category} - {t.framework}</p>
              <div className="flex items-center justify-between text-[9px] font-mono text-on-surface-variant/40 pt-1 border-t border-outline-variant/10">
                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{t.views}</span>
                <span>{t.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { tab: 'templates' as Tab, label: 'Templates', desc: 'Full page layouts', icon: Trophy, accent: 'primary' },
          { tab: 'components' as Tab, label: 'Components', desc: 'UI fragments', icon: Code2, accent: 'emerald' },
          { tab: 'tools' as Tab, label: 'Tools', desc: 'Dev utilities', icon: Wrench, accent: 'violet' },
        ].map((n) => {
          const Icon = n.icon;
          const nBg = n.accent === 'primary' ? 'bg-primary/10' : n.accent === 'emerald' ? 'bg-emerald-500/10' : 'bg-violet-500/10';
          const nColor = n.accent === 'primary' ? 'text-primary' : n.accent === 'emerald' ? 'text-emerald-400' : 'text-violet-400';
          return (
            <button key={n.tab} onClick={() => onNavigate(n.tab)}
              className={`${nBg} border border-outline-variant/20 rounded-xl p-4 text-left hover:border-primary/50 transition-all active:scale-[0.98]`}>
              <Icon className={`h-5 w-5 ${nColor} mb-2`} />
              <p className="text-sm font-semibold text-on-surface">{n.label}</p>
              <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{n.desc}</p>
            </button>
          );
        })}
      </section>

      {/* Trust Section */}
      <section className="bg-surface-container/15 border border-outline-variant/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-on-surface tracking-tight">Trusted & Secure</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', label: 'SSL Encrypted', desc: '256-bit encryption on all data in transit' },
            { icon: '🛡️', label: 'Privacy First', desc: 'Your code is yours — we never share or sell data' },
            { icon: '📂', label: 'Open Source', desc: 'Fully auditable codebase on GitHub' },
            { icon: '🔐', label: 'Secure Auth', desc: 'Supabase Auth with email & OAuth providers' },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <span className="text-lg">{item.icon}</span>
              <h4 className="text-xs font-semibold text-on-surface">{item.label}</h4>
              <p className="text-[10px] text-on-surface-variant/60 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/40">
          <Compass className="h-3 w-3" /> {totalEvents} total events
        </div>
        <div className="flex gap-2">
          <button onClick={() => { copyToClipboard(`CodeVault - Copies: ${copiesCount}, Stars: ${starsCount}`); setCopiedSummary(true); addToast('Copied!', 'success'); setTimeout(() => setCopiedSummary(false), 2000); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] text-on-surface-variant hover:bg-surface-container transition-all">
            {copiedSummary ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} Copy Stats
          </button>
          <button onClick={() => { const blob = new Blob([JSON.stringify({ copiesCount, starsCount, apiTokensCount, date: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'codevault-stats.json'; a.click(); addToast('Stats exported!', 'success'); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold hover:bg-primary/20 transition-all">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>
    </div>
  );
}
