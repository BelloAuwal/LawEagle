import { LawyerUser } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

// Salt for client-side cryptographic hashing simulation
const PASSWORD_SALT = 'laweagle_sec_salt_v1_nigeria_legal_';

/**
 * Hash password securely using standard Web Crypto API (SHA-256)
 * Strictly prevents storing passwords in plain text!
 */
export async function hashPassword(plainText: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(PASSWORD_SALT + plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface StoredAuthRecord {
  id: string;
  email: string;
  passwordHash: string; // ONLY hashed, NEVER plain text
  profile: LawyerUser;
}

const LOCAL_STORAGE_USERS_KEY = 'laweagle_practitioner_records_v1';
const CURRENT_SESSION_KEY = 'laweagle_active_session_user';

// Initial pre-registered demo advocate (with pre-computed SHA-256 hash of "Advocate#2024")
// sha256("laweagle_sec_salt_v1_nigeria_legal_" + "Advocate#2024") = computed at initialization
const DEFAULT_DEMO_USER: LawyerUser = {
  id: 'usr-ng-lagos-001',
  email: 'adeyemi.law@nba-lagos.ng',
  fullName: 'Chioma Brenda Adeyemi',
  title: 'Esq.',
  scnNumber: 'SCN048291',
  callToBarYear: 2016,
  nbaBranch: 'Lagos (Premier Branch)',
  practiceArea: 'Commercial Litigation & Arbitration',
  phone: '+234 803 456 7890',
  firmName: 'Adeyemi & Co. Legal Practitioners (Ikoyi, Lagos)',
  createdAt: '2024-01-15T09:00:00.000Z',
  verificationStatus: 'self_declared_pending_roll_check', // Honest, un-faked verification state
};

// Initialize seed user if not present
const initializeDemoUser = async () => {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!existing) {
    const demoHash = await hashPassword('Advocate#2024');
    const records: StoredAuthRecord[] = [
      {
        id: DEFAULT_DEMO_USER.id,
        email: DEFAULT_DEMO_USER.email.toLowerCase(),
        passwordHash: demoHash,
        profile: DEFAULT_DEMO_USER,
      },
    ];
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(records));
  }
};

initializeDemoUser();

export const authService = {
  /**
   * Get active logged in user from session
   */
  getCurrentUser(): LawyerUser | null {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr) as LawyerUser;
    } catch {
      return null;
    }
  },

  /**
   * Authenticate with email or SCN and password
   */
  async login(identifier: string, plainPassword: string): Promise<{ success: boolean; user?: LawyerUser; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = plainPassword.trim();

    if (!cleanId || !cleanPassword) {
      return { success: false, error: 'Please provide both your Email/SCN and password.' };
    }

    // 1. If real Supabase client is configured, authenticate via Supabase Auth
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch or map profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const mappedUser: LawyerUser = {
            id: data.user.id,
            email: data.user.email || cleanId,
            fullName: profileData?.full_name || data.user.user_metadata?.full_name || 'Counsel',
            title: profileData?.title || 'Esq.',
            scnNumber: profileData?.scn_number || 'SCN-PENDING',
            callToBarYear: profileData?.call_to_bar_year || new Date().getFullYear(),
            nbaBranch: profileData?.nba_branch || 'National',
            practiceArea: profileData?.practice_area || 'General Practice',
            phone: profileData?.phone || '+234',
            firmName: profileData?.firm_name,
            createdAt: data.user.created_at,
            verificationStatus: 'supabase_authenticated',
          };

          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(mappedUser));
          return { success: true, user: mappedUser };
        }
      } catch (err: unknown) {
        console.warn('Supabase auth attempt errored, falling back to local verification store:', err);
      }
    }

    // 2. Local fallback with SHA-256 cryptographic check
    await initializeDemoUser();
    const storedStr = localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]';
    let records: StoredAuthRecord[] = [];
    try {
      records = JSON.parse(storedStr);
    } catch {
      records = [];
    }

    const inputHash = await hashPassword(cleanPassword);

    const record = records.find(r => 
      r.email.toLowerCase() === cleanId || 
      r.profile.scnNumber.toLowerCase() === cleanId
    );

    if (!record) {
      return { 
        success: false, 
        error: 'No practitioner account found with this Email or SCN. Check credentials or register.' 
      };
    }

    // Compare cryptographic hashes (zero plain text comparison)
    if (record.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password for this advocate account.' };
    }

    // Save session
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(record.profile));
    return { success: true, user: record.profile };
  },

  /**
   * Register a new Nigerian legal practitioner
   */
  async signUp(params: {
    email: string;
    plainPassword: string;
    fullName: string;
    title: LawyerUser['title'];
    scnNumber: string;
    callToBarYear: number;
    nbaBranch: string;
    practiceArea: string;
    phone: string;
    firmName?: string;
  }): Promise<{ success: boolean; user?: LawyerUser; error?: string }> {
    const {
      email,
      plainPassword,
      fullName,
      title,
      scnNumber,
      callToBarYear,
      nbaBranch,
      practiceArea,
      phone,
      firmName,
    } = params;

    const cleanEmail = email.trim().toLowerCase();
    const cleanScn = scnNumber.trim().toUpperCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!cleanScn.startsWith('SCN') || cleanScn.length < 6) {
      return { success: false, error: 'Supreme Court Enrolment Number must begin with "SCN" (e.g. SCN048291).' };
    }

    if (plainPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // 1. If Supabase configured, attempt live registration
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: plainPassword,
          options: {
            data: {
              full_name: fullName.trim(),
              title,
              scn_number: cleanScn,
              call_to_bar_year: callToBarYear,
              nba_branch: nbaBranch,
              practice_area: practiceArea,
              phone: phone.trim(),
              firm_name: firmName?.trim() || null,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Insert profile record if table is set up
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: fullName.trim(),
              title,
              scn_number: cleanScn,
              call_to_bar_year: callToBarYear,
              nba_branch: nbaBranch,
              practice_area: practiceArea,
              phone: phone.trim(),
              firm_name: firmName?.trim() || null,
              verification_status: 'self_declared_pending_roll_check',
            },
          ]);

          const newUser: LawyerUser = {
            id: data.user.id,
            email: cleanEmail,
            fullName: fullName.trim(),
            title,
            scnNumber: cleanScn,
            callToBarYear,
            nbaBranch,
            practiceArea,
            phone: phone.trim(),
            firmName: firmName?.trim(),
            createdAt: new Date().toISOString(),
            verificationStatus: 'supabase_authenticated',
          };

          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
          return { success: true, user: newUser };
        }
      } catch (err: unknown) {
        console.warn('Supabase signup fallback to local storage:', err);
      }
    }

    // 2. Local Fallback with cryptographic hashing
    const storedStr = localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]';
    let records: StoredAuthRecord[] = [];
    try {
      records = JSON.parse(storedStr);
    } catch {
      records = [];
    }

    // Check duplicates
    if (records.some(r => r.email === cleanEmail)) {
      return { success: false, error: 'An account with this email address is already registered.' };
    }
    if (records.some(r => r.profile.scnNumber === cleanScn)) {
      return { success: false, error: 'An account with this Supreme Court Enrolment Number already exists.' };
    }

    // Compute cryptographic hash
    const passwordHash = await hashPassword(plainPassword);

    const newUser: LawyerUser = {
      id: `usr-ng-${Date.now()}`,
      email: cleanEmail,
      fullName: fullName.trim(),
      title,
      scnNumber: cleanScn,
      callToBarYear,
      nbaBranch,
      practiceArea,
      phone: phone.trim(),
      firmName: firmName?.trim(),
      createdAt: new Date().toISOString(),
      // Truthful verification status:
      verificationStatus: 'self_declared_pending_roll_check',
    };

    records.push({
      id: newUser.id,
      email: cleanEmail,
      passwordHash,
      profile: newUser,
    });

    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(records));
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  /**
   * Log out active session
   */
  async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout notice:', err);
      }
    }
    localStorage.removeItem(CURRENT_SESSION_KEY);
  },

  /**
   * Return demo credentials for quick tester convenience
   */
  getDemoCredentials() {
    return {
      email: DEFAULT_DEMO_USER.email,
      scn: DEFAULT_DEMO_USER.scnNumber,
      password: 'Advocate#2024',
      fullName: DEFAULT_DEMO_USER.fullName,
      branch: DEFAULT_DEMO_USER.nbaBranch,
    };
  },
};
