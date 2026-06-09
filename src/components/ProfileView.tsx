import React, { useState, useRef } from 'react';
import { Key, Star, Trash2, Plus, Terminal, Check, Copy, User, LogOut, Sun, Moon, Edit3, X, Save, AtSign, Briefcase, Quote, Camera, Trophy } from 'lucide-react';
import { templates, componentsList, badges as staticBadges } from '../data';
import { ApiToken, DeveloperProfile, Template, ComponentAsset, Badge } from '../types';
import { useTheme } from '../lib/theme';
import { copyToClipboard } from '../lib/utils';

interface ProfileViewProps {
  profile: DeveloperProfile;
  onUpdateProfile: (updated: DeveloperProfile) => void;
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
  signOut?: () => Promise<void>;
}

export default function ProfileView({
  profile,
  onUpdateProfile,
  addToast,
  signOut
}: ProfileViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [newTokenName, setNewTokenName] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [title, setTitle] = useState(profile.title);
  const [bio, setBio] = useState(profile.bio);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { addToast('Image must be under 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProfile({ ...profile, avatar: reader.result as string });
      addToast('Avatar updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const starredTemplates: Template[] = templates.filter(t => profile.savedTemplates.includes(t.id));
  const savedComponents: ComponentAsset[] = componentsList.filter(c => profile.savedComponents.includes(c.id));

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      addToast('Enter a name for the token', 'error');
      return;
    }
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randStr = '';
    for (let i = 0; i < 22; i++) randStr += chars.charAt(Math.floor(Math.random() * chars.length));
    const newKey: ApiToken = {
      id: `token_${Date.now()}`,
      name: newTokenName.trim(),
      token: `cv_token_${randStr}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    onUpdateProfile({ ...profile, apiTokens: [...profile.apiTokens, newKey] });
    setNewTokenName('');
    addToast(`Token "${newKey.name}" generated!`, 'success');
  };

  const handleDeleteToken = (id: string, name: string) => {
    onUpdateProfile({ ...profile, apiTokens: profile.apiTokens.filter(t => t.id !== id) });
    addToast(`Token "${name}" deleted`, 'info');
  };

  const handleCopyTokenValue = (token: ApiToken) => {
    copyToClipboard(token.token);
    setCopiedTokenId(token.id);
    addToast('Token copied!', 'success');
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleSaveProfile = () => {
    if (!username.trim()) { addToast('Username required', 'error'); return; }
    onUpdateProfile({ ...profile, username: username.trim(), title: title.trim(), bio: bio.trim() });
    setIsEditing(false);
    addToast('Profile updated!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Profile Header */}
      <section className="p-6 rounded-2xl border border-outline-variant/20 bg-gradient-to-br from-surface-container/40 via-primary/5 to-surface-container-lowest/80">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-surface-container-highest border border-primary/20 p-0.5 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">{profile.username.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          <div className="flex-1 min-w-0 w-full">
            {isEditing ? (
              <div className="space-y-2.5 max-w-md">
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 focus-within:border-primary/60">
                  <AtSign className="h-3.5 w-3.5 text-on-surface-variant/40" />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username"
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" />
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 focus-within:border-primary/60">
                  <Briefcase className="h-3.5 w-3.5 text-on-surface-variant/40" />
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" />
                </div>
                <div className="flex items-start gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 focus-within:border-primary/60">
                  <Quote className="h-3.5 w-3.5 text-on-surface-variant/40 mt-1 shrink-0" />
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Bio"
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:bg-surface-container transition-all"><X className="h-3.5 w-3.5" /> Cancel</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95"><Save className="h-3.5 w-3.5" /> Save</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-on-surface tracking-tight">@{profile.username}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{profile.title || 'Developer'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 font-light max-w-md">{profile.bio || 'No bio set'}</p>
                </div>
                <button onClick={() => { setUsername(profile.username); setTitle(profile.title); setBio(profile.bio); setIsEditing(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all shrink-0"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Saved Items */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-on-surface-variant tracking-wider uppercase flex items-center gap-2"><Star className="h-3.5 w-3.5 text-amber-400" /> Starred ({starredTemplates.length})</h3>
          {starredTemplates.length > 0 ? (
            <div className="space-y-2">
              {starredTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 hover:border-primary/30 transition-all">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-on-surface truncate">{t.title}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{t.category} - {t.framework}</p>
                  </div>
                  <button onClick={() => { copyToClipboard(t.code); addToast(`${t.title} copied!`, 'success'); }}
                    className="p-1.5 rounded-lg hover:bg-surface-container-higher text-on-surface-variant hover:text-primary transition-colors shrink-0"><Copy className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant/50 py-4 text-center italic">No starred templates yet</p>
          )}
        </div>

        <div className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold text-on-surface-variant tracking-wider uppercase flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-emerald-400" /> Saved ({savedComponents.length})</h3>
          {savedComponents.length > 0 ? (
            <div className="space-y-2">
              {savedComponents.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 hover:border-primary/30 transition-all">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-on-surface truncate">{c.title}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{c.category}</p>
                  </div>
                  <button onClick={() => { copyToClipboard(c.code); addToast(`${c.title} copied!`, 'success'); }}
                    className="p-1.5 rounded-lg hover:bg-surface-container-higher text-on-surface-variant hover:text-primary transition-colors shrink-0"><Copy className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant/50 py-4 text-center italic">No saved components yet</p>
          )}
        </div>
      </section>

      {/* API Tokens */}
      <section className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface tracking-tight flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> API Tokens</h3>
            <p className="text-[11px] text-on-surface-variant/60">Generate tokens for API access</p>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant/40">{profile.apiTokens.length} active</span>
        </div>

        <form onSubmit={handleGenerateToken} className="flex gap-2">
          <input type="text" placeholder="Token name..." value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)}
            className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary/60" />
          <button type="submit" className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 shrink-0"><Plus className="h-3.5 w-3.5" /> Generate</button>
        </form>

        <div className="space-y-2">
          {profile.apiTokens.length > 0 ? (
            profile.apiTokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 gap-3 hover:border-primary/30 transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-on-surface">{token.name}</p>
                  <p className="text-[10px] font-mono text-primary truncate select-all">{token.token}</p>
                  <p className="text-[9px] font-mono text-on-surface-variant/40">Created {token.createdAt} - {token.lastUsed}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleCopyTokenValue(token)}
                    className={`p-1.5 rounded-lg border border-outline-variant/20 transition-all ${copiedTokenId === token.id ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-surface-container/40 text-on-surface-variant hover:text-primary hover:bg-surface-container-higher'}`}>
                    {copiedTokenId === token.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button onClick={() => handleDeleteToken(token.id, token.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 border border-dashed border-outline-variant/20 rounded-lg text-center">
              <p className="text-[10px] font-mono text-on-surface-variant/40">No tokens yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Badges Section */}
      <section className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-on-surface">Badges & Achievements</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {staticBadges.map((badge) => {
            const earned = profile.savedTemplates.length >= 5 && badge.id === 'badge-2'
              || profile.stats.starsCount >= 1 && badge.id === 'badge-1'
              || profile.savedTemplates.length >= 1 && badge.id === 'badge-4';
            return (
              <div key={badge.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                earned ? 'bg-amber-500/10 border-amber-500/30 text-on-surface' : 'bg-surface-container-high/20 border-outline-variant/20 text-on-surface-variant/40'
              }`}>
                <span className="text-sm">{badge.icon}</span>
                <div>
                  <p className={`text-[11px] font-semibold ${earned ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>{badge.name}</p>
                  <p className={`text-[9px] ${earned ? 'text-on-surface-variant/60' : 'text-on-surface-variant/30'}`}>{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Appearance + Sign Out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-400" />}
            <div>
              <p className="text-xs font-semibold text-on-surface">Appearance</p>
              <p className="text-[10px] text-on-surface-variant/60 capitalize">{theme} mode</p>
            </div>
          </div>
          <button onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all active:scale-95">
            Toggle
          </button>
        </section>

        {signOut && (
          <section className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4 text-rose-400" />
              <div>
                <p className="text-xs font-semibold text-on-surface">Sign Out</p>
                <p className="text-[10px] text-on-surface-variant/60">Logout from workspace</p>
              </div>
            </div>
            {showSignOutConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-rose-400 font-mono">Confirm?</span>
                <button onClick={() => { signOut(); }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-semibold hover:bg-rose-600 transition-all active:scale-95">Yes</button>
                <button onClick={() => setShowSignOutConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] text-on-surface-variant hover:bg-surface-container transition-all">No</button>
              </div>
            ) : (
              <button onClick={() => setShowSignOutConfirm(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 text-[10px] hover:bg-rose-500/10 transition-all active:scale-95">Sign Out</button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
