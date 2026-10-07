import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, X } from 'lucide-react';

export interface OtpData {
  code: string;
  email: string;
  expiresAt: number;
}

interface OtpNotificationProps {
  otp: OtpData | null;
  onClose: () => void;
}

// Frontend-only demo: this popup simulates an OTP arriving by email.
// Production must generate and deliver OTPs from the backend.
export const OtpNotification: React.FC<OtpNotificationProps> = ({ otp, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [validityTimeLeft, setValidityTimeLeft] = useState<number>(0);
  const [displayCountdown, setDisplayCountdown] = useState<number>(10);

  // Live countdown for OTP 5-minute validity (independent of popup visibility)
  useEffect(() => {
    if (!otp) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((otp.expiresAt - Date.now()) / 1000));
      setValidityTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otp]);

  // 10-second popup visual display countdown and auto-dismiss
  useEffect(() => {
    if (!otp) return;
    setDisplayCountdown(10);

    const interval = setInterval(() => {
      setDisplayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otp, onClose]);

  // Press ESC to close popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && otp) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [otp, onClose]);

  if (!otp) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(validityTimeLeft / 60);
  const seconds = validityTimeLeft % 60;
  const formattedValidityTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const maskEmail = (email: string) => {
    if (!email) return 'k***@flowsphere.internal';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length > 0 ? `${user[0]}***` : '***';
    return `${maskedUser}@${domain}`;
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[9999] w-[calc(100%-24px)] sm:w-[370px] max-w-[390px] pointer-events-auto"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-4 shadow-2xl border border-white/80 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl relative overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFE956] via-amber-400 to-[#158AF4]" />

          {/* Header line: Sender & Timestamp & auto-close countdown */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FFE956]/20 text-[#0F172A] dark:text-[#FFE956] flex items-center justify-center flex-shrink-0">
                <Mail size={13} className="text-[#92400E] dark:text-[#FFE956]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                  FlowSphere Security
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  · now ({displayCountdown}s)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full glass-control flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              title="Close notification (Esc)"
              aria-label="Close notification"
            >
              <X size={13} />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-[12.5px] font-medium text-[#475569] dark:text-slate-300 mb-2">
            Your verification code
          </h4>

          {/* Large Monospaced Code with Copy Button */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-2.5">
            <span className="font-mono text-2xl sm:text-[26px] font-bold tracking-[0.28em] text-[#0F172A] dark:text-[#FFE956] pl-1.5 select-all">
              {otp.code}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-black/5 dark:border-white/10'
              }`}
              title="Copy OTP code"
              aria-label="Copy verification code"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Footer details: Recipient & Expiry countdown */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-0.5">
            <span className="truncate pr-2">
              Sent to <code className="font-mono text-[10.5px] text-[#0F172A] dark:text-slate-200">{maskEmail(otp.email)}</code>
            </span>
            <span className="font-mono font-medium flex-shrink-0 text-slate-500 dark:text-slate-400">
              Valid for {formattedValidityTime}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
