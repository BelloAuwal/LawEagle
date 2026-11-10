import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Reads from Vite environment variables or dynamic developer configuration
const getStoredConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('laweagle_supabase_url');
    const customKey = localStorage.getItem('laweagle_supabase_anon_key');
    if (customUrl && customKey) {
      return { url: customUrl, anonKey: customKey };
    }
  }

  return { url: envUrl, anonKey: envKey };
};

let currentClient: SupabaseClient | null = null;
let currentConfig = getStoredConfig();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    currentConfig.url &&
    currentConfig.anonKey &&
    currentConfig.url.startsWith('https://') &&
    currentConfig.anonKey.length > 20
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!currentClient) {
    try {
      currentClient = createClient(currentConfig.url, currentConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return currentClient;
};

export const saveSupabaseConfig = (url: string, anonKey: string): boolean => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('laweagle_supabase_url', url.trim());
    localStorage.setItem('laweagle_supabase_anon_key', anonKey.trim());
    currentConfig = { url: url.trim(), anonKey: anonKey.trim() };
    currentClient = null; // force re-instantiation
    return true;
  }
  return false;
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('laweagle_supabase_url');
    localStorage.removeItem('laweagle_supabase_anon_key');
    currentConfig = {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };
    currentClient = null;
  }
};

export const getCurrentSupabaseConfig = () => currentConfig;

/**
 * Production-ready PostgreSQL & Supabase SQL Schema for LawEagle.
 * Ready to copy and paste directly into the Supabase SQL Editor.
 */
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================
-- LAWEAGLE: NIGERIAN LEGAL PRACTITIONERS PLATFORM
-- Supabase Schema & Row Level Security (RLS) Configuration
-- ==============================================================

-- 1. Lawyer Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Esq.',
  scn_number TEXT NOT NULL UNIQUE, -- Supreme Court Enrolment Number (e.g. SCN048291)
  call_to_bar_year INTEGER NOT NULL CHECK (call_to_bar_year >= 1960 AND call_to_bar_year <= 2030),
  nba_branch TEXT NOT NULL,
  practice_area TEXT NOT NULL,
  phone TEXT NOT NULL,
  firm_name TEXT,
  avatar_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'self_declared_pending_roll_check',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Cause List & Court Diary
CREATE TABLE IF NOT EXISTS public.cause_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suit_number TEXT NOT NULL,
  court_name TEXT NOT NULL,
  division TEXT NOT NULL,
  coram TEXT NOT NULL,
  parties TEXT NOT NULL,
  stage TEXT NOT NULL,
  hearing_date DATE NOT NULL,
  hearing_time TIME NOT NULL,
  court_room TEXT,
  advocate_role TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Supreme Court & Court of Appeal Precedent Digests
CREATE TABLE IF NOT EXISTS public.precedent_digests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  citation TEXT NOT NULL,
  court TEXT NOT NULL,
  judgment_year INTEGER NOT NULL,
  area TEXT NOT NULL,
  principles TEXT[] NOT NULL,
  ratio_decidendi TEXT NOT NULL,
  coram TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Colleague Lounge Discussions & Brief Referrals
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_scn TEXT NOT NULL,
  nba_branch TEXT NOT NULL,
  post_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cause_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precedent_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Profiles: Users can view all verified peer profiles, but only edit their own
CREATE POLICY "Lawyers can view colleague profiles" 
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lawyers can insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Lawyers can update own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Cause List: Strictly private to the individual practitioner
CREATE POLICY "Lawyers can manage own cause list" 
  ON public.cause_list FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Precedent Digests: Read-only for authenticated practitioners
CREATE POLICY "Authenticated users can read legal precedents" 
  ON public.precedent_digests FOR SELECT TO authenticated USING (true);

-- Discussions: Authenticated lawyers can read and post
CREATE POLICY "Lawyers can view discussions" 
  ON public.discussions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lawyers can insert discussions" 
  ON public.discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
`;
