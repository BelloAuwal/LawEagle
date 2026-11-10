export type Screen = 'splash' | 'login' | 'signup' | 'dashboard';

export type DashboardTab = 'overview' | 'causelist' | 'precedents' | 'learn' | 'network' | 'supabase';

export interface LawyerUser {
  id: string;
  email: string;
  fullName: string;
  title: 'Esq.' | 'SAN' | 'Barrister' | 'Dr.' | 'Chief';
  scnNumber: string; // Supreme Court Enrolment Number (e.g. SCN039281)
  callToBarYear: number;
  nbaBranch: string;
  practiceArea: string;
  phone: string;
  firmName?: string;
  avatarUrl?: string;
  createdAt: string;
  // Non-misleading verification state:
  verificationStatus: 'self_declared_pending_roll_check' | 'supabase_authenticated';
}

export interface CauseListEntry {
  id: string;
  suitNumber: string;
  courtName: string;
  division: string;
  coram: string; // Judge(s) presiding
  parties: string;
  stage: 'Mention' | 'Hearing' | 'Ruling' | 'Cross-Examination' | 'Judgment' | 'Adoption of Briefs';
  date: string;
  time: string;
  courtRoom: string;
  notes?: string;
  advocateRole: 'Counsel for Claimant' | 'Counsel for Defendant' | 'Appellant Counsel' | 'Respondent Counsel';
}

export interface PrecedentDigest {
  id: string;
  title: string;
  citation: string;
  court: 'Supreme Court of Nigeria' | 'Court of Appeal' | 'Federal High Court';
  year: number;
  principles: string[];
  ratioDecidendi: string;
  coram: string;
  area: 'Constitutional Law' | 'Civil Litigation' | 'Corporate & Commercial' | 'Criminal Law' | 'Labour & Employment' | 'Arbitration';
  bookmarked?: boolean;
}

export interface CLEWebinar {
  id: string;
  title: string;
  facilitator: string;
  facilitatorTitle: string;
  date: string;
  duration: string;
  cpdUnits: number;
  topic: string;
  attendeesCount: number;
  isRegistered?: boolean;
}

export interface ColleaguePost {
  id: string;
  authorName: string;
  authorTitle: string;
  authorScn: string;
  nbaBranch: string;
  content: string;
  postType: 'Brief Request' | 'Legal Inquiry' | 'Practice Update' | 'Court Notice';
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConnected: boolean;
  errorMessage?: string;
}
