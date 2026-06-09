import { useState, useMemo } from 'react';
import { challenges as staticChallenges } from '../data';
import { Challenge, Difficulty } from '../types';
import { GraduationCap, ChevronRight, Play, CheckCircle, Clock, BarChart3, Sparkles, Search, ArrowUpDown } from 'lucide-react';

const diffColors: Record<Difficulty, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Beginner' },
  intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Intermediate' },
  advanced: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Advanced' },
};

export default function LearnView() {
  const [challenges] = useState<Challenge[]>(staticChallenges);
  const [activeDifficulty, setActiveDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'points' | 'popular'>('default');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('cv_challenges_completed') || '[]'); }
    catch { return []; }
  });

  const filtered = useMemo(() => {
    return [...challenges]
      .filter((c) => {
        if (activeDifficulty !== 'All' && c.difficulty !== activeDifficulty) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'points') return b.points - a.points;
        if (sortBy === 'popular') return (b.completed || 0) - (a.completed || 0);
        return 0;
      });
  }, [challenges, activeDifficulty, searchQuery, sortBy]);

  function markComplete(id: string) {
    const next = completedIds.includes(id) ? completedIds.filter((x) => x !== id) : [...completedIds, id];
    setCompletedIds(next);
    localStorage.setItem('cv_challenges_completed', JSON.stringify(next));
  }

  const totalPoints = challenges.filter((c) => completedIds.includes(c.id)).reduce((s, c) => s + c.points, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Learn & Practice
        </h1>
        <p className="text-xs text-on-surface-variant/70">Build real projects with hands-on coding challenges</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 bg-surface-container/40 border border-outline-variant/30 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <div><span className="text-xs font-bold text-on-surface">{completedIds.length}</span><span className="text-[10px] text-on-surface-variant/60 ml-1">/ {challenges.length} done</span></div>
        </div>
        <div className="flex-1 bg-surface-container/40 border border-outline-variant/30 rounded-xl p-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-400" />
          <div><span className="text-xs font-bold text-on-surface">{totalPoints}</span><span className="text-[10px] text-on-surface-variant/60 ml-1">points</span></div>
        </div>
        <div className="flex-1 bg-surface-container/40 border border-outline-variant/30 rounded-xl p-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-[10px] text-on-surface-variant/60">{100 - totalPoints} pts to next badge</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['All', 'beginner', 'intermediate', 'advanced'].map((d) => (
          <button key={d} onClick={() => setActiveDifficulty(d)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
              activeDifficulty === d ? 'bg-primary border-transparent text-on-primary' : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:border-primary/50'
            }`}>
            {d === 'All' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
          <Search className="h-3 w-3 text-on-surface-variant/40" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none text-[10px] text-on-surface w-24 focus:outline-none" />
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-lg px-2.5 py-1">
          <ArrowUpDown className="h-3 w-3 text-on-surface-variant/40" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent border-none text-[10px] text-on-surface focus:outline-none">
            <option value="default">Default</option><option value="points">Most Points</option><option value="popular">Popular</option>
          </select>
        </div>
      </div>

      {/* Challenge list */}
      <div className="space-y-2">
        {filtered.map((challenge) => {
          const dc = diffColors[challenge.difficulty];
          const done = completedIds.includes(challenge.id);
          return (
            <div key={challenge.id} className={`bg-surface-container/40 border rounded-xl p-4 transition-all hover:border-primary/40 ${done ? 'border-emerald-500/30' : 'border-outline-variant/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-on-surface">{challenge.title}</h3>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${dc.bg} ${dc.text}`}>{dc.label}</span>
                    {done && <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Done</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant/70">{challenge.description}</p>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-on-surface-variant/40">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {challenge.language}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {challenge.points} pts</span>
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {challenge.completed || 0} completed</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => markComplete(challenge.id)}
                    className={`p-2 rounded-lg transition-colors ${done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-container-higher text-on-surface-variant/40 hover:text-emerald-400'}`}
                    title={done ? 'Mark incomplete' : 'Mark complete'}>
                    <CheckCircle className={`h-4 w-4 ${done ? 'fill-emerald-400/20' : ''}`} />
                  </button>
                  <button onClick={() => setActiveChallenge(activeChallenge?.id === challenge.id ? null : challenge)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-all">
                    {activeChallenge?.id === challenge.id ? 'Close' : 'Start'}
                    <ChevronRight className={`h-3 w-3 transition-transform ${activeChallenge?.id === challenge.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded challenge detail */}
              {activeChallenge?.id === challenge.id && (
                <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-3 animate-fadeIn">
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-on-surface mb-2 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary" /> Instructions</h4>
                    <p className="text-xs text-on-surface-variant/80 whitespace-pre-wrap font-light leading-relaxed">{challenge.instructions}</p>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4">
                    <h4 className="text-[11px] font-bold text-on-surface mb-2 flex items-center gap-1.5"><Play className="h-3.5 w-3.5 text-primary" /> Starter Code</h4>
                    {challenge.starterCode ? (
                      <pre className="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-high/40 rounded-lg p-3 overflow-x-auto">{challenge.starterCode}</pre>
                    ) : (
                      <p className="text-xs text-on-surface-variant/40 italic">No starter code — build from scratch!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center border border-dashed border-outline-variant/30 rounded-xl">
            <GraduationCap className="h-6 w-6 text-on-surface-variant/20 mx-auto mb-2" />
            <p className="text-xs text-on-surface-variant/40">No challenges match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
