import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import {
  LawyerUser,
  DashboardTab,
  CauseListEntry,
  PrecedentDigest,
  CLEWebinar,
  ColleaguePost,
} from '../../types';
import {
  INITIAL_CAUSE_LIST,
  INITIAL_PRECEDENTS,
  INITIAL_CLE_WEBINARS,
  INITIAL_COLLEAGUE_POSTS,
} from '../../data/mockLegalData';
import {
  isSupabaseConfigured,
  getCurrentSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  SUPABASE_SCHEMA_SQL,
} from '../../lib/supabase';
import { AddCauseListModal } from '../dashboard/AddCauseListModal';
import { PrecedentDetailModal } from '../dashboard/PrecedentDetailModal';
import { NewPostModal } from '../dashboard/NewPostModal';
import {
  Scale,
  BookOpen,
  Users,
  Database,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  GraduationCap,
  MessageSquare,
  ThumbsUp,
  LogOut,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  Info,
  ExternalLink,
  ChevronRight,
  Gavel,
  Briefcase,
  Layers,
} from 'lucide-react';

interface DashboardScreenProps {
  currentUser: LawyerUser;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Domain data states
  const [causeList, setCauseList] = useState<CauseListEntry[]>(() => {
    const saved = localStorage.getItem('laweagle_causelist');
    return saved ? JSON.parse(saved) : INITIAL_CAUSE_LIST;
  });

  const [precedents, setPrecedents] = useState<PrecedentDigest[]>(INITIAL_PRECEDENTS);
  const [cleWebinars, setCleWebinars] = useState<CLEWebinar[]>(INITIAL_CLE_WEBINARS);
  const [posts, setPosts] = useState<ColleaguePost[]>(INITIAL_COLLEAGUE_POSTS);

  // Modals
  const [isAddCauseModalOpen, setIsAddCauseModalOpen] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<PrecedentDigest | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);

  // Filters & Search
  const [precedentSearch, setPrecedentSearch] = useState('');
  const [precedentAreaFilter, setPrecedentAreaFilter] = useState('All');
  const [causeListFilter, setCauseListFilter] = useState<'All' | 'Today' | 'Upcoming'>('All');
  const [postTypeFilter, setPostTypeFilter] = useState<string>('All');

  // Supabase live configuration state
  const [supabaseConfig, setSupabaseConfig] = useState(getCurrentSupabaseConfig());
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [configUrlInput, setConfigUrlInput] = useState(supabaseConfig.url);
  const [configKeyInput, setConfigKeyInput] = useState(supabaseConfig.anonKey);
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState('');

  // Persist cause list updates
  const updateCauseList = (newList: CauseListEntry[]) => {
    setCauseList(newList);
    localStorage.setItem('laweagle_causelist', JSON.stringify(newList));
  };

  const handleAddCause = (entry: Omit<CauseListEntry, 'id'>) => {
    const newEntry: CauseListEntry = {
      ...entry,
      id: `cl-${Date.now()}`,
    };
    const updated = [newEntry, ...causeList];
    updateCauseList(updated);
  };

  const handleDeleteCause = (id: string) => {
    const updated = causeList.filter((item) => item.id !== id);
    updateCauseList(updated);
  };

  const handleTogglePrecedentBookmark = (id: string) => {
    setPrecedents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p))
    );
    if (selectedPrecedent && selectedPrecedent.id === id) {
      setSelectedPrecedent((prev) =>
        prev ? { ...prev, bookmarked: !prev.bookmarked } : null
      );
    }
  };

  const handleToggleWebinarRegister = (id: string) => {
    setCleWebinars((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isRegistered: !w.isRegistered,
              attendeesCount: w.isRegistered ? w.attendeesCount - 1 : w.attendeesCount + 1,
            }
          : w
      )
    );
  };

  const handleTogglePostLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleAddPost = (newPost: Omit<ColleaguePost, 'id' | 'likesCount' | 'commentsCount'>) => {
    const postRecord: ColleaguePost = {
      ...newPost,
      id: `post-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
    };
    setPosts([postRecord, ...posts]);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleSaveCustomSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrlInput.trim() || !configKeyInput.trim()) {
      setSupabaseSaveMsg('Please provide both Project URL and Anon API key.');
      return;
    }
    saveSupabaseConfig(configUrlInput, configKeyInput);
    setSupabaseConfig(getCurrentSupabaseConfig());
    setSupabaseConnected(isSupabaseConfigured());
    setSupabaseSaveMsg('Supabase configuration saved and initialized successfully!');
    setTimeout(() => setSupabaseSaveMsg(''), 4000);
  };

  const handleClearCustomSupabase = () => {
    clearSupabaseConfig();
    setConfigUrlInput('');
    setConfigKeyInput('');
    setSupabaseConfig(getCurrentSupabaseConfig());
    setSupabaseConnected(false);
    setSupabaseSaveMsg('Supabase credentials reset to default environment settings.');
    setTimeout(() => setSupabaseSaveMsg(''), 4000);
  };

  // Calculations
  const currentYear = new Date().getFullYear();
  const yearsAtBar = currentYear - currentUser.callToBarYear;
  const registeredCLEUnits = cleWebinars
    .filter((w) => w.isRegistered)
    .reduce((acc, curr) => acc + curr.cpdUnits, 0);

  // Filtered Precedents
  const filteredPrecedents = precedents.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(precedentSearch.toLowerCase()) ||
      p.citation.toLowerCase().includes(precedentSearch.toLowerCase()) ||
      p.ratioDecidendi.toLowerCase().includes(precedentSearch.toLowerCase());
    const matchesArea =
      precedentAreaFilter === 'All' || p.area === precedentAreaFilter;
    return matchesSearch && matchesArea;
  });

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    if (postTypeFilter === 'All') return true;
    return p.postType === postTypeFilter;
  });

  return (
    <div className="min-h-full flex flex-col bg-[#060D17] text-slate-100 pb-20 md:pb-8">
      {/* ============================================================== */}
      {/* TOP BAR CONTRACT: Brand — Nav Links — 1 Primary Action */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-[#091526]/90 backdrop-blur-md border-b border-[#C5A059]/25 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo size="sm" />
        </div>

        {/* Zone 2: Navigation Links (Single line text with hover states) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wide uppercase text-slate-300">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('causelist')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === 'causelist'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'hover:text-white'
            }`}
          >
            Cause List
          </button>
          <button
            onClick={() => setActiveTab('precedents')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === 'precedents'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'hover:text-white'
            }`}
          >
            Precedents
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === 'learn'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'hover:text-white'
            }`}
          >
            CLE Hub
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
              activeTab === 'network'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'hover:text-white'
            }`}
          >
            Lounge
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'supabase'
                ? 'text-[#E4C47C] border-b-2 border-[#C5A059]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Ready</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Profile Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {currentUser.title} {currentUser.fullName}
            </span>
            <span className="text-[10px] text-[#E4C47C] font-mono">
              {currentUser.scnNumber}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of practice session"
            className="p-2 rounded-xl bg-[#0E223D] border border-[#C5A059]/30 text-slate-300 hover:text-rose-300 hover:border-rose-400/40 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* PRACTITIONER BANNER (Seniority & NBA Branch Sub-Header) */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-r from-[#0B192C] via-[#0E223D] to-[#07111D] border-b border-[#C5A059]/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[#E4C47C]" />
              {currentUser.firmName || 'Independent Legal Practice'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              NBA {currentUser.nbaBranch}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">
              Call to Bar: <strong>{currentUser.callToBarYear}</strong> ({yearsAtBar} Years at Nigerian Bar)
            </span>
          </div>

          {/* Honest Verification Badge */}
          <button
            onClick={() => setShowVerificationInfo(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07111D]/80 border border-[#C5A059]/30 text-[#E4C47C] hover:border-[#C5A059] transition-colors cursor-pointer text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Self-Declared SCN · Pending Roll Check</span>
            <Info className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT CONTENT CONTAINER */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Hero Welcome & Quick Action Bar */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0B192C] via-[#0F233E] to-[#060D17] border border-[#C5A059]/30 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#E4C47C] mb-1">
                    Nigerian Legal Practice Command
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Welcome, {currentUser.title} {currentUser.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    Where Lawyers Meet, Learn &amp; Win. Your digital court diary, ratio decidendi research repository and peer referral exchange.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button
                    variant="gold"
                    size="md"
                    onClick={() => setIsAddCauseModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Docket Court Appearance
                  </Button>
                  <Button
                    variant="navy"
                    size="md"
                    onClick={() => setActiveTab('precedents')}
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    Search Precedents
                  </Button>
                </div>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setActiveTab('causelist')}
                className="p-4 rounded-xl bg-[#0B192C]/70 border border-[#C5A059]/20 hover:border-[#C5A059]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide">Docketed Matters</span>
                  <Gavel className="w-4 h-4 text-[#E4C47C] group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {causeList.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Across High &amp; Appellate courts</p>
              </div>

              <div
                onClick={() => setActiveTab('precedents')}
                className="p-4 rounded-xl bg-[#0B192C]/70 border border-[#C5A059]/20 hover:border-[#C5A059]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide">Legal Precedents</span>
                  <BookOpen className="w-4 h-4 text-[#E4C47C] group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {precedents.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Supreme Court &amp; CA holdings</p>
              </div>

              <div
                onClick={() => setActiveTab('learn')}
                className="p-4 rounded-xl bg-[#0B192C]/70 border border-[#C5A059]/20 hover:border-[#C5A059]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide">CLE Units Earned</span>
                  <GraduationCap className="w-4 h-4 text-[#E4C47C] group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {registeredCLEUnits} <span className="text-xs font-sans text-[#E4C47C]">CPD pts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Mandatory CLE requirement</p>
              </div>

              <div
                onClick={() => setActiveTab('network')}
                className="p-4 rounded-xl bg-[#0B192C]/70 border border-[#C5A059]/20 hover:border-[#C5A059]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide">Lounge Notices</span>
                  <Users className="w-4 h-4 text-[#E4C47C] group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {posts.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Briefs &amp; registry updates</p>
              </div>
            </div>

            {/* Split Grid: Today's Cause List & Ratio Decidendi Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cause List Schedule Preview (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E4C47C]" />
                    <h3 className="font-serif font-bold text-lg text-white">
                      Cause List &amp; Court Schedule
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('causelist')}
                    className="text-xs font-semibold text-[#E4C47C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Sittings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {causeList.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#0B192C]/80 border border-[#C5A059]/25 hover:border-[#C5A059]/40 transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E4C47C]">
                            {item.suitNumber}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-300 font-medium">
                            {item.stage}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400">
                            {item.advocateRole}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white">
                          {item.parties}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span>{item.courtName} ({item.division})</span>
                          <span>·</span>
                          <span className="italic">{item.coram}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white">
                          <Clock className="w-3.5 h-3.5 text-[#E4C47C]" />
                          <span>{item.date} · {item.time}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1">
                          {item.courtRoom}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratio Decidendi Spotlight (1 Col) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#E4C47C]" />
                    <h3 className="font-serif font-bold text-lg text-white">
                      Ratio Decidendi Spotlight
                    </h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F233E] to-[#07111D] border border-[#C5A059]/40 text-left space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#E4C47C]">
                      Locus Classicus · Jurisdiction
                    </span>
                    <h4 className="font-serif font-bold text-base text-white mt-1">
                      {precedents[0].title}
                    </h4>
                    <p className="font-mono text-xs text-[#E4C47C]">{precedents[0].citation}</p>
                  </div>

                  <p className="text-xs text-slate-200 font-serif italic leading-relaxed bg-[#091526]/70 p-3 rounded-lg border border-slate-800">
                    "{precedents[0].ratioDecidendi}"
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{precedents[0].court}</span>
                    <button
                      onClick={() => setSelectedPrecedent(precedents[0])}
                      className="text-xs font-semibold text-[#E4C47C] hover:underline cursor-pointer"
                    >
                      Examine Full Digest
                    </button>
                  </div>
                </div>

                {/* Supabase Readiness Card Banner */}
                <div
                  onClick={() => setActiveTab('supabase')}
                  className="p-4 rounded-xl bg-[#091526] border border-[#C5A059]/25 flex items-center justify-between gap-3 text-left hover:border-[#C5A059]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#E4C47C]">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-[#E4C47C] transition-colors">
                        Supabase Backend &amp; RLS Ready
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {supabaseConnected ? 'Live Connection Active' : 'Ready to link Project URL & Schema'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CAUSE LIST ================= */}
        {activeTab === 'causelist' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Court Cause List &amp; Appearance Diary
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track court sittings, coram, suit numbers, and hearing notes across Nigerian jurisdictions.
                </p>
              </div>

              <Button
                variant="gold"
                size="md"
                onClick={() => setIsAddCauseModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Docket New Sitting
              </Button>
            </div>

            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-[#091526] border border-slate-800 rounded-xl w-fit">
              {(['All', 'Today', 'Upcoming'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCauseListFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    causeListFilter === filter
                      ? 'bg-[#C5A059] text-[#07111D] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter} Sittings
                </button>
              ))}
            </div>

            {/* Cause List Entries */}
            <div className="space-y-3.5">
              {causeList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#091526] border border-dashed border-slate-800">
                  <Gavel className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-white">No Cause List Entries</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Your court diary is currently clear. Docket an appearance to keep track of hearing dates and notes.
                  </p>
                  <Button
                    variant="gold"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsAddCauseModalOpen(true)}
                  >
                    Docket First Court Matter
                  </Button>
                </div>
              ) : (
                causeList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#0B192C]/80 border border-[#C5A059]/25 hover:border-[#C5A059]/45 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#E4C47C]">
                          {item.suitNumber}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#0E223D] text-slate-200 border border-[#C5A059]/30">
                          {item.stage}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-300">
                          {item.advocateRole}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-white">
                        <span className="flex items-center gap-1.5 text-[#E4C47C]">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.time}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-white">
                        {item.parties}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.courtName} · {item.division} · Coram: <span className="text-slate-300 font-medium">{item.coram}</span> ({item.courtRoom})
                      </p>
                    </div>

                    {item.notes && (
                      <div className="p-3 rounded-lg bg-[#07111D] border border-slate-800 text-xs text-slate-300">
                        <strong className="text-[#E4C47C]">Counsel Strategy: </strong>
                        {item.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => handleDeleteCause(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-white/5 text-xs flex items-center gap-1 cursor-pointer"
                        title="Delete sitting entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRECEDENTS & RESEARCH ================= */}
        {activeTab === 'precedents' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Judicial Precedents &amp; Ratio Decidendi
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Authoritative law report summaries and landmark rulings of Nigerian superior courts of record.
                </p>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search citation, case title, or principle of law (e.g. Madukolu, Jurisdiction, Garnishee)..."
                  value={precedentSearch}
                  onChange={(e) => setPrecedentSearch(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl bg-[#091526] border border-[#C5A059]/30 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm pl-10 pr-4 outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Civil Litigation', 'Constitutional Law', 'Corporate & Commercial'].map(
                  (area) => (
                    <button
                      key={area}
                      onClick={() => setPrecedentAreaFilter(area)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                        precedentAreaFilter === area
                          ? 'bg-[#C5A059] text-[#07111D] font-semibold'
                          : 'bg-[#091526] text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      {area}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Precedents Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrecedents.map((prec) => (
                <div
                  key={prec.id}
                  className="p-5 rounded-2xl bg-[#0B192C]/80 border border-[#C5A059]/25 hover:border-[#C5A059]/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4C47C]">
                        {prec.area} · {prec.court}
                      </span>
                      <button
                        onClick={() => handleTogglePrecedentBookmark(prec.id)}
                        className="text-slate-400 hover:text-[#C5A059] transition-colors p-1"
                        aria-label="Bookmark precedent"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            prec.bookmarked ? 'text-[#C5A059] fill-[#C5A059]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-white">
                      {prec.title}
                    </h4>
                    <p className="font-mono text-xs text-[#E4C47C] font-semibold">
                      {prec.citation}
                    </p>

                    <p className="text-xs text-slate-300 font-serif italic line-clamp-3 bg-[#091526]/60 p-3 rounded-lg border border-slate-800/80">
                      "{prec.ratioDecidendi}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{prec.year}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrecedent(prec)}
                    >
                      Examine Principles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: CLE & MASTERCLASSES ================= */}
        {activeTab === 'learn' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Continuing Legal Education (CLE) &amp; Masterclasses
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Accredited NBA Continuing Legal Education courses to earn mandatory CPD credit units.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0E223D] border border-[#C5A059]/30">
                <GraduationCap className="w-5 h-5 text-[#E4C47C]" />
                <div className="text-xs">
                  <span className="text-slate-400">Total Enrolled CPD: </span>
                  <strong className="text-white font-mono text-sm">{registeredCLEUnits} Units</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cleWebinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="p-5 rounded-2xl bg-[#0B192C]/80 border border-[#C5A059]/25 hover:border-[#C5A059]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4C47C]">
                        {webinar.topic}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-mono text-white font-semibold">
                        {webinar.cpdUnits} Mandatory CPD Units
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                      {webinar.title}
                    </h4>

                    <div className="text-xs text-slate-300">
                      <span>Facilitator: </span>
                      <strong className="text-white">{webinar.facilitator}</strong>
                      <span className="text-slate-400"> — {webinar.facilitatorTitle}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>{webinar.date}</span>
                      <span>·</span>
                      <span>{webinar.duration}</span>
                      <span>·</span>
                      <span>{webinar.attendeesCount} Registered Advocates</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      variant={webinar.isRegistered ? 'navy' : 'gold'}
                      size="md"
                      onClick={() => handleToggleWebinarRegister(webinar.id)}
                    >
                      {webinar.isRegistered ? 'Registered (Withdraw)' : 'Enroll in Masterclass'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: COLLEAGUE LOUNGE ================= */}
        {activeTab === 'network' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Colleague Lounge &amp; Brief Exchange
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect across 128+ branches, exchange court instructions, and hold briefs in distant jurisdictions.
                </p>
              </div>

              <Button
                variant="gold"
                size="md"
                onClick={() => setIsNewPostModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Post Brief Notice
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Brief Request', 'Legal Inquiry', 'Practice Update'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPostTypeFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    postTypeFilter === cat
                      ? 'bg-[#C5A059] text-[#07111D] font-semibold'
                      : 'bg-[#091526] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[#0B192C]/80 border border-[#C5A059]/25 hover:border-[#C5A059]/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#0E223D] border border-[#C5A059]/40 flex items-center justify-center font-serif font-bold text-sm text-[#E4C47C]">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">
                            {post.authorTitle} {post.authorName}
                          </h4>
                          <span className="text-[10px] font-mono text-[#E4C47C] border border-[#C5A059]/30 px-1 py-0.2 rounded">
                            {post.authorScn}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          NBA {post.nbaBranch} · {post.timestamp}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E4C47C] bg-[#0E223D] px-2.5 py-1 rounded-lg border border-[#C5A059]/25">
                      {post.postType}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleTogglePostLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                        post.isLiked
                          ? 'text-[#E4C47C] font-semibold bg-[#C5A059]/10'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likesCount} Colleague Endorsements</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} Direct Replies</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: SUPABASE INTEGRATION & ARCHITECTURE ================= */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 text-left max-w-4xl">
            <div className="pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#E4C47C]" />
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Supabase Integration &amp; Database Architecture
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                LawEagle is pre-architected for seamless Supabase PostgreSQL storage, Row Level Security (RLS), and institutional authentication.
              </p>
            </div>

            {/* Connection Status Banner */}
            <div className="p-4 rounded-xl bg-[#0B192C] border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    {supabaseConnected
                      ? 'Live Supabase Connection Established'
                      : 'Offline Cryptographic Mode (Ready to Connect)'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {supabaseConnected
                      ? `Target Project: ${supabaseConfig.url}`
                      : 'Currently using Web Crypto SHA-256 local storage. Enter your Supabase credentials below to activate cloud persistence.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopySchema}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0E223D] text-xs font-semibold text-[#E4C47C] border border-[#C5A059]/40 hover:bg-[#153158] transition-colors shrink-0 cursor-pointer"
              >
                {copiedSchema ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy Supabase DDL SQL'}</span>
              </button>
            </div>

            {/* Credentials Setup Form */}
            <form onSubmit={handleSaveCustomSupabase} className="p-5 rounded-2xl bg-[#091526] border border-[#C5A059]/20 space-y-4">
              <h3 className="font-serif font-bold text-base text-white">
                Live Supabase Project Configuration
              </h3>
              <p className="text-xs text-slate-400">
                You can link a live Supabase project by providing the project URL and public anon key from your Supabase Dashboard under <strong>Settings &gt; API</strong>.
              </p>

              {supabaseSaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{supabaseSaveMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-slate-300 mb-1.5">
                    VITE_SUPABASE_URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={configUrlInput}
                    onChange={(e) => setConfigUrlInput(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl bg-[#0B192C] border border-[#C5A059]/30 text-slate-100 text-xs px-3.5 outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-slate-300 mb-1.5">
                    VITE_SUPABASE_ANON_KEY
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={configKeyInput}
                    onChange={(e) => setConfigKeyInput(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl bg-[#0B192C] border border-[#C5A059]/30 text-slate-100 text-xs px-3.5 outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="gold" size="sm">
                  Save &amp; Connect Supabase
                </Button>
                {supabaseConnected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCustomSupabase}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </form>

            {/* Database Entities & RLS Documentation */}
            <div className="p-5 rounded-2xl bg-[#0B192C]/80 border border-slate-800 space-y-4">
              <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E4C47C]" />
                <span>Architected Database Tables &amp; Security Schema</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#091526] border border-slate-800 space-y-1">
                  <div className="font-mono font-bold text-[#E4C47C]">public.profiles</div>
                  <p className="text-slate-300">
                    Linked to <code>auth.users(id)</code> with SCN number, Call to Bar year, NBA branch, and practice area.
                  </p>
                  <div className="text-[11px] text-emerald-400">RLS: Private edit, colleague read</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091526] border border-slate-800 space-y-1">
                  <div className="font-mono font-bold text-[#E4C47C]">public.cause_list</div>
                  <p className="text-slate-300">
                    Sittings, suit numbers, presiding judge, hearing stage, and counsel strategy notes.
                  </p>
                  <div className="text-[11px] text-emerald-400">RLS: Strictly private to advocate</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091526] border border-slate-800 space-y-1">
                  <div className="font-mono font-bold text-[#E4C47C]">public.precedent_digests</div>
                  <p className="text-slate-300">
                    Supreme Court &amp; Court of Appeal binding holdings, coram, citations, and ratio decidendi.
                  </p>
                  <div className="text-[11px] text-emerald-400">RLS: Public read for authenticated</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091526] border border-slate-800 space-y-1">
                  <div className="font-mono font-bold text-[#E4C47C]">public.discussions</div>
                  <p className="text-slate-300">
                    Colleague Lounge notices, brief holding requests, and cross-branch inquiries.
                  </p>
                  <div className="text-[11px] text-emerald-400">RLS: Authenticated read &amp; post</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MOBILE FIXED BOTTOM TAB BAR (Thumb ergonomics, <15% sticky height) */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#091526]/95 backdrop-blur-md border-t border-[#C5A059]/30 h-16 px-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'overview' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gavel className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('causelist')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'causelist' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Cause List</span>
        </button>

        <button
          onClick={() => setActiveTab('precedents')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'precedents' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Precedents</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'learn' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">CLE Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'network' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Lounge</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] cursor-pointer ${
            activeTab === 'supabase' ? 'text-[#E4C47C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Database</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* INTERACTIVE MODALS */}
      {/* ============================================================== */}
      <AddCauseListModal
        isOpen={isAddCauseModalOpen}
        onClose={() => setIsAddCauseModalOpen(false)}
        onAdd={handleAddCause}
      />

      <PrecedentDetailModal
        precedent={selectedPrecedent}
        isOpen={Boolean(selectedPrecedent)}
        onClose={() => setSelectedPrecedent(null)}
        onToggleBookmark={handleTogglePrecedentBookmark}
      />

      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        currentUser={currentUser}
        onAddPost={handleAddPost}
      />

      {/* Honest Verification Details Modal */}
      {showVerificationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0B192C] border border-[#C5A059]/40 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-2.5 text-[#E4C47C]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-white">
                Supreme Court Roll Status
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In strict accordance with legal technology compliance standards, LawEagle <strong>never implements simulated or fake verification badges</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-[#0E223D] border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Supreme Court Enrolment:</span>
                <span className="font-mono font-bold text-[#E4C47C]">{currentUser.scnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Practitioner Name:</span>
                <span className="text-white font-medium">{currentUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch Affiliation:</span>
                <span className="text-white">{currentUser.nbaBranch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-300 font-semibold">Self-Declared (Pending Bar Integration)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              When linked to your Supabase instance, accounts can be cross-referenced with institutional Bar databases or Supreme Court electronic rolls via webhook.
            </p>

            <Button
              variant="gold"
              size="md"
              fullWidth
              onClick={() => setShowVerificationInfo(false)}
            >
              Understood
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
