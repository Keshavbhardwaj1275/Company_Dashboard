import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  Activity,
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { weeklyTrendData } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { formatSecondsToHoursMins } from '../../utils/productivity';

export const DashboardSummaryWidgets: React.FC = () => {
  const { setActiveTab, workSession, tasks } = useApp();

  const completedTasksToday = tasks.filter((t) => t.status === 'completed').length;

  // Rollup stats for weekly summary
  const totalWeeklyActiveHours = weeklyTrendData.reduce((sum, d) => sum + d.productive, 0).toFixed(1);
  const avgWeeklyScore = Math.round(weeklyTrendData.reduce((sum, d) => sum + d.score, 0) / weeklyTrendData.length);

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#158AF4]" />
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white tracking-tight">
            Productivity & Rhythm Intelligence
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('productivity')}
          className="text-[11px] font-semibold text-[#0F172A] dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Deep Dive Analysis</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* 2-Column Balanced Grid: Weekly Summary + Daily Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 items-stretch">
        {/* ── 1. WEEKLY SUMMARY CARD ──────────────────────────── */}
        <GlassCard className="p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#288F3D]" />
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                  Weekly Summary
                </h4>
              </div>
              <span className="text-[10.5px] font-semibold text-[#288F3D] font-mono">
                {avgWeeklyScore}% Avg Focus
              </span>
            </div>

            {/* 7-Day Mini Bar Strip */}
            <div className="flex items-end gap-2 h-14 pt-1 px-1">
              {weeklyTrendData.map((d) => {
                const heightPct = Math.min(100, Math.round((d.productive / 8.5) * 100));
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full rounded-sm bg-[#158AF4] hover:bg-[#288F3D] transition-colors"
                      style={{ height: `${heightPct}%`, minHeight: '4px' }}
                      title={`${d.day}: ${d.productive}h active (${d.score}%)`}
                    />
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rollup Verdict */}
          <div className="pt-2 mt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <span>Weekly active total: <strong className="text-[#0F172A] dark:text-white font-mono">{totalWeeklyActiveHours}h</strong></span>
            <span className="text-[#288F3D] font-semibold font-mono">Optimal Velocity</span>
          </div>
        </GlassCard>

        {/* ── 2. DAILY REPORT CARD ────────────────────────────── */}
        <GlassCard className="p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-[#F3740F]" />
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                  Daily Report
                </h4>
              </div>
              <span className="text-[10.5px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                Today's Summary
              </span>
            </div>

            {/* Condensed Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl glass-inner text-center text-xs">
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Check-In / Out</span>
                <div className="font-mono font-semibold text-[11.5px] text-[#0F172A] dark:text-white truncate mt-0.5">
                  {workSession.loginTime} / {workSession.logoutTime || '--'}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Active Time</span>
                <div className="font-mono font-semibold text-[11.5px] text-[#288F3D] truncate mt-0.5">
                  {formatSecondsToHoursMins(workSession.activeSeconds)}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Sprint Milestones</span>
                <div className="font-mono font-semibold text-[11.5px] text-[#158AF4] truncate mt-0.5">
                  {completedTasksToday} Completed
                </div>
              </div>
            </div>
          </div>

          {/* One-Line Verdict */}
          <div className="pt-2 mt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <span className="truncate">Compliance status: <strong>Core targets met</strong></span>
            <span className="text-[#288F3D] font-semibold shrink-0">100% Compliant</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardSummaryWidgets;
