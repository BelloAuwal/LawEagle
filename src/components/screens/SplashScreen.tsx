import React from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { ArrowRight, Scale, BookOpen, Users, ShieldCheck, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onNavigateLogin: () => void;
  onNavigateSignUp: () => void;
  onExploreGuest: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onNavigateLogin,
  onNavigateSignUp,
  onExploreGuest,
}) => {
  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-10 max-w-lg mx-auto text-center relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-60 h-60 bg-[#153158]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <Logo size="md" />
        <span className="text-[11px] font-semibold text-[#E4C47C] tracking-wide border border-[#C5A059]/30 rounded-full px-2.5 py-0.5 bg-[#0B192C]/60">
          Nigeria Edition
        </span>
      </div>

      {/* Hero Body */}
      <div className="my-auto py-6 flex flex-col items-center">
        {/* Heraldic Emblem Showcase */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0E223D] to-[#07111D] border-2 border-[#C5A059]/60 flex items-center justify-center shadow-2xl shadow-[#C5A059]/20 gold-border-glow">
            <Scale className="w-12 h-12 text-[#E4C47C]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#0B192C] border border-[#C5A059]/50 rounded-lg p-1.5 shadow-md">
            <span className="text-xs">🇳🇬</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
          Law<span className="gold-gradient-text">Eagle</span>
        </h1>

        <p className="font-serif italic text-base sm:text-lg text-[#E4C47C] font-medium mb-3">
          "Where Lawyers Meet, Learn &amp; Win"
        </p>

        <p className="text-sm text-slate-300 max-w-sm mb-8 leading-relaxed">
          The sovereign digital practice companion engineered specifically for Nigerian legal practitioners across all 128+ branches.
        </p>

        {/* 3 Pillars: Meet, Learn, Win */}
        <div className="w-full grid grid-cols-1 gap-3 text-left mb-8">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B192C]/80 border border-[#C5A059]/20 transition-all hover:border-[#C5A059]/40">
            <div className="w-9 h-9 rounded-lg bg-[#0E223D] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#E4C47C]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                01. Where Lawyers Meet
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Bar colleagues directory, holding briefs, and cross-jurisdictional referrals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B192C]/80 border border-[#C5A059]/20 transition-all hover:border-[#C5A059]/40">
            <div className="w-9 h-9 rounded-lg bg-[#0E223D] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#E4C47C]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                02. Where Lawyers Learn
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Supreme Court ratio decidendi, NWLR precedent digests &amp; accredited CLE units.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B192C]/80 border border-[#C5A059]/20 transition-all hover:border-[#C5A059]/40">
            <div className="w-9 h-9 rounded-lg bg-[#0E223D] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#E4C47C]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                03. Where Lawyers Win
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Court Cause List diary, appearance tracker, and motion preparation workflows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Zone (Thumb ergonomics) */}
      <div className="w-full space-y-3 pt-2">
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={onNavigateSignUp}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Practitioner Account
        </Button>

        <Button
          variant="navy"
          size="md"
          fullWidth
          onClick={onNavigateLogin}
        >
          Sign In to Practice Hub
        </Button>

        <button
          onClick={onExploreGuest}
          className="w-full py-2 text-xs text-slate-400 hover:text-[#E4C47C] transition-colors flex items-center justify-center gap-1 font-medium"
        >
          <span>Preview Workspace Demo Directly</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Prepared for Supabase Auth &amp; Enterprise Database</span>
        </div>
      </div>
    </div>
  );
};
