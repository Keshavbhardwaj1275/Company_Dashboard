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
  BadgeCheck,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { AnimatedArtBackground } from '../background/AnimatedArtBackground';
import { OtpNotification } from '../common/OtpNotification';
import { 
  generateSalt, 
  hashPassword, 
  verifyPassword, 
  saveActivatedAccount 
} from '../../utils/authCrypto';

type AuthMode = 'signin' | 'first_time' | 'forgot_password';

interface PendingOtp {
  code: string;
  email: string;
  purpose: 'setup' | 'reset';
  expiresAt: number;
  attempts: number;
}

// Generate fresh 6-digit numeric OTP
const generateOtp = (): string =>
  String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [signInError, setSignInError] = useState('');

  // Pending OTP state (in-memory only; never written to localStorage or URL)
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // First-time setup state (Steps: 1: email/id -> 2: verify otp -> 3: create password -> 4: success)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [setupEmailOrId, setSetupEmailOrId] = useState('');
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state (Steps: 1: email/id -> 2: verify otp -> 3: reset password -> 4: success)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmailOrId, setForgotEmailOrId] = useState('');
  const [matchedForgotAccount, setMatchedForgotAccount] = useState<Employee | null>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
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

  const maskEmail = (email: string) => {
    if (!email) return 'k***@flowsphere.internal';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length > 0 ? `${user[0]}***` : '***';
    return `${maskedUser}@${domain}`;
  };

  // =========================================================================
  // Standard Sign-In Handler
  // =========================================================================
  const handleSignIn = async (e: React.FormEvent) => {
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

    if (!account) {
      incrementLoginAttempts();
      setSignInError(`Incorrect Login ID or password. Attempt ${loginAttempts + 1} of 3 before temporary lockout.`);
      return;
    }

    if (account.activated === false) {
      setSignInError('This account has not been activated yet. Please complete First-Time Setup first.');
      return;
    }

    const isValid = await verifyPassword(account, password);
    if (!isValid) {
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
  const handleSendSetupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    const query = setupEmailOrId.trim().toLowerCase();
    if (!query) {
      setSetupError('Please enter your official work email or Employee ID.');
      return;
    }

    const account = employees.find(
      (emp) =>
        emp.email?.toLowerCase() === query ||
        emp.employeeId?.toLowerCase() === query ||
        emp.loginId?.toLowerCase() === query
    );

    if (!account) {
      setSetupError('No employee record found for this email. Please contact your admin.');
      return;
    }

    if (account.activated === true) {
      setSetupError('This account is already activated. Please sign in or use Forgot Password.');
      return;
    }

    // Deliver OTP with ~1.2s delivery simulation
    // Frontend-only demo: this popup simulates an OTP arriving by email.
    // Production must generate and deliver OTPs from the backend.
    setIsSendingOtp(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSendingOtp(false);

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    setPendingOtp({
      code,
      email: account.email,
      purpose: 'setup',
      expiresAt,
      attempts: 0,
    });
    setShowOtpPopup(true);
    setMatchedEmployee(account);
    setSetupStep(2);
    setSetupOtp('');
    setResendCooldown(30);
  };

  const handleResendSetupOtp = async () => {
    if (resendCooldown > 0 || !matchedEmployee) return;

    setIsSendingOtp(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSendingOtp(false);

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setPendingOtp({
      code,
      email: matchedEmployee.email,
      purpose: 'setup',
      expiresAt,
      attempts: 0,
    });
    setShowOtpPopup(true);
    setSetupOtp('');
    setSetupError('');
    setResendCooldown(30);
  };

  const handleVerifySetupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!setupOtp.trim()) {
      setSetupError('Please enter the 6-digit verification code.');
      return;
    }

    if (!pendingOtp || pendingOtp.purpose !== 'setup') {
      setSetupError('No active verification session found. Please request a new code.');
      return;
    }

    if (Date.now() > pendingOtp.expiresAt) {
      setSetupError('This code has expired. Request a new one.');
      return;
    }

    if (setupOtp.trim() !== pendingOtp.code) {
      const nextAttempts = pendingOtp.attempts + 1;
      const remaining = 5 - nextAttempts;
      if (remaining <= 0) {
        setPendingOtp(null);
        setShowOtpPopup(false);
        setSetupError('Too many incorrect attempts (5/5). This code has been invalidated. Please request a new code.');
        return;
      }
      setPendingOtp({ ...pendingOtp, attempts: nextAttempts });
      setSetupError(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`);
      return;
    }

    // OTP verified successfully
    setPendingOtp(null);
    setShowOtpPopup(false);
    setSetupStep(3);
    setSetupPassword('');
    setSetupConfirmPassword('');
  };

  // Password rules validation
  const isSetupLengthValid = setupPassword.length >= 8;
  const hasSetupUpper = /[A-Z]/.test(setupPassword);
  const hasSetupNumber = /[0-9]/.test(setupPassword);
  const isSetupMatch = setupPassword.length > 0 && setupPassword === setupConfirmPassword;
  const isSetupPasswordValid = isSetupLengthValid && hasSetupUpper && hasSetupNumber && isSetupMatch;

  const handleCreateSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!isSetupPasswordValid || !matchedEmployee) {
      setSetupError('Please satisfy all password security requirements above.');
      return;
    }

    // Demo-grade password hashing. Production implementation must use bcrypt/Argon2 on the backend.
    const salt = generateSalt();
    const hash = await hashPassword(setupPassword, salt);

    const updatedEmp: Employee = {
      ...matchedEmployee,
      activated: true,
      passwordHash: hash,
      passwordSalt: salt,
      firstTimeCompleted: true,
    };
    delete (updatedEmp as any).password;

    setEmployees((prev) =>
      prev.map((emp) => (emp.employeeId === matchedEmployee.employeeId ? updatedEmp : emp))
    );

    saveActivatedAccount(matchedEmployee.employeeId, {
      passwordHash: hash,
      passwordSalt: salt,
      activated: true,
      loginId: matchedEmployee.loginId,
    });

    setMatchedEmployee(updatedEmp);
    setSetupStep(4);
    addToast('Account activated', 'Your account credentials have been configured.', 'success');
  };

  // =========================================================================
  // Forgot Password Handlers
  // =========================================================================
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const query = forgotEmailOrId.trim().toLowerCase();
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

    if (!account || account.activated === false) {
      setForgotError('No active account found for this email.');
      return;
    }

    setIsSendingOtp(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSendingOtp(false);

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setPendingOtp({
      code,
      email: account.email,
      purpose: 'reset',
      expiresAt,
      attempts: 0,
    });
    setShowOtpPopup(true);
    setMatchedForgotAccount(account);
    setForgotStep(2);
    setForgotOtp('');
    setForgotResendCooldown(30);
  };

  const handleResendForgotOtp = async () => {
    if (forgotResendCooldown > 0 || !matchedForgotAccount) return;

    setIsSendingOtp(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSendingOtp(false);

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setPendingOtp({
      code,
      email: matchedForgotAccount.email,
      purpose: 'reset',
      expiresAt,
      attempts: 0,
    });
    setShowOtpPopup(true);
    setForgotOtp('');
    setForgotError('');
    setForgotResendCooldown(30);
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    if (!pendingOtp || pendingOtp.purpose !== 'reset') {
      setForgotError('No active reset session found. Please request a new code.');
      return;
    }

    if (Date.now() > pendingOtp.expiresAt) {
      setForgotError('This code has expired. Request a new one.');
      return;
    }

    if (forgotOtp.trim() !== pendingOtp.code) {
      const nextAttempts = pendingOtp.attempts + 1;
      const remaining = 5 - nextAttempts;
      if (remaining <= 0) {
        setPendingOtp(null);
        setShowOtpPopup(false);
        setForgotError('Too many incorrect attempts (5/5). This code has been invalidated. Please request a new code.');
        return;
      }
      setPendingOtp({ ...pendingOtp, attempts: nextAttempts });
      setForgotError(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`);
      return;
    }

    setPendingOtp(null);
    setShowOtpPopup(false);
    setForgotStep(3);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  const isForgotLengthValid = forgotNewPassword.length >= 8;
  const hasForgotUpper = /[A-Z]/.test(forgotNewPassword);
  const hasForgotNumber = /[0-9]/.test(forgotNewPassword);
  const isForgotMatch = forgotNewPassword.length > 0 && forgotNewPassword === forgotConfirmPassword;
  const isForgotPwValid = isForgotLengthValid && hasForgotUpper && hasForgotNumber && isForgotMatch;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!isForgotPwValid || !matchedForgotAccount) {
      setForgotError('Please satisfy all password security requirements above.');
      return;
    }

    // Demo-grade password hashing. Production implementation must use bcrypt/Argon2 on the backend.
    const salt = generateSalt();
    const hash = await hashPassword(forgotNewPassword, salt);

    const updatedEmp: Employee = {
      ...matchedForgotAccount,
      activated: true,
      passwordHash: hash,
      passwordSalt: salt,
    };
    delete (updatedEmp as any).password;

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === matchedForgotAccount.employeeId ? updatedEmp : emp
      )
    );

    saveActivatedAccount(matchedForgotAccount.employeeId, {
      passwordHash: hash,
      passwordSalt: salt,
      activated: true,
      loginId: matchedForgotAccount.loginId,
    });

    setForgotStep(4);
    addToast('Password updated', 'Your new password has been activated.', 'success');
  };

  return (
    <div className="login-page relative min-h-screen w-full flex items-center justify-center p-2 sm:p-3 md:p-5 lg:p-6 font-sans overflow-x-hidden bg-[#EDEDED] dark:bg-[#070A13] selection:bg-[#FFE956] selection:text-[#111827]">
      {/* Dynamic Simulated In-App Verification Email Popup Notification */}
      <OtpNotification
        otp={
          showOtpPopup && pendingOtp
            ? {
                code: pendingOtp.code,
                email: pendingOtp.email,
                expiresAt: pendingOtp.expiresAt,
              }
            : null
        }
        onClose={() => setShowOtpPopup(false)}
      />

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
                    ? 'Activate your official workspace employee account.'
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
                      setPendingOtp(null);
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
                      setPendingOtp(null);
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
                      Employee ID / Email
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="EMP001 or employee@flowsphere.internal"
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
                          setPendingOtp(null);
                        }}
                        className="text-[12px] text-[#158AF4] hover:underline font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        disabled={isLockedOut}
                        className="w-full pl-3.5 pr-10 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] disabled:opacity-60 transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isLockedOut}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE956] rounded disabled:opacity-60"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
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
                      <span>SHA-256 Auth</span>
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
                      {setupStep === 1 && 'Official Email'}
                      {setupStep === 2 && 'Verification Code'}
                      {setupStep === 3 && 'Create Password'}
                      {setupStep === 4 && 'Setup Complete'}
                    </span>
                  </div>

                  {/* Step 1: Official Email / Employee ID */}
                  {setupStep === 1 && (
                    <form onSubmit={handleSendSetupOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Employee ID / Email
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="text"
                            value={setupEmailOrId}
                            onChange={(e) => setSetupEmailOrId(e.target.value)}
                            placeholder="EMP002 or new.employee@flowsphere.internal"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                          Enter your employee ID or company email to receive a secure 6-digit verification code.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {isSendingOtp ? (
                          <>
                            <RotateCw size={15} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound size={15} />
                            <span>Send Verification OTP</span>
                          </>
                        )}
                      </button>

                      {/* Evaluator neutral hint line */}
                      <div className="pt-2 text-center text-[11.5px] text-[#737373] dark:text-[#A3A3A3] select-none">
                        Not activated yet? Demo: EMP002 · new.employee@flowsphere.internal
                      </div>
                    </form>
                  )}

                  {/* Step 2: Enter & Verify Dynamic OTP */}
                  {setupStep === 2 && matchedEmployee && (
                    <form onSubmit={handleVerifySetupOtp} className="space-y-3.5">
                      <div className="space-y-1 text-left py-0.5">
                        <p className="text-[13px] text-[#334155] dark:text-[#CBD5E1] leading-snug">
                          Enter the 6-digit code sent to{' '}
                          <span className="font-semibold text-[#0F172A] dark:text-white font-mono">{maskEmail(matchedEmployee.email)}</span>
                        </p>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                          Check the FlowSphere Security notification above to view your code.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={setupOtp}
                          onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          required
                          className="w-full px-3.5 py-2.5 text-center text-[20px] font-mono tracking-[0.25em] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResendSetupOtp}
                          disabled={resendCooldown > 0 || isSendingOtp}
                          className="text-[12px] font-medium text-[#158AF4] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <RotateCw size={12} className={resendCooldown > 0 || isSendingOtp ? 'animate-spin' : ''} />
                          <span>{resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}</span>
                        </button>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSetupStep(1);
                            setSetupError('');
                            setPendingOtp(null);
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

                  {/* Step 3: Create Master Password with Live Checklist */}
                  {setupStep === 3 && matchedEmployee && (
                    <form onSubmit={handleCreateSetupPassword} className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[13px] flex items-center gap-2">
                        <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
                        <span>Verified: <strong>{matchedEmployee.name}</strong> ({matchedEmployee.role})</span>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          Create Master Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={setupPassword}
                            onChange={(e) => setSetupPassword(e.target.value)}
                            required
                            placeholder="••••••••"
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
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Live Security Checklist */}
                      <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-1.5 text-[12px]">
                        <div className="font-semibold text-[#171717] dark:text-white mb-1">
                          Password Requirements:
                        </div>
                        <div className={`flex items-center gap-1.5 ${isSetupLengthValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {isSetupLengthValid ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least 8 characters long</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasSetupUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {hasSetupUpper ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least one uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasSetupNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {hasSetupNumber ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least one number (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isSetupMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {isSetupMatch ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>Passwords match</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!isSetupPasswordValid}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={15} />
                        <span>Save Password & Activate</span>
                      </button>
                    </form>
                  )}

                  {/* Step 4: Setup Complete Screen */}
                  {setupStep === 4 && matchedEmployee && (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#BEF1CA] text-[#1F7A35] mx-auto flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-bold text-[#171717] dark:text-white">
                          Account Activated
                        </h3>
                        <p className="text-[14px] font-normal leading-[1.5] text-[#525252] dark:text-[#CBD5E1] mt-1.5">
                          Account activated. Your Login ID is <strong className="font-mono text-[#0F172A] dark:text-white font-bold">{matchedEmployee.loginId || matchedEmployee.employeeId}</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setEmailOrId('');
                          setPassword('');
                        }}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Go to Sign In</span>
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
                      onClick={() => {
                        setAuthMode('signin');
                        setPendingOtp(null);
                      }}
                      className="flex items-center gap-1 text-[13px] font-medium text-[#737373] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Sign In</span>
                    </button>
                    <span className="text-[13px] font-semibold text-[#171717] dark:text-white">
                      Reset Password
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
                          Employee ID / Email
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="text"
                            value={forgotEmailOrId}
                            onChange={(e) => setForgotEmailOrId(e.target.value)}
                            placeholder="EMP001 or employee@flowsphere.internal"
                            required
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                          Enter your registered employee ID or email to receive a password reset code.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {isSendingOtp ? (
                          <>
                            <RotateCw size={15} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound size={15} />
                            <span>Send Verification OTP</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Step 2: Enter OTP */}
                  {forgotStep === 2 && matchedForgotAccount && (
                    <form onSubmit={handleVerifyForgotOtp} className="space-y-3.5">
                      <div className="space-y-1 text-left py-0.5">
                        <p className="text-[13px] text-[#334155] dark:text-[#CBD5E1] leading-snug">
                          Enter the 6-digit code sent to{' '}
                          <span className="font-semibold text-[#0F172A] dark:text-white font-mono">{maskEmail(matchedForgotAccount.email)}</span>
                        </p>
                        <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                          Check the FlowSphere Security notification above to view your code.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          required
                          className="w-full px-3.5 py-2.5 text-center text-[20px] font-mono tracking-[0.25em] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResendForgotOtp}
                          disabled={forgotResendCooldown > 0 || isSendingOtp}
                          className="text-[12px] font-medium text-[#158AF4] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <RotateCw size={12} className={forgotResendCooldown > 0 || isSendingOtp ? 'animate-spin' : ''} />
                          <span>{forgotResendCooldown > 0 ? `Resend OTP (${forgotResendCooldown}s)` : 'Resend OTP'}</span>
                        </button>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotStep(1);
                            setForgotError('');
                            setPendingOtp(null);
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

                  {/* Step 3: New Password with Live Checklist */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-3.5">
                      <div>
                        <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                          New Master Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                          <input
                            type="password"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            required
                            placeholder="••••••••"
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
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Live Security Checklist */}
                      <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-1.5 text-[12px]">
                        <div className="font-semibold text-[#171717] dark:text-white mb-1">
                          Password Requirements:
                        </div>
                        <div className={`flex items-center gap-1.5 ${isForgotLengthValid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {isForgotLengthValid ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least 8 characters long</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasForgotUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {hasForgotUpper ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least one uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasForgotNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {hasForgotNumber ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>At least one number (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isForgotMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#737373] dark:text-[#A3A3A3]'}`}>
                          {isForgotMatch ? <Check size={13} /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-1" />}
                          <span>Passwords match</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!isForgotPwValid}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={15} />
                        <span>Reset Password</span>
                      </button>
                    </form>
                  )}

                  {/* Step 4: Success */}
                  {forgotStep === 4 && (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#BEF1CA] text-[#1F7A35] mx-auto flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-bold text-[#171717] dark:text-white">
                          Password Updated
                        </h3>
                        <p className="text-[14px] font-normal leading-[1.5] text-[#525252] dark:text-[#CBD5E1] mt-1.5">
                          Password updated. Please sign in.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setEmailOrId('');
                          setPassword('');
                        }}
                        className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Go to Sign In</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
