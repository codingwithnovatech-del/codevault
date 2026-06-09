import { type ReactNode } from 'react';
import { useAuth } from '../../lib/auth';
import { Github, LogOut, ShieldOff, AlertCircle } from 'lucide-react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, error, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="max-w-sm w-full bg-surface-container/70 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-on-surface">Connection Error</h2>
            <p className="text-xs text-on-surface-variant/70 font-light">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="max-w-sm w-full bg-surface-container/70 border border-outline-variant rounded-2xl p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Github className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">Admin Access</h2>
            <p className="text-xs text-on-surface-variant/80 font-light">
              Sign in with GitHub to manage templates, components, and settings.
            </p>
          </div>
          <button
            onClick={signIn}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/10"
          >
            <Github className="h-4 w-4" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="max-w-sm w-full bg-surface-container/70 border border-outline-variant rounded-2xl p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldOff className="h-8 w-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">Access Denied</h2>
            <p className="text-xs text-on-surface-variant/80 font-light">
              You do not have admin privileges. Only the project owner can access this panel.
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full py-2.5 px-4 rounded-xl border border-outline-variant text-on-surface-variant hover:text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-mono text-on-surface-variant/70">
          Signed in as <strong className="text-primary">{user.email}</strong> &middot; <span className="text-emerald-400">Admin</span>
        </span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
      {children}
    </div>
  );
}
