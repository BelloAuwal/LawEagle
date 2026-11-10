import { useState, useEffect } from 'react';
import { Screen, LawyerUser } from './types';
import { authService } from './services/authService';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ForgotPasswordModal } from './components/common/ForgotPasswordModal';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [currentUser, setCurrentUser] = useState<LawyerUser | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'responsive'>('responsive');

  useEffect(() => {
    // Check for existing active session
    const existing = authService.getCurrentUser();
    if (existing) {
      setCurrentUser(existing);
      setCurrentScreen('dashboard');
    }
  }, []);

  const handleLoginSuccess = (user: LawyerUser) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleSignUpSuccess = (user: LawyerUser) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCurrentScreen('splash');
  };

  const handleExploreGuest = () => {
    // Use pre-seeded demo user for immediate review without authentication friction
    const creds = authService.getDemoCredentials();
    const guestUser: LawyerUser = {
      id: 'usr-ng-demo-guest',
      email: creds.email,
      fullName: creds.fullName,
      title: 'Esq.',
      scnNumber: creds.scn,
      callToBarYear: 2016,
      nbaBranch: creds.branch,
      practiceArea: 'Commercial Litigation & Arbitration',
      phone: '+234 803 456 7890',
      firmName: 'Adeyemi & Co. Legal Practitioners',
      createdAt: new Date().toISOString(),
      verificationStatus: 'self_declared_pending_roll_check',
    };
    setCurrentUser(guestUser);
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050C16] text-slate-100 flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#0B192C]">
      {/* Top Subtle Developer / Reviewer Mode Switcher */}
      <div className="bg-[#091526]/90 border-b border-[#C5A059]/20 px-4 py-1.5 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200">LawEagle NG</span>
          <span className="hidden sm:inline text-slate-400">· Where Lawyers Meet, Learn &amp; Win</span>
        </div>

        <div className="flex items-center gap-1 bg-[#060D17] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              previewMode === 'mobile'
                ? 'bg-[#C5A059] text-[#07111D] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device (390px)</span>
          </button>

          <button
            onClick={() => setPreviewMode('responsive')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              previewMode === 'responsive'
                ? 'bg-[#C5A059] text-[#07111D] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Responsive View</span>
          </button>
        </div>
      </div>

      {/* Main Container: Supports both Mobile Frame and Full Responsive View */}
      <div className="flex-1 flex flex-col items-center justify-center p-0">
        {previewMode === 'mobile' ? (
          <div className="py-6 px-2 flex items-center justify-center w-full">
            {/* Realistic smartphone device frame */}
            <div className="w-[390px] h-[844px] max-h-[92vh] bg-[#060D17] rounded-[44px] border-[6px] border-[#153158] shadow-[0_0_50px_rgba(11,25,44,0.9)] flex flex-col overflow-hidden relative">
              {/* Dynamic Island / Speaker notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-[#111] mr-3" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a1829]" />
              </div>

              {/* Scrollable screen content */}
              <div className="flex-1 overflow-y-auto pt-6 flex flex-col">
                {currentScreen === 'splash' && (
                  <SplashScreen
                    onNavigateLogin={() => setCurrentScreen('login')}
                    onNavigateSignUp={() => setCurrentScreen('signup')}
                    onExploreGuest={handleExploreGuest}
                  />
                )}

                {currentScreen === 'login' && (
                  <LoginScreen
                    onSuccess={handleLoginSuccess}
                    onNavigateBack={() => setCurrentScreen('splash')}
                    onNavigateSignUp={() => setCurrentScreen('signup')}
                    onForgotPassword={() => setIsForgotPasswordOpen(true)}
                  />
                )}

                {currentScreen === 'signup' && (
                  <SignUpScreen
                    onSuccess={handleSignUpSuccess}
                    onNavigateBack={() => setCurrentScreen('splash')}
                    onNavigateLogin={() => setCurrentScreen('login')}
                  />
                )}

                {currentScreen === 'dashboard' && currentUser && (
                  <DashboardScreen
                    currentUser={currentUser}
                    onLogout={handleLogout}
                  />
                )}
              </div>

              {/* Mobile Home Bar */}
              <div className="h-4 bg-[#060D17] flex items-center justify-center shrink-0 z-50">
                <div className="w-32 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col">
            {currentScreen === 'splash' && (
              <div className="flex-1 flex items-center justify-center py-8">
                <SplashScreen
                  onNavigateLogin={() => setCurrentScreen('login')}
                  onNavigateSignUp={() => setCurrentScreen('signup')}
                  onExploreGuest={handleExploreGuest}
                />
              </div>
            )}

            {currentScreen === 'login' && (
              <div className="flex-1 flex items-center justify-center py-8">
                <LoginScreen
                  onSuccess={handleLoginSuccess}
                  onNavigateBack={() => setCurrentScreen('splash')}
                  onNavigateSignUp={() => setCurrentScreen('signup')}
                  onForgotPassword={() => setIsForgotPasswordOpen(true)}
                />
              </div>
            )}

            {currentScreen === 'signup' && (
              <div className="flex-1 flex items-center justify-center py-8">
                <SignUpScreen
                  onSuccess={handleSignUpSuccess}
                  onNavigateBack={() => setCurrentScreen('splash')}
                  onNavigateLogin={() => setCurrentScreen('login')}
                />
              </div>
            )}

            {currentScreen === 'dashboard' && currentUser && (
              <DashboardScreen
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
