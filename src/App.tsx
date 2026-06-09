/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Github, Shield, Lock, LogIn, Timer } from 'lucide-react';

import { Tab, DeveloperProfile } from './types';
import { ToastMessage } from './components/Toast';
import { initialProfile } from './data';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider, useTheme } from './lib/theme';
import { getProfile, updateProfile, getTemplates, getComponents, getSavedTemplateIds, getSavedComponentIds, getApiTokens, getProfilePreferences, updateProfilePreferences, saveTemplate, unsaveTemplate, saveComponent, unsaveComponent } from './lib/db';

// Import components
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Import views
import HomeView from './components/HomeView';
import TemplatesView from './components/TemplatesView';
import ComponentsView from './components/ComponentsView';
import ToolsView from './components/ToolsView';
import PlaygroundView from './components/PlaygroundView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import SupportView from './components/SupportView';
import UserLoginPage from './components/UserLoginPage';
import OfflineIndicator from './components/OfflineIndicator';
import CommandPalette from './components/CommandPalette';
import OnboardingTour from './components/OnboardingTour';

function AppContent() {
  const { user, loading, signIn, signUp, signOut, resetPassword, signInWithGoogle, signInWithGithub } = useAuth();

  // ALL hooks must be before any early return
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLocked, setAdminLocked] = useState(() => {
    const until = localStorage.getItem('admin_lock_until');
    return until ? Math.max(0, parseInt(until) - Date.now()) : 0;
  });
  const [adminLockRemaining, setAdminLockRemaining] = useState(0);
  const adminLockTimer = useRef<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('codevault_onboarded'));

  const [profile, setProfile] = useState<DeveloperProfile>(initialProfile);

  // Sync profile with Supabase when user is authenticated
  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((dbProfile) => {
      if (dbProfile) {
        setProfile({
          username: dbProfile.username || 'developer',
          title: dbProfile.title || '',
          bio: dbProfile.bio || '',
          avatar: dbProfile.avatar || '',
          savedTemplates: [], savedComponents: [], apiTokens: [],
          stats: {
            copiesCount: dbProfile.copies_count || 0,
            starsCount: dbProfile.stars_count || 0,
            contributions: dbProfile.contributions || {}
          }
        });
      }
    });
    getSavedTemplateIds(user.id).then((ids) => setProfile((prev) => ({ ...prev, savedTemplates: ids })));
    getSavedComponentIds(user.id).then((ids) => setProfile((prev) => ({ ...prev, savedComponents: ids })));
    getApiTokens(user.id).then((tokens) => setProfile((prev) => ({ ...prev, apiTokens: tokens })));
    // Load preferences from DB
    getProfilePreferences(user.id).then((prefs) => {
      if (prefs.onboarded) {
        setShowOnboarding(false);
        localStorage.setItem('codevault_onboarded', 'true');
      }
      if (prefs.theme === 'light' || prefs.theme === 'dark') {
        localStorage.setItem('codevault_theme', prefs.theme);
        document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
        document.documentElement.classList.toggle('light', prefs.theme === 'light');
      }
    });
  }, [user]);

  const { theme } = useTheme();
  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      updateProfile(user.id, { username: profile.username, title: profile.title, bio: profile.bio, avatar: profile.avatar });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [profile.username, profile.title, profile.bio, profile.avatar]);

  // Sync theme to DB
  useEffect(() => {
    if (!user) return;
    updateProfilePreferences(user.id, { theme });
  }, [user, theme]);

  // Admin lock countdown timer
  useEffect(() => {
    if (adminLockRemaining <= 0) {
      if (adminLockTimer.current) clearInterval(adminLockTimer.current);
      return;
    }
    adminLockTimer.current = window.setInterval(() => {
      setAdminLockRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          if (adminLockTimer.current) clearInterval(adminLockTimer.current);
          localStorage.removeItem('admin_lock_until');
          setAdminLocked(0);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (adminLockTimer.current) clearInterval(adminLockTimer.current); };
  }, [adminLockRemaining]);

  // Global keyboard shortcut: Ctrl+K for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.key === 'Escape') setShowPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Toast helpers
  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-surface-container-highest rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container/40 border border-outline-variant/30 rounded-xl p-4 space-y-3">
              <div className="h-4 bg-surface-container-highest rounded w-3/4" />
              <div className="h-3 bg-surface-container-highest rounded w-1/2" />
              <div className="h-3 bg-surface-container-highest rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <UserLoginPage onLogin={signIn} onSignUp={signUp} onResetPassword={resetPassword} onGoogleSignIn={signInWithGoogle} onGithubSignIn={signInWithGithub} />;
  }

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    const lockedUntil = parseInt(localStorage.getItem('admin_lock_until') || '0');
    if (lockedUntil > Date.now()) {
      const remaining = lockedUntil - Date.now();
      setAdminLockRemaining(remaining);
      setAdminLocked(remaining);
      setAdminError(`Locked for ${Math.ceil(remaining / 3600000)}h ${Math.ceil((remaining % 3600000) / 60000)}m`);
      return;
    }
    const pwd = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (adminPassword === pwd) {
      localStorage.removeItem('admin_lock_until');
      localStorage.removeItem('admin_attempts');
      setAdminLocked(0);
      setAdminLockRemaining(0);
      sessionStorage.setItem('admin_auth', 'true');
      setAdminAuthenticated(true);
      setShowAdminModal(false);
      setAdminPassword('');
      setAdminError('');
      addToast('Admin access granted!', 'success');
      handleTabChange('admin' as Tab);
    } else {
      const attempts = parseInt(localStorage.getItem('admin_attempts') || '0') + 1;
      localStorage.setItem('admin_attempts', attempts.toString());
      if (attempts >= 2) {
        const lockUntil = Date.now() + 5 * 3600 * 1000;
        localStorage.setItem('admin_lock_until', lockUntil.toString());
        setAdminLocked(5 * 3600 * 1000);
        setAdminLockRemaining(5 * 3600 * 1000);
        setAdminError('Too many wrong attempts. Locked for 5 hours.');
      } else {
        setAdminError('Invalid password (1/2 attempts used)');
      }
    }
  };

  const handleCopyAction = () => setProfile((prev) => ({ ...prev, stats: { ...prev.stats, copiesCount: prev.stats.copiesCount + 1 } }));

  const handleToggleTemplateStar = (id: string) => {
    setProfile((prev) => {
      const isStarred = prev.savedTemplates.includes(id);
      const starred = isStarred ? prev.savedTemplates.filter((tId) => tId !== id) : [...prev.savedTemplates, id];
      if (isStarred) unsaveTemplate(user!.id, id).catch(() => {});
      else saveTemplate(user!.id, id).catch(() => {});
      return { ...prev, savedTemplates: starred, stats: { ...prev.stats, starsCount: starred.length } };
    });
  };

  const handleToggleComponentSave = (id: string) => {
    setProfile((prev) => {
      const isSaved = prev.savedComponents.includes(id);
      const saved = isSaved ? prev.savedComponents.filter((cId) => cId !== id) : [...prev.savedComponents, id];
      if (isSaved) unsaveComponent(user!.id, id).catch(() => {});
      else saveComponent(user!.id, id).catch(() => {});
      return { ...prev, savedComponents: saved };
    });
  };

  const handleUpdateProfile = (updated: DeveloperProfile) => setProfile(updated);

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); setSearchQuery(''); };

  return (
    <div className="bg-background text-on-background font-sans antialiased min-h-screen pb-24 md:pb-0 flex selection:bg-primary/30 selection:text-primary">
      
      {/* 1. Global Floater Notification Toast Host */}
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Command Palette (Ctrl+K) */}
      {showPalette && (
        <CommandPalette
          onClose={() => setShowPalette(false)}
          onNavigate={handleTabChange}
          onSearch={(q) => setSearchQuery(q)}
          addToast={addToast}
        />
      )}

      {/* First-run Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => { localStorage.setItem('codevault_onboarded', 'true'); setShowOnboarding(false); if (user) updateProfilePreferences(user.id, { onboarded: true }); }} />
      )}

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}>
          <div className="max-w-sm w-full bg-surface-container/95 border border-outline-variant rounded-2xl p-8 text-center space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-on-surface">Admin Access</h2>
                <p className="text-xs text-on-surface-variant/80 font-light">
                  {adminLocked > 0
                    ? 'Access locked due to too many failed attempts.'
                    : 'Enter admin password to unlock the panel.'}
                </p>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 focus-within:border-primary/80 transition-all">
                  {adminLocked > 0 ? (
                    <Timer className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-on-surface-variant/50" />
                  )}
                  <input
                    type="password"
                    placeholder={adminLocked > 0 ? 'Locked' : 'Password'}
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); }}
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0 w-full"
                    autoFocus={adminLocked <= 0}
                    disabled={adminLocked > 0}
                  />
                </div>
                {adminError && <p className="text-xs text-rose-400 font-medium">{adminError}</p>}
                {adminLockRemaining > 0 && (
                  <p className="text-[10px] font-mono text-rose-400/70">
                    Lock expires in {Math.floor(adminLockRemaining / 3600000)}h {Math.floor((adminLockRemaining % 3600000) / 60000)}m {Math.floor((adminLockRemaining % 60000) / 1000)}s
                  </p>
                )}
                <button
                  type="submit"
                  disabled={adminLocked > 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminPassword(''); setAdminError(''); }}
                  className="w-full py-2 px-4 rounded-xl border border-outline-variant text-xs text-on-surface-variant hover:text-on-surface transition-all"
                >
                  Cancel
                </button>
              </form>
          </div>
        </div>
      )}

      {/* 2. Desktop Navigation Panel Side rail */}
      <Sidebar
        currentTab={activeTab}
        setTab={handleTabChange}
        starsCount={profile.savedTemplates.length}
        profile={profile}
        showAdmin={adminAuthenticated}
        onRequestAdmin={() => setShowAdminModal(true)}
      />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        
        {/* Mobile Sticky Bar */}
        <TopAppBar
          currentTab={activeTab}
          setTab={handleTabChange}
          starsCount={profile.savedTemplates.length}
        />

        {/* Desktop Header panel (Hidden on mobile) */}
        <header className="hidden md:flex items-center justify-between px-8 h-18 border-b border-outline-variant/30 bg-surface-container-low/40 backdrop-blur-md sticky top-0 z-10 w-full select-none">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            {activeTab !== 'home' ? (
              <div className="flex items-center gap-2 bg-surface-container-lowest/80 border border-outline-variant rounded-xl px-3.5 py-1.5 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/25 transition-all w-full">
                <Search className="h-4 w-4 text-on-surface-variant/50" />
                <input
                  type="text"
                  placeholder={`Search in active ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0 w-full"
                />
              </div>
            ) : (
              <span className="text-xs font-mono font-medium text-on-surface-variant/70 uppercase">Discover Command Centre</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-lg transition-colors"
              title="GitHub platform repository"
            >
              <Github className="h-4.5 w-4.5" />
            </a>
            
            <div className="h-4.5 w-[1px] bg-outline-variant/30" />

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase">Cluster verified</span>
            </div>
          </div>
        </header>

        {/* Global Search Bar shown for mobile only inside tabs (except home which has its hero search) */}
        {activeTab !== 'home' && (
          <div className="p-4 md:hidden border-b border-outline-variant/20 bg-background sticky top-16 z-30 select-none">
            <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded-xl px-3.5 py-2 w-full">
              <Search className="h-4 w-4 text-on-surface-variant/50" />
              <input
                type="text"
                placeholder={`Search active ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-0 w-full"
              />
            </div>
          </div>
        )}

        {/* 4. Tab Screens Mount Port */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'home' && (
                <HomeView
                  onNavigate={handleTabChange}
                  onSearch={(q) => setSearchQuery(q)}
                  copiesCount={profile.stats.copiesCount}
                  starsCount={profile.savedTemplates.length}
                  apiTokensCount={profile.apiTokens.length}
                  addToast={addToast}
                />
              )}

              {activeTab === 'templates' && (
                <TemplatesView
                  searchQuery={searchQuery}
                  onCopy={handleCopyAction}
                  starredIds={profile.savedTemplates}
                  onToggleStar={handleToggleTemplateStar}
                  addToast={addToast}
                />
              )}

              {activeTab === 'components' && (
                <ComponentsView
                  searchQuery={searchQuery}
                  onCopy={handleCopyAction}
                  savedIds={profile.savedComponents}
                  onToggleSave={handleToggleComponentSave}
                  addToast={addToast}
                />
              )}

              {activeTab === 'tools' && (
                <ToolsView
                  onCopy={handleCopyAction}
                  addToast={addToast}
                />
              )}

              {activeTab === 'playground' && (
                <PlaygroundView />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  addToast={addToast}
                  signOut={signOut}
                />
              )}

              {activeTab === 'admin' && (
                <AdminView
                  addToast={addToast}
                  onAuth={() => setAdminAuthenticated(true)}
                />
              )}

              {activeTab === 'support' && (
                <SupportView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 5. Mobile Layout Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={activeTab}
          setTab={handleTabChange}
          showAdmin={adminAuthenticated}
        />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
