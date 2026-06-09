/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Terminal, CircleUser, Sun, Moon } from 'lucide-react';
import { Tab } from '../types';
import { useTheme } from '../lib/theme';

interface TopAppBarProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  starsCount: number;
}

export default function TopAppBar({ setTab, starsCount }: TopAppBarProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header id="top-app-bar" className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant shadow-sm flex items-center justify-between px-4 h-16 md:hidden">
      <button 
        id="top-logo-btn"
        onClick={() => setTab('home')}
        className="active:scale-95 p-2 -ml-2 rounded-full hover:bg-surface-container-highest text-primary flex items-center justify-center transition-all"
      >
        <Terminal className="h-5 w-5" />
      </button>
      
      <h1 className="font-headline-md text-lg font-bold text-primary tracking-tight">CodeVault</h1>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={toggleTheme}
          className="active:scale-95 p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center transition-all"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
        <button 
          id="top-profile-btn"
          onClick={() => setTab('profile')}
          className="active:scale-95 p-2 -mr-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center transition-all relative"
        >
          <CircleUser className="h-5 w-5 text-on-surface-variant" />
          {starsCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
}
