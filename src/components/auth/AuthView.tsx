import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { initialEmployees } from '../../data/mockData';
import { AnimatedArtBackground } from '../background/AnimatedArtBackground';

type AuthMode = 'signin' | 'first_time' | 'forgot_password';

export const AuthView: React.FC = () => {
  const { 
    setIsAuthenticated, 
    setRole, 
    setCurrentUser,
    addToast,
    loginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
    isLockedOut,
    lockoutSeconds
  } = useApp();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  
  // Sign-in state
  const [emailOrId, setEmailOrId] = useState('FS-1001');
  const [password, setPassword] = useState('FlowSphere@2026');
  const [rememberSession, setRememberSession] = useState(true);
  const [signInError, setSignInError] = useState('');

  // First-time setup state (Steps: 1: email -> 2: otp -> 3: password -> 4: success)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [setupEmail, setSetupEmail] = useState('');
  const [setupOtp, setSetupOtp] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState('');

  // Forgot password state (Steps: 1: email -> 2: otp -> 3: new_password -> 4: success)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');

  const DEMO_OTP = '582910';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    if (isLockedOut) {
      setSignInError(`Account temporarily locked for ${lockoutSeconds}s due to multiple failed attempts.`);
      return;
    }

    if (!emailOrId.trim() || !password.trim()) {
      setSignInError('Please enter both Employee ID / Email and Password.');
      return;
    }

    // Simulated verification: Valid credentials
    const isKeshav = emailOrId.toLowerCase().includes('1001') || emailOrId.toLowerCase().includes('keshav');
    const isAdmin = emailOrId.toLowerCase().includes('1002') || emailOrId.toLowerCase().includes('samta') || emailOrId.toLowerCase().includes('admin');

    if (password.length < 4) {
      incrementLoginAttempts();
      setSignInError(`Incorrect password. Attempt ${loginAttempts + 1} of 3 before temporary lockout.`);
      return;
    }

    resetLoginAttempts();
    setIsAuthenticated(true);
    if (isAdmin) {
      setCurrentUser(initialEmployees[1]);
      setRole('admin');
      addToast('Welcome Admin', 'Authenticated as Samta Tanwar (Lead Full-Stack / Admin).', 'success');
    } else {
      setCurrentUser(initialEmployees[0]);
      setRole('employee');
      addToast('Welcome to FlowSphere', 'Authenticated as Keshav Bhardwaj (Senior Architect).', 'success');
    }
  };

  const handleQuickEmployee = () => {
    resetLoginAttempts();
    setCurrentUser(initialEmployees[0]);
    setIsAuthenticated(true);
    setRole('employee');
    addToast('Employee Session Started', 'Logged in as Keshav Bhardwaj (Senior Architect).', 'success');
  };

  const handleQuickAdmin = () => {
    resetLoginAttempts();
    setCurrentUser(initialEmployees[1]);
    setIsAuthenticated(true);
    setRole('admin');
    addToast('Admin Session Started', 'Logged in as Samta Tanwar (Lead Full-Stack / Admin).', 'success');
  };

  // First Time Setup Handlers
  const handleSendSetupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (!setupEmail.trim() || !setupEmail.includes('@')) {
      setSetupError('Please provide a valid official corporate email address.');
      return;
    }
    setSetupStep(2);
    addToast('OTP Dispatched', `A 6-digit verification OTP has been sent to ${setupEmail}.`, 'info');
  };

  const handleVerifySetupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (setupOtp.trim() !== DEMO_OTP) {
      setSetupError(`Invalid OTP code. Please use demo code ${DEMO_OTP}.`);
      return;
    }
    setSetupStep(3);
    addToast('OTP Verified', 'Identity verified. Now set your master password.', 'success');
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
    setSetupStep(4);
    addToast('Account Setup Completed', 'Your password has been encrypted and configured.', 'success');
  };

  // Forgot Password Handlers
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter your registered official work email.');
      return;
    }
    setForgotStep(2);
    addToast('Password Reset Code Sent', `A 6-digit reset OTP has been sent to ${forgotEmail}.`, 'info');
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (forgotOtp.trim() !== DEMO_OTP) {
      setForgotError(`Invalid code. Please use demo verification OTP: ${DEMO_OTP}.`);
      return;
    }
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
                  Welcome back
                </h2>
                <p className="text-[14px] sm:text-[15px] font-normal leading-[1.5] text-[#525252] dark:text-[#A3A3A3] mt-1">
                  Sign in to continue to FlowSphere.
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
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
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
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      authMode === 'first_time'
                        ? 'bg-white dark:bg-[#1E293B] text-[#171717] dark:text-white font-medium shadow-xs'
                        : 'text-[#737373] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    First Time Setup
                  </button>
                </div>
              )}

          {/* Mode 1: Sign In View */}
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
                  Official Email or Employee ID
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                  <input
                    type="text"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    required
                    disabled={isLockedOut}
                    placeholder="e.g. FS-1001 or name@flowsphere.internal"
                    className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] disabled:opacity-60 transition-all shadow-2xs"
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
                    className="text-[12px] text-[#158AF4] hover:underline font-medium"
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
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] disabled:opacity-60 transition-all shadow-2xs"
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

          {/* Mode 2: First-Time Setup Multi-Step Wizard */}
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
                  {setupStep === 1 && 'Official ID / Email'}
                  {setupStep === 2 && 'Email OTP Verification'}
                  {setupStep === 3 && 'Create Master Password'}
                  {setupStep === 4 && 'Setup Complete'}
                </span>
              </div>

              {/* Step 1: Official Email / Employee ID */}
              {setupStep === 1 && (
                <form onSubmit={handleSendSetupOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                      Official Work Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="email"
                        value={setupEmail}
                        onChange={(e) => setSetupEmail(e.target.value)}
                        required
                        placeholder="e.g. keshav.b@flowsphere.internal"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer"
                  >
                    <KeyRound size={15} />
                    <span>Send Verification OTP</span>
                  </button>
                </form>
              )}

              {/* Step 2: Enter & Verify OTP */}
              {setupStep === 2 && (
                <form onSubmit={handleVerifySetupOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[13px] leading-[1.45]">
                    Demo verification code sent to <strong>{setupEmail}</strong>:
                    <div className="mt-1.5 font-mono font-bold text-[15px] text-[#171717] dark:text-white">
                      Demo OTP: {DEMO_OTP}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                      Enter 6-Digit Email OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={setupOtp}
                      onChange={(e) => setSetupOtp(e.target.value)}
                      placeholder="582910"
                      required
                      className="w-full px-3.5 py-2.5 text-center text-[16px] font-mono tracking-widest text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
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
              {setupStep === 3 && (
                <form onSubmit={handleCreateSetupPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                      Create Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="password"
                        value={setupPassword}
                        onChange={(e) => setSetupPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
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
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
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
              {setupStep === 4 && (
                <div className="text-center py-4 space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#BEF1CA] text-[#1F7A35] mx-auto flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#171717] dark:text-white">
                      Account Activated Successfully
                    </h3>
                    <p className="text-[13px] font-normal leading-[1.45] text-[#737373] dark:text-[#A3A3A3] mt-1">
                      Your identity and password have been configured. You can now access your workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthenticated(true);
                      setRole('employee');
                      addToast('Welcome to FlowSphere', 'Logged in as Keshav Bhardwaj.', 'success');
                    }}
                    className="btn-yellow w-full py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Forgot Password Multi-Step Flow */}
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

              {/* Step 1: Enter email */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendForgotOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-medium leading-[1.4] text-[#171717] dark:text-[#EDEDED] mb-1.5">
                      Enter Official Registered Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="e.g. keshav.b@flowsphere.internal"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
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
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotOtp} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[13px] leading-[1.45]">
                    Verification code sent to <strong>{forgotEmail}</strong>:
                    <div className="mt-1.5 font-mono font-bold text-[15px] text-[#171717] dark:text-white">
                      Demo OTP: {DEMO_OTP}
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
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="582910"
                      required
                      className="w-full px-3.5 py-2.5 text-center text-[16px] font-mono tracking-widest text-[#171717] dark:text-white bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
                    />
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
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" />
                      <input
                        type="password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
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
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-[14px] font-normal leading-[1.5] text-[#171717] dark:text-white placeholder-[#8A8A8A] bg-white dark:bg-[#1E293B] border border-black/15 dark:border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-[#FFE956]/60 focus:border-[#FFE956] transition-all shadow-2xs"
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

          {/* Quick Demo Launchers */}
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
            <div className="text-[12px] font-medium text-[#737373] dark:text-[#A3A3A3] text-center">
              Quick Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleQuickEmployee}
                className="p-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-[#171717] dark:text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#288F3D]" />
                <span>Employee</span>
              </button>

              <button
                type="button"
                onClick={handleQuickAdmin}
                className="p-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-[#8B5CF6] dark:text-purple-300 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
</div>
  );
};

export default AuthView;
