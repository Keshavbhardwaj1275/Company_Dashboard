import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  RotateCw,
  BadgeCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { AnimatedArtBackground } from '../background/AnimatedArtBackground';

type AuthMode = 'signin' | 'first_time' | 'forgot_password';

interface ActiveOtpState {
  code: string;
  identifier: string;
  expiresAt: number;
  isUsed: boolean;
}

// Generate fresh, distinct 6-digit numeric OTP
const generateDynamicOtp = (previousCode?: string): string => {
  let newCode = '';
  do {
    newCode = Math.floor(100000 + Math.random() * 900000).toString();
  } while (newCode === previousCode);
  return newCode;
};

export const AuthView: React.FC = () => {
  const { 
    setIsAuthenticated, 
    setRole, 
    setCurrentUser,
    addToast,
    employees,
    setEmployees,
    loginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
    isLockedOut,
    lockoutSeconds
  } = useApp();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  
  // Sign-in state
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [signInError, setSignInError] = useState('');

  // Activated employees tracking
  const [activatedEmployeeIds, setActivatedEmployeeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flowsphere-activated-employees');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['FS-1002']; // FS-1002 is admin
  });

  // First-time setup state (Steps: 1: Employee ID -> 2: Dynamic OTP -> 3: Create password -> 4: Success)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [setupEmployeeId, setSetupEmployeeId] = useState('');
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [activeSetupOtp, setActiveSetupOtp] = useState<ActiveOtpState | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state (Steps: 1: email/id -> 2: otp -> 3: new_password -> 4: success)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [matchedForgotAccount, setMatchedForgotAccount] = useState<Employee | null>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [activeForgotOtp, setActiveForgotOtp] = useState<ActiveOtpState | null>(null);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);

  // Countdown timer for Setup OTP resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Countdown timer for Forgot Password OTP resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotResendCooldown > 0) {
      interval = setInterval(() => {
        setForgotResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotResendCooldown]);

  // =========================================================================
  // Standard Sign-In Handler
  // =========================================================================
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    if (isLockedOut) {
      setSignInError(`Account temporarily locked for ${lockoutSeconds}s due to multiple failed attempts.`);
      return;
    }

    if (!emailOrId.trim() || !password.trim()) {
      setSignInError('Please enter both Login ID / Employee ID and Password.');
      return;
    }

    const query = emailOrId.trim().toLowerCase();
    const account = employees.find(
      (emp) =>
        emp.loginId?.toLowerCase() === query ||
        emp.employeeId?.toLowerCase() === query ||
        emp.email?.toLowerCase() === query
    );

    if (!account || account.password !== password) {
      incrementLoginAttempts();
      setSignInError(`Incorrect Login ID or password. Attempt ${loginAttempts + 1} of 3 before temporary lockout.`);
      return;
    }

    resetLoginAttempts();
    setCurrentUser(account);
    setRole(account.systemRole || (account.seedRole === 'admin' ? 'admin' : 'employee'));
    setIsAuthenticated(true);
    addToast('Welcome back', `Signed in as ${account.name}.`, 'success');
  };

  // =========================================================================
  // First-Time Setup Handlers
  // =========================================================================
  const handleSendSetupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    const query = setupEmployeeId.trim().toLowerCase();
    if (!query) {
      setSetupError('Please enter your Employee ID (e.g. FS-1001).');
      return;
    }

    const account = employees.find(
      (emp) =>
        emp.employeeId?.toLowerCase() === query ||
        emp.email?.toLowerCase() === query ||
        emp.loginId?.toLowerCase() === query
    );

    if (!account) {
      setSetupError('Employee ID not found. Please verify your ID with HR / IT administration.');
      return;
    }

    if (account.systemRole === 'admin' || account.seedRole === 'admin') {
      setSetupError('Admin accounts must be provisioned directly by system administrators.');
      return;
    }

    // Check if employee has already completed first-time setup
    if (account.firstTimeCompleted || activatedEmployeeIds.includes(account.employeeId)) {
      setSetupError(
        `Account for ${account.name} (${account.employeeId}) has already completed first-time setup. Please use Sign In with your password.`
      );
      return;
    }

    const newOtp = generateDynamicOtp(activeSetupOtp?.code);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    setActiveSetupOtp({
      code: newOtp,
      identifier: account.employeeId,
      expiresAt,
      isUsed: false,
    });
    setMatchedEmployee(account);
    setSetupStep(2);
    setSetupOtp('');
    setResendCooldown(30);

    addToast(
      'Verification OTP Dispatched',
      `Dynamic 6-digit OTP [${newOtp}] generated for ${account.name} (valid for 5 mins).`,
      'info'
    );
  };

  const handleResendSetupOtp = () => {
    if (resendCooldown > 0 || !matchedEmployee) return;

    const newOtp = generateDynamicOtp(activeSetupOtp?.code);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Immediately invalidate previous OTP
    setActiveSetupOtp({
      code: newOtp,
      identifier: matchedEmployee.employeeId,
      expiresAt,
      isUsed: false,
    });
    setSetupOtp('');
    setSetupError('');
    setResendCooldown(30);

    addToast(
      'New OTP Dispatched',
      `Fresh verification code [${newOtp}] generated for ${matchedEmployee.name}. Previous code is invalidated.`,
      'info'
    );
  };

  const handleVerifySetupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!setupOtp.trim()) {
      setSetupError('Please enter the 6-digit verification code.');
      return;
    }

    if (!activeSetupOtp || activeSetupOtp.identifier !== matchedEmployee?.employeeId) {
      setSetupError('No active verification session found. Please start over.');
      return;
    }

    if (activeSetupOtp.isUsed) {
      setSetupError('This OTP code has already been used or invalidated. Please request a new OTP.');
      return;
    }

    if (Date.now() > activeSetupOtp.expiresAt) {
      setSetupError('Verification OTP has expired. Please request a new code.');
      return;
    }

    if (setupOtp.trim() !== activeSetupOtp.code) {
      setSetupError('Invalid OTP code. Please check the 6-digit code and try again.');
      return;
    }

    // Invalidate OTP after successful verification
    setActiveSetupOtp((prev) => (prev ? { ...prev, isUsed: true } : null));
    setSetupStep(3);
    addToast('Identity Verified', 'OTP confirmed. Now create your master password.', 'success');
  };

  const handleCreateSetupPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (setupPassword.length < 6) {
      setSetupError('Password must be at least 6 characters long.');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!matchedEmployee) {
      setSetupError('Session error. Please restart setup.');
      return;
    }

    const updatedEmp: Employee = {
      ...matchedEmployee,
      password: setupPassword,
      firstTimeCompleted: true,
    };

    setEmployees((prev) =>
      prev.map((emp) => (emp.employeeId === matchedEmployee.employeeId ? updatedEmp : emp))
    );
    setMatchedEmployee(updatedEmp);

    // Save to activated employee IDs
    setActivatedEmployeeIds((prev) => {
      const next = Array.from(new Set([...prev, matchedEmployee.employeeId]));
      try {
        localStorage.setItem('flowsphere-activated-employees', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    setSetupStep(4);
    addToast('Account Setup Completed', 'Your password has been encrypted and configured.', 'success');
  };

  const handleCompleteSetupAndLaunch = () => {
    if (!matchedEmployee) return;
    setCurrentUser(matchedEmployee);
    setRole(matchedEmployee.systemRole || 'employee');
    setIsAuthenticated(true);
    addToast('Welcome to FlowSphere', `Logged in as ${matchedEmployee.name}.`, 'success');
  };

  // =========================================================================
  // Forgot Password Handlers
  // =========================================================================
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const query = forgotEmail.trim().toLowerCase();
    if (!query) {
      setForgotError('Please enter your registered work email or Employee ID.');
      return;
    }

    const account = employees.find(
      (emp) =>
        emp.email?.toLowerCase() === query ||
        emp.employeeId?.toLowerCase() === query ||
        emp.loginId?.toLowerCase() === query
    );

    if (!account) {
      setForgotError('No account found for this email or Employee ID.');
      return;
    }

    const newOtp = generateDynamicOtp(activeForgotOtp?.code);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setActiveForgotOtp({
      code: newOtp,
      identifier: account.employeeId,
      expiresAt,
      isUsed: false,
    });
    setMatchedForgotAccount(account);
    setForgotStep(2);
    setForgotOtp('');
    setForgotResendCooldown(30);

    addToast(
      'Password Reset Code Sent',
      `Dynamic reset OTP [${newOtp}] sent for ${account.name} (valid 5 mins).`,
      'info'
    );
  };

  const handleResendForgotOtp = () => {
    if (forgotResendCooldown > 0 || !matchedForgotAccount) return;

    const newOtp = generateDynamicOtp(activeForgotOtp?.code);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setActiveForgotOtp({
      code: newOtp,
      identifier: matchedForgotAccount.employeeId,
      expiresAt,
      isUsed: false,
    });
    setForgotOtp('');
    setForgotError('');
    setForgotResendCooldown(30);

    addToast(
      'New Reset Code Sent',
      `Fresh OTP [${newOtp}] dispatched. Previous code has been invalidated.`,
      'info'
    );
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit OTP code.');
      return;
    }

    if (!activeForgotOtp || activeForgotOtp.identifier !== matchedForgotAccount?.employeeId) {
      setForgotError('No active reset request found.');
      return;
    }

    if (activeForgotOtp.isUsed) {
      setForgotError('This OTP code has already been used or invalidated. Please request a new code.');
      return;
    }

    if (Date.now() > activeForgotOtp.expiresAt) {
      setForgotError('Reset OTP has expired. Please request a fresh code.');
      return;
    }

    if (forgotOtp.trim() !== activeForgotOtp.code) {
      setForgotError('Invalid code. Please check the OTP and try again.');
      return;
    }

    setActiveForgotOtp((prev) => (prev ? { ...prev, isUsed: true } : null));
    setForgotStep(3);
    addToast('Code Verified', 'Please enter and confirm your new password.', 'success');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    if (matchedForgotAccount) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === matchedForgotAccount.employeeId
            ? { ...emp, password: forgotNewPassword }
            : emp
        )
      );
    }

    setForgotStep(4);
    addToast('Password Reset Success', 'Your new password has been activated.', 'success');
  };

  return (
    <div className="login-page relative min-h-screen w-full flex items-center justify-center p-2 sm:p-3 md:p-5 lg:p-6 font-sans overflow-x-hidden bg-[#EDEDED] dark:bg-[#070A13] selection:bg-[#FFE956] selection:text-[#111827]">
      {/* Outer Canvas Subtle Specular Light Streaks matching FlowSphere AppShell */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-white via-white/50 to-transparent" />
        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-white via-white/30 to-transparent" />
      </div>

      {/* Main Floating Application Frame Shell */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[1580px] min-h-[92vh] sm:min-h-[88vh] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col justify-center app-frame-shell"
      >
        {/* Same FlowSphere Animated Art Background rendered INSIDE the frame, full-bleed */}
        <AnimatedArtBackground />

        {/* Split Screen Content Container */}
        <div className="login-content relative z-10 w-full flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-20 py-10 lg:py-14 gap-10 lg:gap-8 max-w-[1536px] mx-auto">
          {/* =========================================================================
              LEFT COLUMN (55%) — FlowSphere Product Story & Value Props
              ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[54%] xl:w-[52%] flex flex-col justify-center text-left"
          >
            <div className="space-y-6 max-w-[580px]">
              {/* Brand Eyebrow Badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFE956] text-[#111827] flex items-center justify-center shadow-md font-bold">
                  <Layers size={20} />
                </div>
                <span className="tracking-[0.16em] uppercase font-bold text-[13px] text-[#0F172A] dark:text-white/90">
                  FLOWSPHERE
                </span>
              </div>

              {/* Hero Heading */}
              <div>
                <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] xl:text-[58px] font-bold text-[#0F172A] dark:text-white leading-[1.06] tracking-[-0.035em]">
                  Workforce Intelligence, <br className="hidden sm:inline" />
                  <span className="text-[#0369A1] dark:text-[#38BDF8]">Simplified.</span>
                </h1>
                <p className="text-[16px] sm:text-[18px] font-semibold text-[#334155] dark:text-[#CBD5E1] leading-[1.4] mt-3">
                  Track work. Understand productivity. Make better workforce decisions.
                </p>
                <p className="text-[14px] sm:text-[15px] font-normal leading-[1.6] text-[#64748B] dark:text-[#94A3B8] mt-2">
                  FlowSphere brings employee workflow, productivity, attendance and workforce intelligence into one connected workspace.
                </p>
              </div>

              {/* 3 Compact Feature Points */}
              <div className="space-y-2.5 pt-1">
                {[
                  { num: '01', title: 'Real-time Workforce Intelligence', desc: 'Live employee telemetry, active/idle time tracking, and focus analytics.' },
                  { num: '02', title: 'Productivity & Workflow Insights', desc: 'Automated efficiency scores, velocity charts, and department benchmarks.' },
                  { num: '03', title: 'Attendance & Performance Tracking', desc: 'Automated shift calculation, deduction policies, and enterprise reports.' },
                ].map((feat, idx) => (
                  <motion.div
                    key={feat.num}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl glass-card shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FFE956] text-[#111827] font-mono text-[12px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {feat.num}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] dark:text-white tracking-[-0.01em]">
                        {feat.title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* =========================================================================
              RIGHT COLUMN (45%) — Crisp High-Contrast Login Card
              ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[46%] xl:w-[44%] flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-[440px] bg-white/95 dark:bg-[#0F172A]/95 rounded-[20px] border border-black/10 dark:border-white/15 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-7 sm:p-9 lg:p-10 backdrop-blur-md">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-[28px] sm:text-[30px] font-bold text-[#171717] dark:text-white leading-[1.15] tracking-[-0.025em]">
                  {authMode === 'signin' ? 'Welcome back' : authMode === 'first_time' ? 'First-Time Setup' : 'Reset Password'}
                </h2>
                <p className="text-[14px] sm:text-[15px] font-normal leading-[1.5] text-[#525252] dark:text-[#A3A3A3] mt-1">
                  {authMode === 'signin'
                    ? 'Sign in to continue to FlowSphere.'
                    : authMode === 'first_time'
                    ? 'Activate your employee account with your Employee ID.'
                    : 'Recover access to your workspace account.'}
                </p>
              </div>

              {/* Tab Switcher for Sign In & First Time Setup */}
              {authMode !== 'forgot_password' && (
                <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] mb-5 text-[13px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setSignInError('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-white dark:bg-[#1E293B] text-[#171717] dark:text-white font-medium shadow-xs'
                        : 'text-[#737373] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('first_time');
                      setSetupStep(1);
                      setSetupError('');
                      setSetupOtp('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      authMode === 'first_time'
                        ? 'bg-white dark:bg-[#1E293B] text-[#171717] dark:text-white font-medium shadow-xs'
                        : 'text-[#737373] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    First Time Setup
                  </button>
                </div>
              )}

              {/* =========================================================================
                  Mode 1: Sign In View
                  ========================================================================= */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {signInError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[13px] leading-[1.45] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  {isLockedOut && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[13px] leading-[1.45] flex items-center gap-2 font-medium">
                      <Clock size={16} className="text-amber-500 animate-spin shrink-0" />
                      <span>Security cooldown: Account locked for {lockoutSeconds}s.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                      Login ID / Employee ID
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="e.g. Emp001 or FS-1001"
                        required
                        disabled={isLockedOut}
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] disabled:opacity-60 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot_password');
                          setForgotStep(1);
                          setForgotError('');
                        }}
                        className="text-[12px] text-[#158AF4] hover:underline font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLockedOut}
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] disabled:opacity-60 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-0.5 text-[13px]">
                    <label className="flex items-center gap-2 cursor-pointer text-[#525252] dark:text-[#A3A3A3]">
                      <input 
                        type="checkbox" 
                        checked={rememberSession} 
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="w-4 h-4 accent-[#FFE956] rounded cursor-pointer" 
                      />
                      <span>Remember session</span>
                    </label>
                    <span className="text-[12px] text-[#288F3D] font-medium flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>AES-256 Encrypted</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLockedOut}
                    className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 shadow-sm cursor-pointer"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}

              {/* =========================================================================
                  Mode 2: First-Time Setup Multi-Step Wizard
                  ========================================================================= */}
              {authMode === 'first_time' && (
                <div className="space-y-4">
                  {setupError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[13px] leading-[1.45] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span>{setupError}</span>
                    </div>
                  )}

                  {/* Multi-Step Indicator */}
                  <div className="flex items-center justify-between text-[12px] text-[#737373] dark:text-[#A3A3A3] px-1 pb-1.5 border-b border-black/5 dark:border-white/10">
                    <span>Step {setupStep} of 4</span>
                    <span className="font-semibold text-[#171717] dark:text-white">
                      {setupStep === 1 && 'Employee ID'}
                      {setupStep === 2 && 'Dynamic OTP Verification'}
                      {setupStep === 3 && 'Create Master Password'}
                      {setupStep === 4 && 'Setup Complete'}
                    </span>
                  </div>

                  {/* Step 1: Employee ID Input */}
                  {setupStep === 1 && (
                    <form onSubmit={handleSendSetupOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Employee ID
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="text"
                            value={setupEmployeeId}
                            onChange={(e) => setSetupEmployeeId(e.target.value)}
                            placeholder="e.g. FS-1001"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                        <p className="text-[12px] text-[#737373] dark:text-[#A3A3A3] mt-1.5">
                          Enter your official corporate Employee ID to generate a dynamic verification code.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer"
                      >
                        <KeyRound size={15} />
                        <span>Generate Verification OTP</span>
                      </button>
                    </form>
                  )}

                  {/* Step 2: Enter & Verify Dynamic OTP */}
                  {setupStep === 2 && matchedEmployee && activeSetupOtp && (
                    <form onSubmit={handleVerifySetupOtp} className="space-y-3.5">
                      {/* Dynamic OTP Dispatch Banner */}
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 text-[13px] leading-[1.45]">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Verification Code for {matchedEmployee.name}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                            {matchedEmployee.employeeId}
                          </span>
                        </div>
                        <div className="mt-2 p-2.5 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20 flex items-center justify-between">
                          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Generated OTP:</span>
                          <span className="font-mono font-extrabold text-[18px] text-[#0F172A] dark:text-white tracking-widest">
                            {activeSetupOtp.code}
                          </span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                          <span>Valid for 5 minutes</span>
                          <span>Single-use code</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Enter 6-Digit Verification OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={setupOtp}
                          onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          required
                          className="w-full px-3.5 py-2.5 text-center text-[18px] font-mono tracking-widest text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResendSetupOtp}
                          disabled={resendCooldown > 0}
                          className="text-[12px] font-medium text-[#158AF4] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <RotateCw size={12} className={resendCooldown > 0 ? 'animate-spin' : ''} />
                          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend New OTP'}</span>
                        </button>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSetupStep(1);
                            setSetupError('');
                          }}
                          className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/15 text-[13px] font-medium text-[#525252] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn-yellow flex-1 py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>Verify Code</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Create & Confirm Password */}
                  {setupStep === 3 && matchedEmployee && (
                    <form onSubmit={handleCreateSetupPassword} className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[13px] flex items-center gap-2">
                        <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
                        <span>Verified: <strong>{matchedEmployee.name}</strong> ({matchedEmployee.role})</span>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Create Master Password (Min 6 Characters)
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={setupPassword}
                            onChange={(e) => setSetupPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={setupConfirmPassword}
                            onChange={(e) => setSetupConfirmPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        <span>Save Password & Activate</span>
                      </button>
                    </form>
                  )}

                  {/* Step 4: Setup Complete Screen */}
                  {setupStep === 4 && matchedEmployee && (
                    <div className="text-center py-4 space-y-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#BEF1CA] text-[#1F7A35] mx-auto flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-[#171717] dark:text-white">
                          Account Activated Successfully
                        </h3>
                        <p className="text-[13px] font-normal leading-[1.45] text-[#737373] dark:text-[#A3A3A3] mt-1">
                          Welcome, <strong>{matchedEmployee.name}</strong>! Your master credentials for {matchedEmployee.employeeId} have been saved.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCompleteSetupAndLaunch}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Launch Workspace</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  Mode 3: Forgot Password Multi-Step Flow
                  ========================================================================= */}
              {authMode === 'forgot_password' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="flex items-center gap-1 text-[13px] font-medium text-[#737373] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Sign In</span>
                    </button>
                    <span className="text-[13px] font-semibold text-[#171717] dark:text-white">
                      Forgot Password
                    </span>
                  </div>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[13px] leading-[1.45] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* Step 1: Enter email or Employee ID */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleSendForgotOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Official Work Email or Employee ID
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="text"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. virat.s@flowsphere.internal or FS-1001"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <KeyRound size={15} />
                        <span>Send Verification Code</span>
                      </button>
                    </form>
                  )}

                  {/* Step 2: Enter OTP */}
                  {forgotStep === 2 && matchedForgotAccount && activeForgotOtp && (
                    <form onSubmit={handleVerifyForgotOtp} className="space-y-3.5">
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 text-[13px] leading-[1.45]">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Reset Code for {matchedForgotAccount.name}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20">
                            {matchedForgotAccount.employeeId}
                          </span>
                        </div>
                        <div className="mt-2 p-2.5 rounded-lg bg-white/80 dark:bg-black/40 border border-blue-500/20 flex items-center justify-between">
                          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Dynamic OTP:</span>
                          <span className="font-mono font-extrabold text-[18px] text-[#0F172A] dark:text-white tracking-widest">
                            {activeForgotOtp.code}
                          </span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Valid for 5 minutes · Single-use code
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          required
                          className="w-full px-3.5 py-2.5 text-center text-[18px] font-mono tracking-widest text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResendForgotOtp}
                          disabled={forgotResendCooldown > 0}
                          className="text-[12px] font-medium text-[#158AF4] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <RotateCw size={12} className={forgotResendCooldown > 0 ? 'animate-spin' : ''} />
                          <span>{forgotResendCooldown > 0 ? `Resend in ${forgotResendCooldown}s` : 'Resend Code'}</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span>Verify Code</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}

                  {/* Step 3: New Password */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-3.5">
                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          New Password (Min 6 Characters)
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={forgotConfirmPassword}
                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        <span>Reset Password</span>
                      </button>
                    </form>
                  )}

                  {/* Step 4: Success */}
                  {forgotStep === 4 && (
                    <div className="text-center py-4 space-y-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#BEF1CA] text-[#1F7A35] mx-auto flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-[#171717] dark:text-white">
                          Password Reset Successful
                        </h3>
                        <p className="text-[13px] font-normal leading-[1.45] text-[#737373] dark:text-[#A3A3A3] mt-1">
                          Your master password has been successfully updated.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setPassword(forgotNewPassword);
                        }}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] shadow-sm cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Demo Accounts Hint */}
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 text-center">
                <p className="text-[12px] text-[#737373] dark:text-[#A3A3A3] leading-relaxed">
                  Employee sign-in: <strong className="text-[#171717] dark:text-white font-mono font-semibold">Emp001 / Pass@123</strong> · Admin sign-in: <strong className="text-[#171717] dark:text-white font-mono font-semibold">Admin01 / Admin@123</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
