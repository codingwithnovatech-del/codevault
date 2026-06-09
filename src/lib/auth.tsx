import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthState {
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username?: string, displayName?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithGithub: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  error: null,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  resetPassword: async () => null,
  signInWithGoogle: async () => null,
  signInWithGithub: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) return authError.message;
      if (data?.user) {
        try {
          const { data: prof, error: profError } = await supabase
            .from('profiles')
            .select('is_disabled')
            .eq('id', data.user.id)
            .single();
          if (!profError && prof?.is_disabled) {
            await supabase.auth.signOut();
            return 'Your account has been disabled. Contact the administrator.';
          }
        } catch {
          // is_disabled column may not exist; allow login
        }
      }
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const signUp = async (email: string, password: string, username?: string, displayName?: string): Promise<string | null> => {
    try {
      setError(null);
      const display_name = displayName || username || email.split('@')[0];
      const user_name = username || email.split('@')[0];
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { user_name, display_name } },
      });
      if (!authError) return null;
      // If rate limited or email confirmation issue, try direct user creation via RPC
      if (authError.message?.includes('rate_limit') || authError.message?.includes('rate limit') || authError.message?.includes('disabled')) {
        const { data, error: rpcError } = await supabase.rpc('create_user_direct', {
          email,
          password,
          _username: user_name,
          _display_name: display_name,
        });
        if (rpcError) return rpcError.message;
        if (data) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) return signInError.message;
          return null;
        }
      }
      return authError.message;
    } catch (err: any) {
      return err.message;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  };

  const signInWithGoogle = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) return error.message;
      if (data?.url) window.location.href = data.url;
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const signInWithGithub = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
      if (error) return error.message;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        return 'No OAuth URL returned';
      }
      return null;
    } catch (err: any) {
      console.error('GitHub OAuth error:', err);
      return err.message;
    }
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (authError) return authError.message;
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const isAdmin = profile?.is_admin === true;

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, error, signIn, signUp, signOut, resetPassword, signInWithGoogle, signInWithGithub }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
