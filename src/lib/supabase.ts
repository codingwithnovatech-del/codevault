import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey
  && !supabaseUrl.includes('your-project-id')
  && !supabaseAnonKey.includes('your-anon-key');

function createMockClient() {
  const mockResponse = { data: null, error: null };
  const mockData = { data: [], error: null };
  const chain = {
    select: () => chain,
    eq: () => chain,
    single: async () => mockResponse,
    order: async () => mockData,
    in: () => chain,
    insert: () => ({ select: () => ({ single: async () => mockResponse }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: async () => mockResponse }) }) }),
    delete: () => ({ eq: () => ({ eq: () => async () => mockResponse }) }),
  };
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' } }),
      signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: { message: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' } }),
      signOut: async () => mockResponse,
    },
    from: () => chain,
  };
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient() as any;
