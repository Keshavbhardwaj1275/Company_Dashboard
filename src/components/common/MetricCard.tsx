import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MiniBarSparkline } from './MiniBarSparkline';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    text?: string;
  };
  sparklineType?: 'bars' | 'bell' | 'heat-grid';
  sparklineValues?: number[];
  highlightIndex?: number;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  sparklineType = 'bars',
  sparklineValues,
  highlightIndex,
  onClick,
}) => {
  return (
    <GlassCard
      hoverEffect
      onClick={onClick}
      className="p-4 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      {/* Top Row: Muted Sentence-case label & "..." menu */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
          {label}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white p-0.5 rounded transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Middle Row: 28-32px Numeral + Delta Chip */}
      <div className="flex items-baseline justify-between mt-2 mb-1">
        <span className="text-[28px] font-semibold leading-tight tracking-tight text-[#0F172A] dark:text-white tabular-nums">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-[6px] ${
              trend.isPositive
                ? 'bg-[#BEF1CA] text-[#1F7A35] dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-[#F7C9C6] text-[#B42318] dark:bg-red-950/40 dark:text-red-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Bottom Row: Caption + Mini Bar Sparkline */}
      <div className="flex items-end justify-between pt-2 border-t border-black/5 dark:border-white/10 mt-1">
        <span className="text-[11px] text-[#475569] dark:text-[#94A3B8] max-w-[140px] truncate font-medium">
          {subValue || (trend?.text ? trend.text : 'Real-time telemetry')}
        </span>

        <div className="opacity-90 group-hover:opacity-100 transition-opacity">
          <MiniBarSparkline
            type={sparklineType}
            values={sparklineValues}
            highlightIndex={highlightIndex}
            height={20}
          />
        </div>
      </div>
    </GlassCard>
  );
};
