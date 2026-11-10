import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { authService } from '../../services/authService';
import { LawyerUser } from '../../types';
import { NBA_BRANCHES, PRACTICE_AREAS } from '../../data/mockLegalData';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface SignUpScreenProps {
  onSuccess: (user: LawyerUser) => void;
  onNavigateBack: () => void;
  onNavigateLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
  onNavigateBack,
  onNavigateLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [title, setTitle] = useState<LawyerUser['title']>('Esq.');
  const [fullName, setFullName] = useState('');
  const [scnNumber, setScnNumber] = useState('');
  const [callToBarYear, setCallToBarYear] = useState<number>(2020);
  const [nbaBranch, setNbaBranch] = useState(NBA_BRANCHES[0]);
  const [firmName, setFirmName] = useState('');

  // Step 2 states
  const [practiceArea, setPracticeArea] = useState(PRACTICE_AREAS[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToRpc, setAgreedToRpc] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generate Year options (1970 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i} (${currentYear - i === 2024 ? 'New Wig' : `${currentYear - (currentYear - i)} Yrs at Bar`})`,
  }));

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name as it appears on the Supreme Court roll.');
      return;
    }

    const cleanScn = scnNumber.trim().toUpperCase();
    if (!cleanScn.startsWith('SCN') || cleanScn.length < 6) {
      setErrorMessage('Please enter a valid Supreme Court Enrolment Number (e.g., SCN048291).');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid official/practice email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a reachable practice phone number.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!agreedToRpc) {
      setErrorMessage('Please accept the Rules of Professional Conduct (RPC 2023) commitment.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.signUp({
        email,
        plainPassword: password,
        fullName,
        title,
        scnNumber: scnNumber.trim().toUpperCase(),
        callToBarYear,
        nbaBranch,
        practiceArea,
        phone,
        firmName,
      });

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your details.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <button
          onClick={step === 2 ? () => setStep(1) : onNavigateBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? 'Previous Step' : 'Back'}</span>
        </button>

        <Logo size="sm" />
      </div>

      {/* Progress Indicator */}
      <div className="my-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
          <span className={step === 1 ? 'text-[#E4C47C] font-semibold' : 'text-slate-300'}>
            1. Bar Enrolment
          </span>
          <span className={step === 2 ? 'text-[#E4C47C] font-semibold' : 'text-slate-500'}>
            2. Practice &amp; Security
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#0E223D] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D8B15F] to-[#C5A059] transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Main Form Body */}
      <div className="my-auto py-3">
        <div className="text-left mb-5">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {step === 1 ? 'Practitioner Enrolment' : 'Practice Credentials'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {step === 1
              ? 'Enter your official credentials as enrolled with the Supreme Court of Nigeria.'
              : 'Configure your practice contacts, primary specialization and secure password.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-2.5 text-left text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-3.5 text-left">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1">
                <Select
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value as LawyerUser['title'])}
                  options={[
                    { value: 'Esq.', label: 'Esq.' },
                    { value: 'SAN', label: 'SAN' },
                    { value: 'Barrister', label: 'Barr.' },
                    { value: 'Dr.', label: 'Dr.' },
                    { value: 'Chief', label: 'Chief' },
                  ]}
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Babatunde Adeyemi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <Input
              label="Supreme Court Enrolment Number (SCN)"
              placeholder="e.g. SCN048291"
              value={scnNumber}
              onChange={(e) => setScnNumber(e.target.value.toUpperCase())}
              helperText="Format: SCN followed by your official Supreme Court digit roll"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Call to Bar Year"
                value={callToBarYear}
                onChange={(e) => setCallToBarYear(Number(e.target.value))}
                options={yearOptions}
              />

              <Select
                label="NBA Branch"
                value={nbaBranch}
                onChange={(e) => setNbaBranch(e.target.value)}
                options={NBA_BRANCHES.map((b) => ({ value: b, label: b }))}
              />
            </div>

            <Input
              label="Law Firm / Chamber / Organization (Optional)"
              placeholder="e.g. Aluko & Oyebode or Ministry of Justice"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
            />

            {/* Honest verification status notice */}
            <div className="p-3 rounded-xl bg-[#0E223D]/50 border border-[#C5A059]/20 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <span>
                <strong>Verification Policy:</strong> Self-declared SCN details will be marked for institutional Supreme Court roll cross-referencing upon Supabase database connection.
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Practice Details
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-3.5 text-left">
            <Select
              label="Primary Practice Area"
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              options={PRACTICE_AREAS.map((a) => ({ value: a, label: a }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Practice Email"
                type="email"
                placeholder="counsel@firm.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Direct Phone / WhatsApp"
                type="tel"
                placeholder="+234 803 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* In-memory cryptographic password strength meter */}
            {password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cryptographic Strength</span>
                  <span className="font-semibold text-white">
                    {passwordScore <= 1 ? 'Weak' : passwordScore === 2 ? 'Fair' : passwordScore === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full rounded-full transition-all ${
                        passwordScore >= level
                          ? passwordScore >= 3
                            ? 'bg-emerald-500'
                            : 'bg-[#C5A059]'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ethical and RPC commitment */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreedToRpc}
                  onChange={(e) => setAgreedToRpc(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#091526] border border-[#C5A059]/40 text-[#C5A059] focus:ring-0"
                />
                <span className="leading-relaxed">
                  I solemnly affirm adherence to the <strong>Rules of Professional Conduct for Legal Practitioners (RPC 2023)</strong> and LawEagle Privacy Terms.
                </span>
              </label>
            </div>

            <div className="p-2.5 rounded-lg bg-[#07111D]/80 border border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Zero Plaintext Storage · SHA-256 Client-Hashed &amp; Supabase-Ready</span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Complete Advocate Enrolment
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Switcher */}
      <div className="pt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-[#E4C47C] font-semibold hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
