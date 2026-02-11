import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const projectDefaultUrl = 'https://vnovztzvnqairqnawiii.supabase.co';

function normalizeSupabaseUrl(url) {
  const value = String(url || '').trim().replace(/\/+$/, '');
  if (!value) return '';

  // Known typo guard: qairoq -> qairq
  return value.replace('qairoq', 'qairq');
}

const configuredSupabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseUrls = Array.from(
  new Set([configuredSupabaseUrl, projectDefaultUrl].filter(Boolean))
);

if (!supabaseAnonKey) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_ANON_KEY. Data requests will fail until configured.'
  );
}

if (!configuredSupabaseUrl && supabaseUrls.length > 0) {
  console.warn(`[supabase] VITE_SUPABASE_URL is empty. Falling back to ${supabaseUrls[0]}.`);
}

if (configuredSupabaseUrl && configuredSupabaseUrl !== (import.meta.env.VITE_SUPABASE_URL || '').trim()) {
  console.warn(`[supabase] Normalized VITE_SUPABASE_URL to ${configuredSupabaseUrl}.`);
}

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

const clients = supabaseUrls.map((url) =>
  createClient(url, supabaseAnonKey || 'invalid', clientOptions)
);

if (clients.length === 0) {
  clients.push(createClient('https://invalid.local', supabaseAnonKey || 'invalid', clientOptions));
}

export function getSupabaseClients() {
  return clients;
}
