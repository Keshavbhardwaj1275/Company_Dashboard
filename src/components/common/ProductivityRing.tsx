import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ProductivityRingProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
  activeTime?: string;
  idleTime?: string;
  breakTime?: string;
  statusLabel?: string;
}

export const ProductivityRing: React.FC<ProductivityRingProps> = ({
  score = 87,
  title = 'Productivity pulse',
  subtitle = 'Efficiency & Compliance telemetry',
  activeTime = '06h 42m',
  idleTime = '32m',
  breakTime = '41m',
  statusLabel = 'Optimal Focus',
}) => {
  const radius = 54;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="p-6 flex flex-col justify-between relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 live-dot-pulse" />
          <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-100 tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {statusLabel}
        </span>
      </div>

      {/* Center Radial Progress Ring */}
      <div className="relative flex items-center justify-center my-3">
        <svg className="w-36 h-36 transform -rotate-90">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-200/60 dark:stroke-slate-700/40"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Value Ring */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight"
          >
            {score}%
          </motion.span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            Overall Score
          </span>
        </div>
      </div>

      {/* Compliance breakdown badges matching the video design */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100/80 dark:border-white/5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Daily Policy (Active &gt; 6h)
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {activeTime} (Passed)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Idle Inactivity Check
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {idleTime} &lt; 45m cap
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Rest / Break Schedule
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {breakTime} logged
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
