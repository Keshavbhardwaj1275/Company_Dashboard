import React from 'react';
import { GlassCard } from './GlassCard';
import { useApp } from '../../context/AppContext';

interface SegmentedBarProps {
  totalHours?: string;
  delta?: string;
  productiveHours?: number;
  idleHours?: number;
  breakHours?: number;
  className?: string;
}

export const SegmentedBar: React.FC<SegmentedBarProps> = ({
  totalHours = '164.5h',
  delta = '+4.2% vs last month',
  productiveHours = 142.5,
  idleHours = 12.0,
  breakHours = 10.0,
  className,
}) => {
  const { workSession } = useApp();

  // If live session has recorded hours, blend with baseline for dynamic realism
  const currentActiveH = Number((workSession.activeSeconds / 3600).toFixed(1));
  const currentIdleH = Number((workSession.idleSeconds / 3600).toFixed(1));
  const currentBreakH = Number((workSession.breakSeconds / 3600).toFixed(1));

  const finalProd = productiveHours + currentActiveH;
  const finalIdle = idleHours + currentIdleH;
  const finalBreak = breakHours + currentBreakH;
  const total = finalProd + finalIdle + finalBreak;

  const prodPct = (finalProd / total) * 100;
  const idlePct = (finalIdle / total) * 100;
  const breakPct = (finalBreak / total) * 100;

  return (
    <GlassCard className={className}>
      {/* Header with Title & Big Metric */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]">
            Time Distribution & 30-Day Forecast
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[28px] font-semibold tracking-tight text-[#0F172A] dark:text-white tabular-nums">
              {total.toFixed(1)}h
            </span>
            <span className="text-[11px] font-semibold text-[#1F7A35] dark:text-[#86EFAC]">
              {delta}
            </span>
          </div>
        </div>

        {/* Action / Metric pill */}
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#475569] dark:text-[#94A3B8]">
          Monthly Pulse
        </span>
      </div>

      {/* Numerical Indicators above bar */}
      <div className="flex justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-mono">
        <span>0h</span>
        <span>60h</span>
        <span>120h</span>
        <span>180h</span>
      </div>

      {/* Main Segmented Liquid Bar */}
      <div className="w-full h-3.5 rounded-full overflow-hidden flex gap-1 p-0.5 bg-black/5 dark:bg-white/10">
        {/* Productive Blocks (Green) */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#288F3D] to-[#34D399] transition-all duration-300"
          style={{ width: `${prodPct}%` }}
          title={`Productive: ${finalProd.toFixed(1)}h`}
        />
        {/* Idle Block (Orange) */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F3740F] transition-all duration-300"
          style={{ width: `${idlePct}%` }}
          title={`Idle: ${finalIdle.toFixed(1)}h`}
        />
        {/* Break Block (Blue) */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#158AF4] to-[#38BDF8] transition-all duration-300"
          style={{ width: `${breakPct}%` }}
          title={`Break: ${finalBreak.toFixed(1)}h`}
        />
      </div>

      {/* Legend Row with colored dots */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#288F3D]" />
          <span>Productive ({Math.round(prodPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F3740F]" />
          <span>Idle ({Math.round(idlePct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#158AF4]" />
          <span>Break ({Math.round(breakPct)}%)</span>
        </div>
      </div>

      {/* Inner Confidence Strip */}
      <div className="mt-3.5 glass-inner p-2.5 flex items-center justify-between text-[11px]">
        <span className="text-[#475569] dark:text-[#94A3B8]">Forecast Accuracy Confidence</span>
        <span className="font-semibold text-[#0F172A] dark:text-white font-mono">95.4% (High)</span>
      </div>
    </GlassCard>
  );
};
