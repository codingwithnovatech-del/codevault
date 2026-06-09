/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, FileCode, Component, Wrench, CircleUser, Terminal, Shield, LifeBuoy, Play, Bot } from 'lucide-react';
import { Tab, DeveloperProfile } from '../types';
import { useRef, useCallback } from 'react';
interface SidebarProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  starsCount: number;
  profile: DeveloperProfile;
  showAdmin?: boolean;
  onRequestAdmin?: () => void;
}

export default function Sidebar({ currentTab, setTab, starsCount, profile, showAdmin, onRequestAdmin }: SidebarProps) {
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const handleSecretClick = useCallback(() => {
    if (!import.meta.env.VITE_ADMIN_SECRET) return;
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => { clickCount.current = 0; }, 2000);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      onRequestAdmin?.();
    }
  }, [onRequestAdmin]);
  const tabsConfig: { id: Tab; label: string; desc: string; icon: any }[] = [
    { id: 'home' as Tab, label: 'Discover Hub', desc: 'Overview & telemetry logs', icon: Home },
    { id: 'templates' as Tab, label: 'Asset Templates', desc: 'Preassembled structures', icon: FileCode },
    { id: 'components' as Tab, label: 'Code Components', desc: 'Raw visual fragments', icon: Component },
    { id: 'tools' as Tab, label: 'Interactive Tools', desc: 'Styling & layout systems', icon: Wrench },
    { id: 'playground' as Tab, label: 'Playground', desc: 'Live code editor & preview', icon: Play },
    { id: 'ai' as Tab, label: 'AI Tools', desc: 'Groq-powered dev tools', icon: Bot },
    { id: 'profile' as Tab, label: 'My Workspace', desc: 'Stats, persistent tokens & stars', icon: CircleUser },
    { id: 'support' as Tab, label: 'Help & Support', desc: 'Community, docs & feedback', icon: LifeBuoy },
  ];

  if (showAdmin) {
    tabsConfig.push({ id: 'admin' as Tab, label: 'Admin Panel', desc: 'Manage templates & components', icon: Shield });
  }

  return (
    <aside id="desktop-sidebar" className="hidden md:flex flex-col w-72 bg-surface-container-low/80 backdrop-blur-md border-r border-outline-variant h-screen sticky top-0 left-0 p-6 z-30 select-none">
      {/* Header Brand */}
      <div className="flex items-center gap-3 mb-10 pb-4 border-b border-outline-variant/30">
        <div className="h-10 w-10 rounded-xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(173,198,255,0.15)]">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-headline-md text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-primary-container to-secondary">
            CodeVault
          </h2>
          <span onClick={handleSecretClick} className="text-[10px] font-mono font-medium text-on-surface-variant uppercase tracking-widest cursor-default">v1.2.0 stable</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-2">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              id={`sidebar-item-${tab.id}`}
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`w-full group flex items-start gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative text-left outline-none ${
                isActive
                  ? 'bg-primary/10 border border-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 border border-transparent'
              }`}
            >
              {/* Highlight ribbon */}
              {isActive && (
                <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-primary" />
              )}
              
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`} />
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight">{tab.label}</span>
                  {tab.id === 'profile' && starsCount > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] font-light text-on-surface-variant/70 leading-relaxed truncate mt-0.5">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer User Panel */}
      <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-primary font-mono text-xs font-bold shrink-0 overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              (profile.username || '?')[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-on-surface truncate">{profile.username || 'User'}</h4>
            <p className="text-[10px] font-mono text-on-surface-variant/70 truncate mt-0.5">{profile.title || profile.bio || 'No title set'}</p>
          </div>
        </div>
        <button 
          id="sidebar-quick-profile-btn"
          onClick={() => setTab('profile')}
          className="p-2 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface rounded-lg transition-colors duration-200"
          title="View profile settings"
        >
          <CircleUser className="h-4.5 w-4.5" />
        </button>
      </div>
    </aside>
  );
}
