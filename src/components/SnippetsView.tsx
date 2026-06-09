import { useState, useMemo } from 'react';
import { snippets as staticSnippets, challenges as staticChallenges } from '../data';
import { Snippet } from '../types';
import { Code, Search, ChevronDown, Copy, Check, Star, ArrowUpDown, Plus, X, Trash2 } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';

const languages = ['All', 'JavaScript', 'CSS', 'React', 'HTML/CSS', 'TypeScript'];

export default function SnippetsView() {
  const [snippets, setSnippets] = useState<Snippet[]>(staticSnippets);
  const [activeLang, setActiveLang] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', code: '', language: 'JavaScript', tags: '' });

  const filtered = useMemo(() => {
    return [...snippets]
      .filter((s) => {
        if (activeLang !== 'All' && s.language !== activeLang) return false;
        if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.tags.some((t) => t.includes(searchQuery.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.upvotes - a.upvotes;
      });
  }, [snippets, activeLang, searchQuery, sortBy]);

  function handleCopy(code: string, id: string) {
    copyToClipboard(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleUpvote(id: string) {
    setSnippets((prev) => prev.map((s) => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s));
  }

  function handleSubmit() {
    if (!submitForm.title || !submitForm.code) return;
    const newSnippet: Snippet = {
      id: `snippet-${Date.now()}`,
      title: submitForm.title,
      description: submitForm.description,
      code: submitForm.code,
      language: submitForm.language,
      tags: submitForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      userId: 'user',
      username: 'You',
      upvotes: 0,
      createdAt: 'just now',
    };
    setSnippets((prev) => [newSnippet, ...prev]);
    setShowSubmit(false);
    setSubmitForm({ title: '', description: '', code: '', language: 'JavaScript', tags: '' });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Code Snippets
          </h1>
          <p className="text-xs text-on-surface-variant/70">Reusable code fragments shared by the community</p>
        </div>
        <button onClick={() => setShowSubmit(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10">
          <Plus className="h-3.5 w-3.5" />
          Share
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {languages.map((l) => (
          <button key={l} onClick={() => setActiveLang(l)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
              activeLang === l ? 'bg-primary border-transparent text-on-primary' : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:border-primary/50'
            }`}>{l}</button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
          <Search className="h-3 w-3 text-on-surface-variant/40" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tags..." className="bg-transparent border-none text-[10px] text-on-surface w-24 focus:outline-none" />
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
          <ArrowUpDown className="h-3 w-3 text-on-surface-variant/40" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent border-none text-[10px] text-on-surface focus:outline-none">
            <option value="popular">Popular</option><option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Snippet list */}
      <div className="space-y-3">
        {filtered.map((snippet) => (
          <div key={snippet.id} className="bg-surface-container/40 border border-outline-variant/30 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-on-surface">{snippet.title}</h3>
                    <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{snippet.language}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">{snippet.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleUpvote(snippet.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-higher text-on-surface-variant/60 hover:text-amber-400 text-[10px] transition-colors">
                    <Star className="h-3 w-3" /> {snippet.upvotes}
                  </button>
                </div>
              </div>
              <pre className="bg-surface-container-high/40 border border-outline-variant/20 rounded-lg p-3 text-[11px] font-mono overflow-x-auto text-on-surface-variant/80 leading-relaxed">{snippet.code}</pre>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/40">
                  <span>by {snippet.username}</span>
                  <span>·</span>
                  <span>{snippet.createdAt}</span>
                  {snippet.tags.length > 0 && (
                    <span className="flex items-center gap-1 ml-2">
                      {snippet.tags.map((t) => <span key={t} className="bg-surface-container-higher px-1.5 py-0.5 rounded text-[9px]">#{t}</span>)}
                    </span>
                  )}
                </div>
                <button onClick={() => handleCopy(snippet.code, snippet.id)}
                  className="flex items-center gap-1 text-[10px] text-on-surface-variant/40 hover:text-primary transition-colors">
                  {copiedId === snippet.id ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center border border-dashed border-outline-variant/30 rounded-xl">
            <Code className="h-6 w-6 text-on-surface-variant/20 mx-auto mb-2" />
            <p className="text-xs text-on-surface-variant/40">No snippets found</p>
          </div>
        )}
      </div>

      {/* Submit snippet modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2"><Code className="h-4 w-4 text-primary" /> Share Snippet</h3>
              <button onClick={() => setShowSubmit(false)} className="p-1 hover:text-primary rounded"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title *" value={submitForm.title} onChange={e => setSubmitForm({...submitForm, title: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
              <input placeholder="Description" value={submitForm.description} onChange={e => setSubmitForm({...submitForm, description: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
              <div className="flex gap-2">
                <select value={submitForm.language} onChange={e => setSubmitForm({...submitForm, language: e.target.value})} className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none">
                  <option>JavaScript</option><option>CSS</option><option>React</option><option>HTML/CSS</option><option>TypeScript</option>
                </select>
                <input placeholder="Tags (comma-separated)" value={submitForm.tags} onChange={e => setSubmitForm({...submitForm, tags: e.target.value})} className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
              </div>
              <textarea placeholder="Paste your code here *" value={submitForm.code} onChange={e => setSubmitForm({...submitForm, code: e.target.value})} rows={6} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:border-primary/60" />
              <button onClick={handleSubmit} disabled={!submitForm.title || !submitForm.code}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all disabled:opacity-40">
                Share Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
