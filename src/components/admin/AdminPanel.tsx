import { useState, useEffect } from 'react';
import { Layout, Code2, Users, Plus, Edit3, Trash2, X, Save, Search, UserPlus, MessageCircle, Bug, BookOpen, Github, ExternalLink, Mail, Eye, Star, Timer, Megaphone, ExternalLink as ExtLink, Bot, Sparkles } from 'lucide-react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, getComponents, createComponent, updateComponent, deleteComponent, getAllProfiles, toggleUserDisabled, deleteUserData, getUserStats, getAppSetting, setAppSetting } from '../../lib/db';
import { templates as staticTemplates } from '../../data';
import { SkeletonCard } from '../Skeleton';

type AdminTab = 'templates' | 'components' | 'users' | 'support' | 'promotions' | 'ai';

interface SupportChannel {
  enabled: boolean;
  url: string;
}

interface SupportLinks {
  telegram: SupportChannel;
  reportBug: SupportChannel;
  docs: SupportChannel;
  github: SupportChannel;
  email: SupportChannel;
}

interface AdminPanelProps {
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

const emptyTemplate = { id: '', title: '', description: '', image: '', alt: '', framework: 'HTML/CSS', category: 'Landing Pages', code: '', stars: 0, views: '0', lastUpdated: 'today', author: 'admin', is_visible: true, is_featured: false };
const emptyComponent = { id: '', title: '', description: '', category: 'Buttons', code: '', is_visible: true, is_featured: false };

export function AdminPanel({ addToast }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<Record<string, any>>({});
  const defaultChannel: SupportChannel = { enabled: false, url: '' };
  const [promo, setPromo] = useState<{ title: string; image: string; link: string; enabled: boolean }>({ title: '', image: '', link: '', enabled: false });

  useEffect(() => {
    getAppSetting('promo_banner').then((data) => {
      if (data) setPromo((typeof data === 'string' ? JSON.parse(data) : data));
    }).catch(() => {});
  }, []);

  const [supportLinks, setSupportLinks] = useState<SupportLinks>({
    telegram: { enabled: true, url: 'https://t.me/codevault' },
    reportBug: { enabled: false, url: '' },
    docs: { enabled: false, url: '' },
    github: { enabled: false, url: '' },
    email: { enabled: true, url: 'support@codevault.dev' },
  });

  useEffect(() => {
    getAppSetting('support_links').then((data) => {
      if (!data) return;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const out: any = {};
      for (const key of ['telegram', 'reportBug', 'docs', 'github', 'email']) {
        const v = parsed[key];
        if (v && typeof v === 'object' && 'enabled' in v) out[key] = v;
        else if (typeof v === 'string') out[key] = { enabled: !!v, url: v };
        else out[key] = { ...defaultChannel };
      }
      setSupportLinks((prev) => ({ ...prev, ...out }));
    }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const dbTemplates = await getTemplates();
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
    setComponents(await getComponents());
    const profiles = await getAllProfiles();
    setUsers(profiles || []);
    profiles?.forEach((u: any) => loadStats(u.id));
    setLoading(false);
  }

  async function loadStats(userId: string) {
    const stats = await getUserStats(userId);
    setUserStats((prev) => ({ ...prev, [userId]: stats }));
  }

  function startNew(type: 'template' | 'component') {
    setEditing(null);
    setForm(type === 'template' ? { ...emptyTemplate } : { ...emptyComponent });
    setShowForm(true);
  }

  function startEdit(item: any) {
    setEditing(item);
    setForm({ ...item });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm({});
  }

  async function handleSave() {
    try {
      const isTemplate = activeTab === 'templates';
      if (editing?.id) {
        if (isTemplate) await updateTemplate(editing.id, form);
        else await updateComponent(editing.id, form);
        addToast('Updated', 'success');
      } else {
        if (isTemplate) await createTemplate({ ...form, created_by: 'admin' });
        else await createComponent({ ...form, created_by: 'admin' });
        addToast('Created', 'success');
      }
      cancelForm();
      await loadData();
    } catch (err: any) {
      addToast('Error: ' + (err.message || 'Failed'), 'error');
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete({ id, label: activeTab === 'templates' ? 'template' : 'component' });
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    try {
      if (activeTab === 'users') {
        await deleteUserData(confirmDelete.id);
      } else if (activeTab === 'templates') {
        await deleteTemplate(confirmDelete.id);
      } else {
        await deleteComponent(confirmDelete.id);
      }
      addToast('Deleted', 'success');
      setConfirmDelete(null);
      await loadData();
    } catch (err: any) {
      addToast('Error: ' + (err.message || 'Failed'), 'error');
      setConfirmDelete(null);
    }
  }

  async function handleToggleDisable(userId: string, isDisabled: boolean) {
    await toggleUserDisabled(userId, !isDisabled);
    addToast(isDisabled ? 'User enabled' : 'User disabled', 'success');
    await loadData();
  }

  function handleDeleteUser(userId: string, username: string) {
    setConfirmDelete({ id: userId, label: `user "${username}"` });
  }

  const filteredUsers = users.filter((u) =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'templates' as AdminTab, label: 'Templates', icon: Layout },
    { id: 'components' as AdminTab, label: 'Components', icon: Code2 },
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'promotions' as AdminTab, label: 'Promotions', icon: Megaphone },
    { id: 'ai' as AdminTab, label: 'AI Tools', icon: Bot },
    { id: 'support' as AdminTab, label: 'Support', icon: MessageCircle },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-container-lowest/50 border border-outline-variant/30 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); cancelForm(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-surface-container shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Users tab */}
      {activeTab === 'users' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3.5 py-2 focus-within:border-primary/60 transition-all">
            <Search className="h-4 w-4 text-on-surface-variant/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
              className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0 w-full" />
          </div>
          <div className="space-y-2">
            {filteredUsers.length === 0 && (
              <div className="py-10 border border-dashed border-outline-variant/30 rounded-xl text-center">
                <Users className="h-6 w-6 text-on-surface-variant/30 mx-auto mb-2" />
                <p className="text-xs text-on-surface-variant/50">No users found</p>
              </div>
            )}
            {filteredUsers.map((user) => {
              const stats = userStats[user.id];
              return (
                <div key={user.id} className="bg-surface-container/40 border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-primary/30 transition-all">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-on-surface">{user.username}</span>
                      {user.is_disabled && <span className="text-[10px] font-mono text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">DISABLED</span>}
                    </div>
                    {user.email && <p className="text-xs text-on-surface-variant/60">{user.email}</p>}
                    <div className="flex gap-3 text-[10px] font-mono text-on-surface-variant/40">
                      <span>Copies: {user.copies_count || 0}</span>
                      <span>Stars: {user.stars_count || 0}</span>
                      {stats && <span>Saved: {stats.savedTemplatesCount + stats.savedComponentsCount}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggleDisable(user.id, user.is_disabled)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.is_disabled ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      }`} title={user.is_disabled ? 'Enable' : 'Disable'}>
                      {user.is_disabled ? <UserPlus className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => handleDeleteUser(user.id, user.username)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors" title="Delete user">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {users.length > 0 && (
            <p className="text-[10px] font-mono text-on-surface-variant/30 text-center">{filteredUsers.length} / {users.length} users</p>
          )}
        </div>
      ) : activeTab === 'promotions' ? (
        <div className="space-y-4">
          <div className="bg-surface-container/40 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-on-surface">Promotional Banner</h3>
            </div>
            <p className="text-xs text-on-surface-variant/60 font-light">Show a banner/CTA on the site. Set image, link, and toggle on/off.</p>

            {['title', 'image', 'link'].map((field) => (
              <div key={field}>
                <label className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-wider mb-1 block">{field}</label>
                <input value={(promo as any)[field] || ''} onChange={e => setPromo({...promo, [field]: e.target.value})}
                  placeholder={field === 'title' ? 'Special Offer!' : field === 'image' ? 'https://example.com/banner.png' : 'https://example.com/offer'}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
              </div>
            ))}

            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
              <input type="checkbox" checked={promo.enabled} onChange={e => setPromo({...promo, enabled: e.target.checked})} className="rounded" />
              Banner enabled
            </label>

            {promo.image && (
              <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                <p className="text-[10px] font-mono text-on-surface-variant/40 mb-2 uppercase tracking-wider">Preview</p>
                <img src={promo.image} alt="" className="w-full h-24 object-cover rounded-lg border border-outline-variant/20" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            <button onClick={async () => { await setAppSetting('promo_banner', promo); addToast('Banner saved!', 'success'); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10">
              <Save className="h-3.5 w-3.5" />
              Save Banner
            </button>
          </div>
        </div>
      ) : activeTab === 'support' ? (
        <div className="space-y-4">
          <div className="bg-surface-container/40 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Support Links</h3>
            </div>
            <p className="text-xs text-on-surface-variant/60 font-light">Toggle each channel on/off and set its URL. Disabled channels show "Coming Soon".</p>

            {(['telegram', 'reportBug', 'docs', 'email', 'github'] as const).map((key) => {
              const labels: Record<string, { icon: any; label: string; ph: string }> = {
                telegram: { icon: MessageCircle, label: 'Telegram', ph: 'https://t.me/yourgroup' },
                reportBug: { icon: Bug, label: 'Report Bug URL', ph: 'https://github.com/...' },
                docs: { icon: BookOpen, label: 'Documentation URL', ph: 'https://docs.example.com' },
                email: { icon: Mail, label: 'Email Address', ph: 'admin@example.com' },
                github: { icon: Github, label: 'GitHub Repository URL', ph: 'https://github.com/user/repo' },
              };
              const info = labels[key];
              const Icon = info.icon;
              const ch = supportLinks[key];
              return (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ch?.enabled ? 'border-primary/30 bg-primary/[0.03]' : 'border-outline-variant/20 opacity-60'}`}>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Icon className={`h-4 w-4 ${ch?.enabled ? 'text-primary' : 'text-on-surface-variant/40'}`} />
                    <label className="text-xs font-medium text-on-surface cursor-pointer select-none" onClick={() => setSupportLinks({...supportLinks, [key]: { ...ch, enabled: !ch?.enabled }})}>
                      {info.label}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input value={ch?.url || ''} onChange={e => setSupportLinks({...supportLinks, [key]: { ...ch, url: e.target.value }})}
                      placeholder={info.ph}
                      className="flex-1 min-w-0 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-primary/60" />
                    <button onClick={() => setSupportLinks({...supportLinks, [key]: { ...ch, enabled: !ch?.enabled }})}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${ch?.enabled ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-surface-container-higher text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                      title={ch?.enabled ? 'Disable' : 'Enable'}>
                      {ch?.enabled ? <span className="text-[10px] font-semibold px-1">ON</span> : <span className="text-[10px] font-semibold px-1">OFF</span>}
                    </button>
                  </div>
                </div>
              );
            })}

            <button onClick={async () => { await setAppSetting('support_links', supportLinks); addToast('Support links saved!', 'success'); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10">
              <Save className="h-3.5 w-3.5" />
              Save Links
            </button>
          </div>

          {/* Preview */}
          <div className="bg-surface-container/20 border border-outline-variant/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-wider">
              <ExternalLink className="h-3 w-3" /> Preview
            </div>
            <div className="flex flex-wrap gap-2">
              {(['telegram', 'reportBug', 'docs', 'email', 'github'] as const).map((key) => {
                const labels: Record<string, { icon: any; label: string; color: string }> = {
                  telegram: { icon: MessageCircle, label: 'Telegram', color: 'text-indigo-400 bg-indigo-500/10' },
                  reportBug: { icon: Bug, label: 'Report Bug', color: 'text-rose-400 bg-rose-500/10' },
                  docs: { icon: BookOpen, label: 'Docs', color: 'text-sky-400 bg-sky-500/10' },
                  email: { icon: Mail, label: 'Email', color: 'text-emerald-400 bg-emerald-500/10' },
                  github: { icon: Github, label: 'GitHub', color: 'text-on-surface-variant bg-surface-container-higher' },
                };
                const info = labels[key];
                const Icn = info.icon;
                const ch = supportLinks[key];
                return (
                  <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${info.color} ${ch?.enabled && ch?.url ? '' : 'opacity-40'}`}>
                    <Icn className="h-3 w-3" />
                    {info.label}
                    {ch?.enabled && ch?.url ? <ExternalLink className="h-2.5 w-2.5 ml-0.5" /> : <span className="text-[9px] ml-1">(off)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'ai' ? (
        <div className="space-y-4">
          <div className="bg-surface-container/40 border border-outline-variant/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">AI Tools Configuration</h3>
            </div>
            <p className="text-xs text-on-surface-variant/60 font-light">Manage AI-powered developer tools. Requires a valid Groq API key.</p>

            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-semibold text-on-surface">Available AI Tools</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'explain', label: 'Code Explainer', desc: 'Paste code → get plain-English explanation' },
                  { id: 'docs', label: 'Doc Generator', desc: 'Paste code → get JSDoc documentation' },
                  { id: 'review', label: 'Code Reviewer', desc: 'Paste code → AI finds bugs & issues' },
                  { id: 'regex', label: 'Regex Generator', desc: 'Describe pattern → get regex' },
                ].map((tool) => (
                  <div key={tool.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container/40 border border-outline-variant/20">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface">{tool.label}</p>
                      <p className="text-[10px] text-on-surface-variant/60">{tool.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-wider">Important</p>
              <ul className="space-y-1.5 text-[11px] text-on-surface-variant/70">
                <li className="flex items-start gap-2">• Set <code className="text-primary bg-primary/10 px-1 rounded text-[10px]">VITE_GROQ_API_KEY</code> in <code className="text-primary bg-primary/10 px-1 rounded text-[10px]">.env.local</code></li>
                <li className="flex items-start gap-2">• Get a free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com/keys</a></li>
                <li className="flex items-start gap-2">• Rate limit: 20 calls/minute</li>
                <li className="flex items-start gap-2">• Model: Groq Llama 3.1 8B (fast & free)</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-on-surface">{activeTab === 'templates' ? 'Templates' : 'Components'}</h2>
            <button onClick={() => startNew(activeTab === 'templates' ? 'template' : 'component')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10">
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {/* Form overlay */}
          {showForm && (
            <div className="bg-surface-container/70 border border-primary/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface">{editing ? 'Edit' : 'New'} {activeTab === 'templates' ? 'Template' : 'Component'}</h3>
                <button onClick={cancelForm} className="p-1 hover:text-primary rounded"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="ID" value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                {activeTab === 'templates' && (
                  <>
                    <input placeholder="Framework" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                    <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                    <input placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                    <input placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                    <div className="flex gap-2 col-span-1 md:col-span-2">
                      <div className="flex-1 flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"><Star className="h-3 w-3 text-on-surface-variant/40" /><input placeholder="Stars" type="number" value={form.stars ?? 0} onChange={e => setForm({...form, stars: Number(e.target.value)})} className="bg-transparent border-none text-xs w-full focus:outline-none" /></div>
                      <div className="flex-1 flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"><Eye className="h-3 w-3 text-on-surface-variant/40" /><input placeholder="Views" value={form.views ?? '0'} onChange={e => setForm({...form, views: e.target.value})} className="bg-transparent border-none text-xs w-full focus:outline-none" /></div>
                      <div className="flex-1 flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs"><Timer className="h-3 w-3 text-on-surface-variant/40" /><input placeholder="Last Updated" value={form.lastUpdated ?? ''} onChange={e => setForm({...form, lastUpdated: e.target.value})} className="bg-transparent border-none text-xs w-full focus:outline-none" /></div>
                    </div>
                    <div className="md:col-span-2"><input placeholder="Alt text" value={form.alt} onChange={e => setForm({...form, alt: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" /></div>
                  </>
                )}
                {activeTab === 'components' && (
                  <input placeholder="Category (Buttons, Cards, etc.)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60" />
                )}
                <div className="md:col-span-2"><textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-primary/60" /></div>
                <div className="md:col-span-2">
                  <textarea placeholder="Code (HTML/CSS/JS)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} rows={8} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:border-primary/60" />
                  {form.code && (
                    <div className="mt-2 p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-on-surface-variant/40 mb-2 uppercase tracking-wider"><Eye className="h-3 w-3" /> Live Preview</div>
                      <iframe srcDoc={form.code} className="w-full h-48 rounded-lg border border-outline-variant/20 bg-white" title="Preview" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-on-surface-variant"><input type="checkbox" checked={form.is_visible !== false} onChange={e => setForm({...form, is_visible: e.target.checked})} className="rounded" /> Visible</label>
                  <label className="flex items-center gap-2 text-xs text-on-surface-variant"><input type="checkbox" checked={form.is_featured === true} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded" /> Featured</label>
                </div>
              </div>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95">
                <Save className="h-3.5 w-3.5" />
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (activeTab === 'templates' ? templates : components).length === 0 ? (
              <div className="py-10 border border-dashed border-outline-variant/30 rounded-xl text-center">
                <p className="text-xs text-on-surface-variant/50">No items yet</p>
              </div>
            ) : (activeTab === 'templates' ? templates : components).map((item) => (
              <div key={item.id} className="bg-surface-container/40 border border-outline-variant/30 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-primary/30 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-on-surface truncate">{item.title}</h4>
                    {item.is_featured && <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">FEATURED</span>}
                    {item.is_visible === false && <span className="text-[10px] font-mono text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">PENDING</span>}
                  </div>
                  <p className="text-[11px] text-on-surface-variant/60 truncate mt-0.5">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {item.is_visible === false && (
                      <button onClick={async () => { await updateTemplate(item.id, { is_visible: true } as any); addToast('Template approved!', 'success'); await loadData(); }}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-on-surface-variant hover:text-emerald-400 transition-colors" title="Approve">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-container-higher text-on-surface-variant hover:text-primary transition-colors" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-rose-500/15 text-on-surface-variant hover:text-rose-400 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-on-surface mb-2">Confirm Delete</h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Delete {confirmDelete.label}? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-3.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-highest transition-all">Cancel</button>
              <button onClick={confirmDeleteAction} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
