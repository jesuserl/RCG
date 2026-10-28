import { createClient } from '@supabase/supabase-js';

const getEnvOrStored = (envKey: string, storageKey: string): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim()) return stored.trim();
  }
  return (import.meta.env[envKey] as string) || '';
};

export const getSupabaseCredentials = () => {
  return {
    url: getEnvOrStored('VITE_SUPABASE_URL', 'viaticos_custom_supabase_url'),
    anonKey: getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'viaticos_custom_supabase_key'),
  };
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('viaticos_custom_supabase_url', url.trim());
    } else {
      localStorage.removeItem('viaticos_custom_supabase_url');
    }
    if (anonKey.trim()) {
      localStorage.setItem('viaticos_custom_supabase_key', anonKey.trim());
    } else {
      localStorage.removeItem('viaticos_custom_supabase_key');
    }
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    !anonKey.includes('your-anon-public-key') &&
    url.startsWith('https://')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(getSupabaseCredentials().url, getSupabaseCredentials().anonKey)
  : null;
