import React from 'react';
import { twMerge } from 'tailwind-merge';

interface StatusChipProps {
  status: 'active' | 'passed' | 'warning' | 'idle' | 'break' | 'closed' | 'live' | 'completed' | 'danger' | 'success';
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className }) => {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  const styles = {
    active: 'chip-success',
    passed: 'chip-success',
    live: 'chip-success',
    completed: 'chip-success',
    success: 'chip-success',
    warning: 'chip-warning',
    idle: 'chip-warning',
    break: 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950/60 dark:text-blue-300',
    closed: 'chip-danger',
    danger: 'chip-danger',
  }[status];

  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-tight rounded-[6px] transition-colors',
        styles,
        className
      )}
    >
      {displayLabel}
    </span>
  );
};
