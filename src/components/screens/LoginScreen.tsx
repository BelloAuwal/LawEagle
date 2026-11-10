import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { authService } from '../../services/authService';
import { LawyerUser } from '../../types';
import { ArrowLeft, KeyRound, Mail, Sparkles, AlertCircle, Shield } from 'lucide-react';

interface LoginScreenProps {
  onSuccess: (user: LawyerUser) => void;
  onNavigateBack: () => void;
  onNavigateSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateBack,
  onNavigateSignUp,
  onForgotPassword,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Email address or Supreme Court Enrolment Number (SCN).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(identifier, password);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('A network error occurred while authenticating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    const creds = authService.getDemoCredentials();
    setIdentifier(creds.email);
    setPassword(creds.password);
    setErrorMessage('');
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 max-w-md mx-auto">
      {/* Top navigation header */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={onNavigateBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-1.5 text-xs"
          aria-label="Back to splash"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </button>

        <Logo size="sm" />
      </div>

      {/* Main Login Form Container */}
      <div className="my-auto py-4">
        <div className="text-left mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Advocate Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Access your cause list, precedent digests and legal community.
          </p>
        </div>

        {/* Demo Fast Fill Card */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#0E223D]/70 border border-[#C5A059]/30 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center shrink-0 text-[#E4C47C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Reviewer Quick Access</p>
              <p className="text-[11px] text-slate-300">Test as Barrister C. Adeyemi (Lagos Branch)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-medium text-[#E4C47C] hover:text-white bg-[#0B192C] px-3 py-1.5 rounded-lg border border-[#C5A059]/40 hover:border-[#C5A059] transition-all shrink-0 cursor-pointer"
          >
            Fill Demo
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-2.5 text-left text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or SCN Number"
            type="text"
            placeholder="e.g. adeyemi@law.ng or SCN048291"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your advocate account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#091526] border border-[#C5A059]/40 text-[#C5A059] focus:ring-0 focus:ring-offset-0"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#E4C47C] hover:underline transition-colors font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Sign In to LawEagle
            </Button>
          </div>
        </form>

        <div className="mt-4 p-2.5 rounded-lg bg-[#07111D]/80 border border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Zero Plaintext Storage · SHA-256 / Supabase Encrypted</span>
        </div>
      </div>

      {/* Footer Switcher */}
      <div className="pt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Not yet registered on LawEagle?{' '}
          <button
            type="button"
            onClick={onNavigateSignUp}
            className="text-[#E4C47C] font-semibold hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};
