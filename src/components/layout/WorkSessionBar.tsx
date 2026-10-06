import React from 'react';
import { 
  Coffee, 
  Clock, 
  Activity, 
  Hourglass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatSecondsToHMS } from '../../utils/productivity';

export const WorkSessionBar: React.FC = () => {
  const { 
    workSession, 
    toggleBreakSession, 
    policies 
  } = useApp();

  const currentStatus = workSession.isOnBreak 
    ? { label: 'ON BREAK', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', dot: 'bg-blue-500 animate-pulse' }
    : workSession.isSimulatedIdle 
    ? { label: `IDLE INACTIVE (${policies.idleThresholdMinutes}m)`, bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500 animate-pulse' }
    : workSession.isActive 
    ? { label: 'ACTIVE SESSION', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500 live-dot-pulse' }
    : { label: 'SESSION PAUSED', bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30', dot: 'bg-slate-400' };

  return (
    <div className="w-full h-9 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-1 border-b border-black/5 dark:border-white/10 flex items-center justify-between gap-2 sm:gap-3 text-[11px]">
      {/* Left: Primary Session State & Essential Telemetry Metrics */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto">
        {/* Status Pill */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-bold shrink-0 ${currentStatus.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
          <span>{currentStatus.label}</span>
        </div>

        {/* Login Time */}
        <div className="flex items-center gap-1 text-[#475569] dark:text-[#94A3B8] shrink-0 text-[11px]">
          <Clock className="w-3 h-3 text-[#64748B]" />
          <span>Login: <strong className="text-[#0F172A] dark:text-white font-semibold font-mono">{workSession.loginTime}</strong></span>
        </div>

        {/* Active Timer (Green Monospace) */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-mono font-bold border border-emerald-500/20 shrink-0 text-[11px]">
          <Activity className="w-3 h-3 text-emerald-600" />
          <span>Active: {formatSecondsToHMS(workSession.activeSeconds)}</span>
        </div>

        {/* Idle Timer (Amber Monospace) */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono font-bold border border-amber-500/20 shrink-0 text-[11px]">
          <Hourglass className="w-3 h-3 text-amber-600" />
          <span>Idle: {formatSecondsToHMS(workSession.idleSeconds)}</span>
        </div>

        {/* Break Timer (Blue Monospace) */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-800 dark:text-blue-300 font-mono font-bold border border-blue-500/20 shrink-0 text-[11px]">
          <Coffee className="w-3 h-3 text-blue-600" />
          <span>Break: {formatSecondsToHMS(workSession.breakSeconds)}</span>
        </div>
      </div>

      {/* Right: Primary Session Action (Take Break / Resume Work) */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          id="btn-session-bar-break"
          onClick={toggleBreakSession}
          className={`h-7 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
            workSession.isOnBreak
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              : 'glass-control text-[#0F172A] dark:text-white hover:bg-white/90 dark:hover:bg-slate-800'
          }`}
          title={workSession.isOnBreak ? 'Resume active work session' : 'Pause productivity tracking for break'}
        >
          <Coffee className={`w-3 h-3 ${workSession.isOnBreak ? 'text-white' : 'text-blue-500'}`} />
          <span>{workSession.isOnBreak ? 'Resume Work' : 'Take Break'}</span>
        </button>
      </div>
    </div>
  );
};

