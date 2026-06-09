import { Shield, Lock } from 'lucide-react';
import { AdminPanel } from './admin/AdminPanel';

interface AdminViewProps {
  addToast: (text: string, type: 'success' | 'info' | 'error') => void;
  onAuth?: () => void;
}

export default function AdminView({ addToast, onAuth }: AdminViewProps) {
  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-mono text-on-surface-variant/70">
          <Shield className="h-3.5 w-3.5 inline text-emerald-400" /> Admin mode active
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <Lock className="h-3.5 w-3.5" />
          Lock
        </button>
      </div>
      <AdminPanel addToast={addToast} />
    </div>
  );
}
