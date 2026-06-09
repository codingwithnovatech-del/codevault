import { useState, useEffect, type FormEvent } from 'react';
import { Terminal, Mail, Lock, LogIn, UserPlus, Eye, EyeOff, User, AtSign, Github, Shield, X, Check } from 'lucide-react';

interface UserLoginPageProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string, username?: string, displayName?: string) => Promise<string | null>;
  onResetPassword?: (email: string) => Promise<string | null>;
  onGoogleSignIn?: () => Promise<string | null>;
  onGithubSignIn?: () => Promise<string | null>;
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  return { score, label: map[score], color: colors[score] };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function UserLoginPage({ onLogin, onSignUp, onResetPassword, onGoogleSignIn, onGithubSignIn }: UserLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [entered, setEntered] = useState(false);

  useEffect(() => { setEntered(true); }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowTerms(false); setShowPrivacy(false); } };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const pwStrength = getPasswordStrength(password);
  const emailError = email && !isValidEmail(email) ? 'Invalid email format' : '';
  const usernameError = mode === 'signup' && username.length > 0 && username.length < 3 ? 'Min 3 characters' : '';
  const passwordError = password.length > 0 && password.length < 6 ? 'Min 6 characters' : '';
  const confirmError = mode === 'signup' && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (emailError || usernameError || passwordError || confirmError) { setError('Fix validation errors first'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      if (resetMode) {
        const errMsg = onResetPassword ? await onResetPassword(email) : null;
        if (errMsg) setError(errMsg);
        else setSuccess('Password reset link sent! Check your email.');
      } else {
        const errMsg = mode === 'login'
          ? await onLogin(email, password)
          : await onSignUp(email, password, username || undefined, displayName || undefined);
        if (errMsg) setError(errMsg);
        else if (mode === 'signup') {
          setSuccess('Account created! Check your email to confirm and then sign in.');
          setMode('login');
        }
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated blur orbs */}
      <div className="absolute top-[-20%] left-[-8%] w-[40%] h-[40%] rounded-full blur-[150px] animate-pulse"
        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(139,92,246,0.1))', animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-8%] w-[40%] h-[40%] rounded-full blur-[150px] animate-pulse"
        style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(99,102,241,0.1))', animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-[35%] right-[10%] w-[25%] h-[25%] rounded-full blur-[120px] animate-pulse"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.08))', animationDuration: '12s', animationDelay: '4s' }} />
      <div className="absolute bottom-[25%] left-[10%] w-[20%] h-[20%] rounded-full blur-[100px] animate-pulse"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(79,70,229,0.12))', animationDuration: '7s', animationDelay: '1s' }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'rgba(79,70,229,0.4)' : 'rgba(99,102,241,0.3)',
              animationDuration: `${15 + Math.random() * 25}s`,
              animationDelay: `${Math.random() * 12}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              opacity: 0.3 + Math.random() * 0.4
            }} />
        ))}
      </div>

      <div className={`w-full max-w-sm relative z-10 transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-primary/20">
            <Terminal className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">CodeVault</h1>
          <p className="text-xs text-on-surface-variant/60 mt-1.5 font-light tracking-wide">
            {resetMode ? 'Reset your password' : mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace'}
          </p>
        </div>

        <div className="bg-surface-container/80 backdrop-blur-xl border border-outline-variant/50 rounded-3xl p-7 space-y-5 shadow-2xl shadow-black/5">
          {!resetMode && (
            <div className="flex gap-1.5 bg-surface-container-lowest/60 border border-outline-variant/30 rounded-xl p-1">
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${mode === 'login' ? 'bg-surface-container shadow-sm text-on-surface' : 'text-on-surface-variant/60 hover:text-on-surface'}`}>
                Sign In
              </button>
              <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${mode === 'signup' ? 'bg-surface-container shadow-sm text-on-surface' : 'text-on-surface-variant/60 hover:text-on-surface'}`}>
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div key={`${mode}-${resetMode}-email`} className="space-y-1.5 animate-fadeIn">
              <label className="text-[10px] font-mono font-medium text-on-surface-variant/50 uppercase tracking-wider">Email</label>
              <div className={`flex items-center gap-2.5 bg-surface-container-lowest border rounded-xl px-3.5 py-2.5 focus-within:ring-1 transition-all ${emailError ? 'border-rose-400/60 focus-within:border-rose-400 focus-within:ring-rose-500/20' : 'border-outline-variant/60 focus-within:border-primary/70 focus-within:ring-primary/20'}`}>
                <Mail className={`h-4 w-4 shrink-0 ${emailError ? 'text-rose-400/50' : 'text-on-surface-variant/30'}`} />
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" required autoFocus />
              </div>
              {emailError && <p className="text-[9px] font-mono text-rose-400 pl-1">{emailError}</p>}
            </div>

            {/* Signup-only fields with fade */}
            <div key={`${mode}-signup-fields`} className="space-y-3 overflow-hidden transition-all duration-300" style={{ maxHeight: mode === 'signup' ? '300px' : '0', opacity: mode === 'signup' ? 1 : 0 }}>
              {mode === 'signup' && (
                <>
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-mono font-medium text-on-surface-variant/50 uppercase tracking-wider">Username</label>
                    <div className={`flex items-center gap-2.5 bg-surface-container-lowest border rounded-xl px-3.5 py-2.5 focus-within:ring-1 transition-all ${usernameError ? 'border-rose-400/60 focus-within:border-rose-400 focus-within:ring-rose-500/20' : 'border-outline-variant/60 focus-within:border-primary/70 focus-within:ring-primary/20'}`}>
                      <AtSign className={`h-4 w-4 shrink-0 ${usernameError ? 'text-rose-400/50' : 'text-on-surface-variant/30'}`} />
                      <input type="text" placeholder="johndoe" value={username} onChange={(e) => setUsername(e.target.value)}
                        className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" />
                    </div>
                    {usernameError && <p className="text-[9px] font-mono text-rose-400 pl-1">{usernameError}</p>}
                  </div>

                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-mono font-medium text-on-surface-variant/50 uppercase tracking-wider">Display Name</label>
                    <div className="flex items-center gap-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                      <User className="h-4 w-4 text-on-surface-variant/30 shrink-0" />
                      <input type="text" placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!resetMode && (
              <div key={`${mode}-${resetMode}-pw`} className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-mono font-medium text-on-surface-variant/50 uppercase tracking-wider">Password</label>
                <div className={`flex items-center gap-2.5 bg-surface-container-lowest border rounded-xl px-3.5 py-2.5 focus-within:ring-1 transition-all ${passwordError ? 'border-rose-400/60 focus-within:border-rose-400 focus-within:ring-rose-500/20' : 'border-outline-variant/60 focus-within:border-primary/70 focus-within:ring-primary/20'}`}>
                  <Lock className={`h-4 w-4 shrink-0 ${passwordError ? 'text-rose-400/50' : 'text-on-surface-variant/30'}`} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-on-surface-variant/40 hover:text-on-surface-variant p-0.5">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {passwordError && <p className="text-[9px] font-mono text-rose-400 pl-1">{passwordError}</p>}

                {/* Password strength meter */}
                {mode === 'signup' && password && (
                  <div className="space-y-1 animate-fadeIn">
                    <div className="h-1 rounded-full bg-surface-container-higher overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(pwStrength.score / 5) * 100}%`, backgroundColor: pwStrength.color }} />
                    </div>
                    <p className="text-[9px] font-mono" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div key={`${mode}-confirm`} className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-mono font-medium text-on-surface-variant/50 uppercase tracking-wider">Confirm Password</label>
                <div className={`flex items-center gap-2.5 bg-surface-container-lowest border rounded-xl px-3.5 py-2.5 focus-within:ring-1 transition-all ${confirmError ? 'border-rose-400/60 focus-within:border-rose-400 focus-within:ring-rose-500/20' : 'border-outline-variant/60 focus-within:border-primary/70 focus-within:ring-primary/20'}`}>
                  <Lock className={`h-4 w-4 shrink-0 ${confirmError ? 'text-rose-400/50' : 'text-on-surface-variant/30'}`} />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent border-none text-xs text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:ring-0 w-full" required minLength={6} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-on-surface-variant/40 hover:text-on-surface-variant p-0.5">
                    {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {confirmError && <p className="text-[9px] font-mono text-rose-400 pl-1">{confirmError}</p>}
              </div>
            )}

            {success && (
              <div key="success" className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 animate-fadeIn">
                <p className="text-xs text-emerald-400 font-medium">{success}</p>
              </div>
            )}
            {error && (
              <div key="error" className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5 animate-fadeIn">
                <p className="text-xs text-rose-400 font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/15 disabled:opacity-50">
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : resetMode ? (
                <><Mail className="h-4 w-4" /> Send Reset Link</>
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> Sign In</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Create Account</>
              )}
            </button>

            {!resetMode && mode === 'login' && (
              <button type="button" onClick={() => { setResetMode(true); setError(''); setSuccess(''); }}
                className="w-full text-center text-[10px] font-mono text-on-surface-variant/40 hover:text-primary transition-all">
                Forgot password?
              </button>
            )}
          </form>

          {!resetMode && (
            <div key={`${mode}-oauth`} className="space-y-3 animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20" /></div>
                <div className="relative flex justify-center"><span className="bg-surface-container px-3 text-[10px] font-mono text-on-surface-variant/40">or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => onGoogleSignIn?.()} disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5 text-xs text-on-surface-variant font-semibold transition-all active:scale-[0.98] disabled:opacity-50">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button type="button" onClick={() => onGithubSignIn?.()} disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5 text-xs text-on-surface-variant font-semibold transition-all active:scale-[0.98] disabled:opacity-50">
                  <Github className="h-4 w-4" />
                  GitHub
                </button>
              </div>
            </div>
          )}

          {resetMode ? (
            <button onClick={() => { setResetMode(false); setError(''); setSuccess(''); }}
              className="w-full py-2 px-4 rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all">
              Back to Sign In
            </button>
          ) : (
            <p className="text-[10px] font-mono text-on-surface-variant/30 text-center leading-relaxed">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                className="text-primary hover:text-primary-container transition-all underline underline-offset-2">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}

          {/* Remember Me checkbox */}
          {!resetMode && mode === 'login' && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setRememberMe(!rememberMe)}
                className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/60 hover:border-primary/60'}`}>
                {rememberMe && <Check className="h-3 w-3" />}
              </button>
              <span className="text-[10px] font-mono text-on-surface-variant/40">Remember me</span>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-500/70">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            SSL Encrypted
          </div>
          <span className="text-on-surface-variant/20">|</span>
          <div className="flex items-center gap-1 text-[9px] font-mono text-primary/60">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 0 0-9 9c0 5 4.5 8.5 9 11 4.5-2.5 9-6 9-11a9 9 0 0 0-9-9z"/><path d="M9 12l2 2 4-4"/></svg>
            Open Source
          </div>
          <span className="text-on-surface-variant/20">|</span>
          <div className="flex items-center gap-1 text-[9px] font-mono text-violet-400/70">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Privacy Protected
          </div>
          <span className="text-on-surface-variant/20">|</span>
          <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400/70">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9.09a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            No Tracking
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
            className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/50 hover:text-primary transition-all">
            <Shield className="h-3 w-3" /> Terms of Service
          </a>
          <span className="text-on-surface-variant/30">|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
            className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/50 hover:text-primary transition-all">
            <Shield className="h-3 w-3" /> Privacy Policy
          </a>
        </div>

        <p className="text-[9px] font-mono text-on-surface-variant/30 text-center mt-3">CodeVault v1.2.0</p>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowTerms(false)} />
          <div className="relative bg-surface-container border border-outline-variant/40 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface tracking-tight">Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="p-1 rounded-lg hover:bg-surface-container-higher text-on-surface-variant/60 hover:text-on-surface transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-[11px] text-on-surface-variant/80 leading-relaxed">
              <p><strong className="text-on-surface">1. Acceptance of Terms</strong><br />By accessing CodeVault, you agree to these terms. If you do not agree, do not use the service.</p>
              <p><strong className="text-on-surface">2. User Accounts</strong><br />You are responsible for maintaining your account credentials and for all activity under your account. Notify us immediately of unauthorized use.</p>
              <p><strong className="text-on-surface">3. Acceptable Use</strong><br />You may not use CodeVault for illegal activity, distribute malware, or attempt to disrupt the service.</p>
              <p><strong className="text-on-surface">4. Intellectual Property</strong><br />Code you store remains yours. CodeVault claims no ownership over user content.</p>
              <p><strong className="text-on-surface">5. Limitation of Liability</strong><br />CodeVault is provided "as is" without warranty. We are not liable for damages arising from use of the service.</p>
              <p><strong className="text-on-surface">6. Changes</strong><br />We may update these terms. Continued use after changes constitutes acceptance.</p>
            </div>
            <button onClick={() => setShowTerms(false)}
              className="w-full py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95">Close</button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPrivacy(false)} />
          <div className="relative bg-surface-container border border-outline-variant/40 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface tracking-tight">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="p-1 rounded-lg hover:bg-surface-container-higher text-on-surface-variant/60 hover:text-on-surface transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-[11px] text-on-surface-variant/80 leading-relaxed">
              <p><strong className="text-on-surface">1. Information We Collect</strong><br />We collect email address, username, display name, and optionally GitHub/Google profile data when you sign in via OAuth.</p>
              <p><strong className="text-on-surface">2. How We Use Data</strong><br />Your data is used to provide and improve CodeVault services, including authentication, profile display, and usage analytics.</p>
              <p><strong className="text-on-surface">3. Data Storage</strong><br />Your data is stored securely on Supabase servers. We implement industry-standard security measures.</p>
              <p><strong className="text-on-surface">4. Third-Party Services</strong><br />We use Supabase for authentication and database hosting, and Vercel for deployment. These services have their own privacy policies.</p>
              <p><strong className="text-on-surface">5. Your Rights</strong><br />You may request access, correction, or deletion of your data by contacting us.</p>
              <p><strong className="text-on-surface">6. Cookies</strong><br />We use local storage for theme preferences and session management. No tracking cookies are used.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)}
              className="w-full py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all active:scale-95">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
