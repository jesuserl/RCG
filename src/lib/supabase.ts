import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DataSourceMode } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://qwivjixoziyliggczocf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXZqaXhveml5bGlnZ2N6b2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMTE1ODYsImV4cCI6MjEwODc4NzU4Nn0.2REOmsqBLZD8-kKWvxrrsaXGwySNrAJOpnPULsshW_8';

export const STORAGE_KEY_CUSTOM_URL = 'viaticos_custom_supabase_url';
export const STORAGE_KEY_CUSTOM_KEY = 'viaticos_custom_supabase_key';
export const STORAGE_KEY_DATA_SOURCE = 'viaticos_data_source_mode';

/**
 * Sanitizes Supabase URL by removing trailing slashes and /rest/v1 path.
 * Supabase client requires the base domain (e.g., https://xyz.supabase.co)
 * without /rest/v1 suffix.
 */
export const cleanSupabaseUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim();
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Strip /rest/v1 (case insensitive)
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  // Strip trailing slashes again
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

/**
 * Extracts the Supabase project ref from a URL
 * e.g. "https://qwivjixoziyliggczocf.supabase.co" -> "qwivjixoziyliggczocf"
 */
export const extractProjectRef = (url: string): string => {
  const cleaned = cleanSupabaseUrl(url);
  try {
    const parsed = new URL(cleaned);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length >= 2 && hostParts[1] === 'supabase') {
      return hostParts[0];
    }
    return parsed.hostname;
  } catch {
    return 'proyecto';
  }
};

const getEnvOrStored = (envKey: string, storageKey: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim()) return stored.trim();
  }
  const envVal = (import.meta.env[envKey] as string) || '';
  if (envVal && envVal.trim()) return envVal.trim();
  return fallback;
};

export const getSupabaseCredentials = () => {
  const rawUrl = getEnvOrStored('VITE_SUPABASE_URL', STORAGE_KEY_CUSTOM_URL, DEFAULT_SUPABASE_URL);
  const anonKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', STORAGE_KEY_CUSTOM_KEY, DEFAULT_SUPABASE_ANON_KEY);
  const url = cleanSupabaseUrl(rawUrl);

  return {
    rawUrl,
    url,
    anonKey,
    projectRef: extractProjectRef(url),
  };
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    const cleaned = cleanSupabaseUrl(url);
    if (cleaned) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, cleaned);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    }
    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_KEY);
    }
    // Invalidate client cache
    cachedClient = null;
    lastUrl = '';
    lastKey = '';
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

export const getStoredDataSourceMode = (): DataSourceMode => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_DATA_SOURCE);
    if (stored === 'local' || stored === 'supabase') {
      return stored as DataSourceMode;
    }
  }
  // If Supabase is configured, default to supabase; otherwise local
  return isSupabaseConfigured() ? 'supabase' : 'local';
};

export const saveStoredDataSourceMode = (mode: DataSourceMode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_DATA_SOURCE, mode);
  }
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseCredentials();
  if (!isSupabaseConfigured()) {
    cachedClient = null;
    return null;
  }
  if (!cachedClient || url !== lastUrl || anonKey !== lastKey) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUrl = url;
      lastKey = anonKey;
    } catch (e) {
      console.error('Error inicializando cliente de Supabase:', e);
      return null;
    }
  }
  return cachedClient;
};

// Export proxy/instance for seamless usage
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
