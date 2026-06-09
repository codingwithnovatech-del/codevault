import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from 'react';
import { Code, Square, Wrench, ArrowRight, Search } from 'lucide-react';
import { templates, componentsList } from '../data';
import { Tab } from '../types';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (tab: Tab) => void;
  onSearch: (q: string) => void;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  group: 'Templates' | 'Components' | 'Tools' | 'Pages';
  tab: Tab;
}

const toolsData = [
  { id: 'glass', name: 'Glassmorphism Lab', description: 'Fine-tune tactile translucent components' },
  { id: 'grid', name: 'Grid Layout Sizer', description: 'Graph columns & row arrays visually' },
  { id: 'regex', name: 'RegEx Inspector', description: 'Execute client-side regular expressions in real-time' },
];

const navPages: { id: string; title: string; description: string; tab: Tab }[] = [
  { id: 'home', title: 'Home', description: 'Overview & telemetry logs', tab: 'home' },
  { id: 'templates', title: 'Templates', description: 'Preassembled structures', tab: 'templates' },
  { id: 'components', title: 'Components', description: 'Raw visual fragments', tab: 'components' },
  { id: 'tools', title: 'Tools', description: 'Styling & layout systems', tab: 'tools' },
  { id: 'playground', title: 'Playground', description: 'Live code editor & preview', tab: 'playground' },
  { id: 'ai', title: 'AI Tools', description: 'Gemini-powered dev tools', tab: 'ai' },
  { id: 'profile', title: 'Profile', description: 'Stats, tokens & stars', tab: 'profile' },
  { id: 'support', title: 'Support', description: 'Community, docs & feedback', tab: 'support' },
];

export default function CommandPalette({ onClose, onNavigate, onSearch, addToast }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const templateResults: SearchResult[] = templates
      .filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        group: 'Templates' as const,
        tab: 'templates' as Tab,
      }));

    const componentResults: SearchResult[] = componentsList
      .filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        group: 'Components' as const,
        tab: 'components' as Tab,
      }));

    const toolResults: SearchResult[] = toolsData
      .filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .map(t => ({
        id: t.id,
        title: t.name,
        description: t.description,
        category: 'Tool',
        group: 'Tools' as const,
        tab: 'tools' as Tab,
      }));

    const pageResults: SearchResult[] = navPages
      .filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: 'Page',
        group: 'Pages' as const,
        tab: p.tab,
      }));

    return [...templateResults, ...componentResults, ...toolResults, ...pageResults];
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups: { label: string; items: SearchResult[] }[] = [];
    const order = ['Templates', 'Components', 'Tools', 'Pages'] as const;
    for (const label of order) {
      const items = results.filter(r => r.group === label);
      if (items.length > 0) groups.push({ label, items });
    }
    return groups;
  }, [results]);

  const flatResults = useMemo(() => results, [results]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll<HTMLElement>('[data-result-index]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        selectResult(flatResults[selectedIndex]);
      }
    }
  };

  const selectResult = (result: SearchResult) => {
    onSearch(query);
    onNavigate(result.tab);
    addToast(`Navigating to ${result.title}`, 'info');
    onClose();
  };

  let flatIndex = -1;
  const renderGroup = (group: { label: string; items: SearchResult[] }) => (
    <div key={group.label}>
      <div className="px-4 py-2 text-[10px] font-mono font-bold text-on-surface-variant/50 uppercase tracking-wider">
        {group.label}
      </div>
      {group.items.map((item) => {
        flatIndex++;
        const idx = flatIndex;
        const isSelected = idx === selectedIndex;
        const Icon = group.label === 'Templates' ? Code : group.label === 'Components' ? Square : group.label === 'Tools' ? Wrench : ArrowRight;

        return (
          <button
            key={`${group.label}-${item.id}`}
            data-result-index={idx}
            onMouseDown={() => selectResult(item)}
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
              isSelected
                ? 'bg-primary/10 text-on-surface'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              group.label === 'Templates' ? 'bg-primary/10 text-primary' :
              group.label === 'Components' ? 'bg-emerald-500/10 text-emerald-400' :
              group.label === 'Tools' ? 'bg-violet-500/10 text-violet-400' :
              'bg-amber-500/10 text-amber-400'
            }`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate">{item.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/60 shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant/50 truncate mt-0.5">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-surface-container border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20">
          <Search className="h-4 w-4 text-on-surface-variant/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search templates, components, tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant/40">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {query.trim() && results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-on-surface-variant/50">No results found</p>
              <p className="text-[10px] font-mono text-on-surface-variant/30 mt-1">Try a different search term</p>
            </div>
          ) : query.trim() ? (
            groupedResults.map(renderGroup)
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-on-surface-variant/50">Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
