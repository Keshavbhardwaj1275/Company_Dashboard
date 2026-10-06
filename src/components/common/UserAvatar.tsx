import React from 'react';
import { twMerge } from 'tailwind-merge';

export const AVATAR_STYLE: 'monogram' | 'silhouette' = 'monogram';

export interface UserAvatarProps {
  id?: string;
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'active' | 'idle' | 'break' | 'offline';
  className?: string;
  style?: 'monogram' | 'silhouette';
}

// Muted corporate palette only
const CORPORATE_PALETTES = [
  { from: '#2A4D7A', to: '#1E3A5F', name: 'navy' },
  { from: '#475569', to: '#334155', name: 'slate' },
  { from: '#138A81', to: '#0F766E', name: 'teal' },
  { from: '#2A7A4C', to: '#1F5F3A', name: 'forest' },
  { from: '#4B5CA8', to: '#3B4A8F', name: 'indigo' },
  { from: '#4B5563', to: '#374151', name: 'graphite' },
  { from: '#724B84', to: '#5B3A6B', name: 'plum' },
  { from: '#3D74AA', to: '#2F5D8A', name: 'steel' },
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  id = '',
  name = '',
  size = 'md',
  status,
  className,
  style = AVATAR_STYLE,
}) => {
  // Deterministic color from ID or Name
  const seedString = (id || name || 'fs').toLowerCase();
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % CORPORATE_PALETTES.length;
  const palette = CORPORATE_PALETTES[paletteIndex];

  // Extract initials (e.g., "Keshav Bhardwaj" -> "KB")
  const getInitials = (n: string) => {
    if (!n.trim()) return '';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);
  const useSilhouette = style === 'silhouette' || !initials;

  const sizeStyles = {
    sm: { box: 'w-6 h-6', text: 'text-[10px]', dot: 'w-2 h-2', dotOffset: '-bottom-0.5 -right-0.5' },
    md: { box: 'w-8 h-8', text: 'text-xs', dot: 'w-2.5 h-2.5', dotOffset: '-bottom-0.5 -right-0.5' },
    lg: { box: 'w-10 h-10', text: 'text-sm', dot: 'w-3 h-3', dotOffset: 'bottom-0 right-0' },
    xl: { box: 'w-14 h-14', text: 'text-lg', dot: 'w-3.5 h-3.5', dotOffset: 'bottom-0.5 right-0.5' },
    '2xl': { box: 'w-20 h-20', text: 'text-2xl', dot: 'w-4 h-4', dotOffset: 'bottom-1 right-1' },
  }[size];

  const statusColor = {
    active: 'bg-[#288F3D]',
    idle: 'bg-[#F3740F]',
    break: 'bg-[#158AF4]',
    offline: 'bg-[#6B7280]',
  };

  return (
    <div
      role="img"
      aria-label={name || 'User Avatar'}
      className={twMerge('relative inline-flex flex-shrink-0 select-none', className)}
    >
      <div
        className={twMerge(
          'rounded-full flex items-center justify-center font-medium text-white shadow-sm ring-1 ring-white/60 dark:ring-white/20',
          sizeStyles.box,
          sizeStyles.text
        )}
        style={{
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        {useSilhouette ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3/5 h-3/5 text-white/90"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        ) : (
          <span className="tracking-wide leading-none">{initials}</span>
        )}
      </div>

      {/* Presence Status Dot (8px with 2px frame-colored ring) */}
      {status && (
        <span
          className={twMerge(
            'absolute rounded-full ring-2 ring-[#EDEDED] dark:ring-[#0B1020]',
            sizeStyles.dot,
            sizeStyles.dotOffset,
            statusColor[status]
          )}
        />
      )}
    </div>
  );
};
