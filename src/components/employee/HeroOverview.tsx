import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Coffee, 
  Download, 
  Play, 
  Pause, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { HalfGauge } from '../common/HalfGauge';
import { StatusChip } from '../common/StatusChip';
import { calculateProductivityScore } from '../../utils/productivity';
import { exportToCSV } from '../../utils/exportUtils';

export const HeroOverview: React.FC = () => {
  const { 
    currentUser, 
    setActiveTab, 
    addToast,
    workSession, 
    startWorkSession, 
    stopWorkSession, 
    toggleBreakSession, 
    policies 
  } = useApp();

  const [checklist, setChecklist] = useState([
    { id: 1, title: 'Morning check-in & biometric punch', status: 'completed', time: '09:04 AM' },
    { id: 2, title: 'Prepare weekly client deliverables & sync', status: 'completed', time: '10:30 AM' },
    { id: 3, title: 'Productivity telemetry & workflow review', status: 'in_progress', time: '02:00 PM' },
    { id: 4, title: 'Daily activity log & end-of-day handoff', status: 'pending', time: '05:30 PM' },
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleExportQuick = () => {
    const headers = ['Task Title', 'Status', 'Scheduled Time', 'Assignee'];
    const rows = checklist.map((item) => [
      item.title,
      item.status.toUpperCase(),
      item.time,
      currentUser.name,
    ]);
    exportToCSV(`flowsphere-daily-summary-${new Date().toISOString().split('T')[0]}`, headers, rows);
    addToast('Timesheet Exported', 'Downloaded daily workflow summary CSV.', 'success');
  };

  const completedCount = checklist.filter((i) => i.status === 'completed').length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);

  // Dynamic Productivity Score from shared session
  const liveScore = useMemo(() => {
    return calculateProductivityScore(
      workSession.activeSeconds,
      workSession.idleSeconds,
      workSession.breakSeconds
    );
  }, [workSession.activeSeconds, workSession.idleSeconds, workSession.breakSeconds]);

  // Dynamic Ratios for Gauge Segments
  const totalTrackedSec = workSession.activeSeconds + workSession.idleSeconds + workSession.breakSeconds || 1;
  const prodPct = Math.round((workSession.activeSeconds / totalTrackedSec) * 100);
  const idlePct = Math.round((workSession.idleSeconds / totalTrackedSec) * 100);
  const breakPct = Math.round((workSession.breakSeconds / totalTrackedSec) * 100);

  // Telemetry 1: Core Hours Status
  const coreHoursTelemetry = useMemo(() => {
    if (!workSession.isActive) {
      return { label: 'Completed', status: 'closed' as const };
    }
    if (workSession.isOnBreak) {
      return { label: 'On Break', status: 'break' as const };
    }
    if (workSession.isSimulatedIdle) {
      return { label: 'Idle', status: 'warning' as const };
    }
    return { label: 'Active', status: 'passed' as const };
  }, [workSession.isActive, workSession.isOnBreak, workSession.isSimulatedIdle]);

  // Telemetry 2: Idle Limit Status
  const idleLimitTelemetry = useMemo(() => {
    const actualIdleMinutes = Math.floor(workSession.idleSeconds / 60);
    const allowedIdleMinutes = policies.allowedIdleMinutes || 45;

    if (actualIdleMinutes > allowedIdleMinutes) {
      return { label: 'Exceeded', status: 'warning' as const };
    }
    if (actualIdleMinutes > allowedIdleMinutes * 0.8) {
      return { label: 'Warning', status: 'warning' as const };
    }
    return { label: 'Passed', status: 'passed' as const };
  }, [workSession.idleSeconds, policies.allowedIdleMinutes]);

  // Telemetry 3: Break Target Status
  const breakTargetTelemetry = useMemo(() => {
    const actualBreakMinutes = Math.floor(workSession.breakSeconds / 60);
    const targetBreakMinutes = 45; // 45m standard enterprise daily break allowance

    if (!workSession.isActive) {
      return { label: 'No Session', status: 'closed' as const };
    }
    if (workSession.isOnBreak) {
      return { label: 'In Progress', status: 'break' as const };
    }
    if (actualBreakMinutes > 50) {
      return { label: 'Above Target', status: 'warning' as const };
    }
    if (actualBreakMinutes >= 45) {
      return { label: 'Target Reached', status: 'passed' as const };
    }
    return { label: 'Optimal', status: 'passed' as const };
  }, [workSession.isActive, workSession.isOnBreak, workSession.breakSeconds]);

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* 1. Header Row: Greeting + 3 Centered Quick Actions + Yellow Primary CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Left: Greeting & Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight">
            Welcome Back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Here's your productivity overview & today's work pulse.
          </p>
        </div>

        {/* Center: 3 Centered Glass Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-control text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-all outline-none"
          >
            <PlusCircle size={14} className="text-[#288F3D]" />
            <span>New Task</span>
          </button>

          <button
            type="button"
            id="btn-quick-toggle-break"
            onClick={toggleBreakSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-control text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-all outline-none"
          >
            <Coffee size={14} className="text-[#158AF4]" />
            <span>{workSession.isOnBreak ? 'Resume Work' : 'Take Break'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportQuick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-control text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-all outline-none"
          >
            <Download size={14} className="text-[#475569]" />
            <span>Export Report</span>
          </button>

          {/* Right: Primary Yellow CTA (Work Session Toggle) */}
          <button
            type="button"
            id="btn-quick-toggle-session"
            onClick={() => {
              if (workSession.isActive) {
                stopWorkSession();
              } else {
                startWorkSession();
              }
            }}
            className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold outline-none ml-1"
          >
            {workSession.isActive ? (
              <>
                <Pause size={14} />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Symmetrical Split Row: 40% Sprint Milestones + 60% Productivity Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        {/* Left: Today's Checklist Card (lg:col-span-5) */}
        <div className="lg:col-span-5 flex">
          <GlassCard className="p-3.5 sm:p-4 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                    Today's Sprint Milestones
                  </h3>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    {completedCount} of {checklist.length} items completed
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#288F3D] rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#288F3D] font-mono">
                    {progressPct}%
                  </span>
                </div>
              </div>

              {/* Sprint Milestones Checklist (Status reflection) */}
              <div className="glass-inner p-2.5 space-y-1.5 mt-2.5">
                {checklist.map((item) => {
                  const isDone = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <CheckCircle2 size={15} className="text-[#288F3D] flex-shrink-0" />
                        ) : (
                          <Circle size={15} className="text-[#94A3B8] flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isDone
                              ? 'text-[#64748B] dark:text-[#94A3B8] line-through'
                              : 'text-[#0F172A] dark:text-white font-medium'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono flex-shrink-0 ml-2">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
              <span>Next sprint sync: 05:00 PM</span>
              <button
                type="button"
                onClick={() => setActiveTab('workflow')}
                className="text-[#0F172A] dark:text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Manage Sprint</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right: Productivity Pulse Card with HalfGauge & 3-Column Telemetry Strip (lg:col-span-7) */}
        <div className="lg:col-span-7 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Productivity Pulse
                </h3>
                <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  Real-time compliance telemetry & work ratio
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('productivity')}
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Deep dive analytics"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Proportional HalfGauge with Controlled Vertical Spacing */}
            <div className="my-2 sm:my-3 flex items-center justify-center">
              <HalfGauge
                score={liveScore}
                productivePercent={prodPct}
                idlePercent={idlePct}
                breakPercent={breakPct}
                label="Overall Efficiency Score"
                size={185}
              />
            </div>

            {/* Compact 3-Column Status Row */}
            <div className="glass-inner p-2.5 sm:p-3 grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* Column 1: Core Hours */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                  Core Hours
                </span>
                <StatusChip status={coreHoursTelemetry.status} label={coreHoursTelemetry.label} />
              </div>

              {/* Column 2: Idle Limit */}
              <div className="flex flex-col items-center justify-center border-x border-black/5 dark:border-white/10 px-1">
                <span className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                  Idle Limit
                </span>
                <StatusChip status={idleLimitTelemetry.status} label={idleLimitTelemetry.label} />
              </div>

              {/* Column 3: Break Target */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                  Break Target
                </span>
                <StatusChip status={breakTargetTelemetry.status} label={breakTargetTelemetry.label} />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

