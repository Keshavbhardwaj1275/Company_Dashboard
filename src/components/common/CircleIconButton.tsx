import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface CircleIconButtonProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  badgeCount?: number;
}

export const CircleIconButton: React.FC<CircleIconButtonProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  className,
  badgeCount,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={twMerge(
        'relative group h-10 flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FFE956]',
        isActive
          ? 'px-3.5 rounded-full bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-md border border-white/90 dark:border-white/20'
          : 'w-10 rounded-full glass-control text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800',
        className
      )}
    >
      <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
        {icon}
      </span>

      {isActive && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.18 }}
          className="ml-2 text-[13px] font-semibold whitespace-nowrap overflow-hidden text-[#0F172A] dark:text-white"
        >
          {label}
        </motion.span>
      )}

      {/* Optional Badge Indicator */}
      {typeof badgeCount === 'number' && badgeCount > 0 && !isActive && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </button>
  );
};
