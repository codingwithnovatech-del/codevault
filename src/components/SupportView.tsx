import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Bug, BookOpen, Github, ExternalLink, Clock, Bell, Sparkles } from 'lucide-react';
import { getAppSetting } from '../lib/db';

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

const defaultLinks: SupportLinks = {
  telegram: { enabled: true, url: 'https://t.me/codevault' },
  reportBug: { enabled: false, url: '' },
  docs: { enabled: false, url: '' },
  github: { enabled: false, url: '' },
  email: { enabled: true, url: 'support@codevault.dev' },
};

export default function SupportView() {
  const [links, setLinks] = useState<SupportLinks>(defaultLinks);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAppSetting('support_links').then((data) => {
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const out: any = {};
        for (const key of Object.keys(defaultLinks)) {
          const val = parsed[key];
          if (val && typeof val === 'object' && 'enabled' in val) out[key] = val;
          else if (typeof val === 'string') out[key] = { enabled: !!val, url: val };
          else out[key] = { ...defaultLinks[key as keyof SupportLinks] };
        }
        setLinks(out);
      }
      setLoaded(true);
    }).catch(() => {
      // fallback to localStorage for older sessions
      try {
        const raw = localStorage.getItem('codevault_support_links');
        if (raw) {
          const parsed = JSON.parse(raw);
          const out: any = {};
          for (const key of Object.keys(defaultLinks)) {
            const val = parsed[key];
            if (val && typeof val === 'object' && 'enabled' in val) out[key] = val;
            else if (typeof val === 'string') out[key] = { enabled: !!val, url: val };
            else out[key] = { ...defaultLinks[key as keyof SupportLinks] };
          }
          setLinks(out);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-8 animate-fade-in text-left">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-surface-container-highest rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-surface-container-highest rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-surface-container/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const channels = [
    {
      key: 'telegram',
      icon: MessageCircle,
      title: 'Live Community Chat',
      desc: 'Join our Telegram group to get help from the community and maintainers.',
      action: 'Join Telegram',
      accent: 'indigo',
    },
    {
      key: 'reportBug',
      icon: Bug,
      title: 'Report a Bug',
      desc: 'Found an issue? Let us know and we will take a look.',
      action: 'Open Issue',
      accent: 'rose',
    },
    {
      key: 'docs',
      icon: BookOpen,
      title: 'Documentation',
      desc: 'Read the official CodeVault docs for guides and API references.',
      action: 'Read Docs',
      accent: 'sky',
    },
    {
      key: 'email',
      icon: Mail,
      title: 'Email Support',
      desc: 'Reach out to the team directly for business inquiries.',
      action: 'Send Email',
      accent: 'emerald',
    },
  ];

  const githubLink = links.github;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Help & Support</h1>
        <p className="text-sm text-on-surface-variant/80 font-light max-w-xl">
          Get assistance with CodeVault. Choose a support channel below and we will help you out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((ch) => {
          const channel = links[ch.key as keyof SupportLinks];
          const enabled = channel?.enabled && !!channel?.url;
          const href = ch.key === 'email' && enabled ? `mailto:${channel.url}` : enabled ? channel.url : '';

          const Icon = ch.icon;
          const borderCls = ch.accent === 'indigo' ? 'border-indigo-500/20 hover:border-indigo-500/40' :
            ch.accent === 'rose' ? 'border-rose-500/20 hover:border-rose-500/40' :
            ch.accent === 'sky' ? 'border-sky-500/20 hover:border-sky-500/40' :
            'border-emerald-500/20 hover:border-emerald-500/40';
          const bgCls = ch.accent === 'indigo' ? 'bg-indigo-500/10' :
            ch.accent === 'rose' ? 'bg-rose-500/10' :
            ch.accent === 'sky' ? 'bg-sky-500/10' :
            'bg-emerald-500/10';
          const iconBgCls = ch.accent === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
            ch.accent === 'rose' ? 'bg-rose-500/10 text-rose-400' :
            ch.accent === 'sky' ? 'bg-sky-500/10 text-sky-400' :
            'bg-emerald-500/10 text-emerald-400';

          const Wrapper = enabled ? 'a' : 'div';
          const wrapperProps: any = enabled
            ? { href, target: '_blank', rel: 'noopener noreferrer',
                className: `group p-6 rounded-2xl border ${borderCls} ${bgCls} bg-surface-container/30 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] space-y-4` }
            : { className: `group relative p-6 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container/10 backdrop-blur-sm space-y-4 overflow-hidden` };

          return (
            <Wrapper key={ch.title} {...wrapperProps}>
              {!enabled && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, currentColor 8px, currentColor 9px)` }} />
              )}
              <div className="relative z-10 space-y-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${enabled ? iconBgCls : 'bg-surface-container-higher text-on-surface-variant/30'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-base font-bold transition-colors ${enabled ? 'text-on-surface' : 'text-on-surface/60'}`}>{ch.title}</h3>
                  <p className={`text-xs font-light leading-relaxed ${enabled ? 'text-on-surface-variant/80' : 'text-on-surface-variant/40'}`}>{ch.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!enabled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-higher/80 border border-outline-variant/20 text-[10px] font-mono text-on-surface-variant/40 tracking-wider uppercase">
                      <Sparkles className="h-3 w-3 text-primary/40" />
                      <span className="bg-gradient-to-r from-primary/50 to-primary/30 bg-clip-text text-transparent font-semibold tracking-[0.15em]">Coming Soon</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {ch.action}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      <div className={`relative rounded-2xl p-6 space-y-4 overflow-hidden ${!githubLink?.enabled || !githubLink?.url ? 'border border-dashed border-outline-variant/20 bg-surface-container/10' : 'bg-surface-container/30 border border-outline-variant'}`}>
        {(!githubLink?.enabled || !githubLink?.url) && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, currentColor 8px, currentColor 9px)` }} />
        )}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Github className={`h-5 w-5 ${!githubLink?.enabled || !githubLink?.url ? 'text-on-surface-variant/30' : 'text-primary'}`} />
            <h3 className={`text-sm font-bold ${!githubLink?.enabled || !githubLink?.url ? 'text-on-surface/60' : 'text-on-surface'}`}>GitHub Repository</h3>
            {(!githubLink?.enabled || !githubLink?.url) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-higher/80 border border-outline-variant/20 text-[10px] font-mono text-on-surface-variant/40 tracking-wider uppercase">
                <Sparkles className="h-3 w-3 text-primary/40" />
                <span className="bg-gradient-to-r from-primary/50 to-primary/30 bg-clip-text text-transparent font-semibold tracking-[0.15em]">Coming Soon</span>
              </span>
            )}
          </div>
          <p className={`text-xs font-light leading-relaxed ${!githubLink?.enabled || !githubLink?.url ? 'text-on-surface-variant/40' : 'text-on-surface-variant/80'}`}>
            CodeVault is open-source. Star the repo, fork it, or contribute to the project on GitHub.
          </p>
          {(!githubLink?.enabled || !githubLink?.url) ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-higher/60 border border-outline-variant/10 text-xs font-mono text-on-surface-variant/30 tracking-wider uppercase cursor-default">
              <Bell className="h-3.5 w-3.5" />
              Notify when available
            </div>
          ) : (
            <a href={githubLink.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all active:scale-95">
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
