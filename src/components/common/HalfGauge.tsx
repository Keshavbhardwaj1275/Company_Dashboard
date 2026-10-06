import React from 'react';
import { motion } from 'framer-motion';

interface HalfGaugeProps {
  score?: number;
  productivePercent?: number;
  idlePercent?: number;
  breakPercent?: number;
  label?: string;
  size?: number;
}

export const HalfGauge: React.FC<HalfGaugeProps> = ({
  score = 87,
  productivePercent = 78,
  idlePercent = 14,
  breakPercent = 8,
  label = 'Overall Score',
  size = 200,
}) => {
  // SVG Half Circle Arc parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circumference for 180 deg

  // Compute length of each colored arc segment with a tiny gap
  const gap = 4;
  const prodLength = Math.max(0, (productivePercent / 100) * circumference - gap);
  const idleLength = Math.max(0, (idlePercent / 100) * circumference - gap);
  const breakLength = Math.max(0, (breakPercent / 100) * circumference - gap);

  const gaugeHeight = size * 0.54;
  const totalBoxHeight = gaugeHeight + strokeWidth;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: totalBoxHeight }}>
        <svg
          width={size}
          height={totalBoxHeight}
          viewBox={`0 0 ${size} ${totalBoxHeight}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#288F3D" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="idleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#F3740F" />
            </linearGradient>
            <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#158AF4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d={`M ${strokeWidth / 2} ${gaugeHeight} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${gaugeHeight}`}
            fill="none"
            stroke="currentColor"
            className="text-black/10 dark:text-white/10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Productive Segment (Green) */}
          <motion.path
            d={`M ${strokeWidth / 2} ${gaugeHeight} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${gaugeHeight}`}
            fill="none"
            stroke="url(#prodGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${prodLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Idle Segment (Orange) */}
          <motion.path
            d={`M ${strokeWidth / 2} ${gaugeHeight} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${gaugeHeight}`}
            fill="none"
            stroke="url(#idleGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${idleLength} ${circumference}`}
            strokeDashoffset={-(prodLength + gap)}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Break Segment (Blue) */}
          <motion.path
            d={`M ${strokeWidth / 2} ${gaugeHeight} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${gaugeHeight}`}
            fill="none"
            stroke="url(#breakGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${breakLength} ${circumference}`}
            strokeDashoffset={-(prodLength + idleLength + gap * 2)}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center Percentage & Clean Sub-Label */}
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[34px] font-semibold leading-none tracking-tight text-[#0F172A] dark:text-white tabular-nums"
          >
            {score}%
          </motion.span>
          <span className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] mt-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
