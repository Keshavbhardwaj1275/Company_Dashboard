import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'card' | 'inner' | 'control';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = false,
  variant = 'card',
  ...props
}) => {
  const variantClass = {
    card: 'glass-card p-4 sm:p-5',
    inner: 'glass-inner p-3.5 sm:p-4',
    control: 'glass-control rounded-xl p-2.5',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hoverEffect
          ? {
              y: -2,
              borderColor: 'rgba(255, 255, 255, 0.95)',
              transition: { duration: 0.2 }
            }
          : undefined
      }
      className={twMerge('relative transition-all duration-200', variantClass, className)}
      {...props}
    >
      {/* Specular Top Sheen Highlight */}
      <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
