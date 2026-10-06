import React from 'react';
import { Activity, Clock, Shield, Laptop, MousePointer, Keyboard } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Employee } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { formatSecondsToHoursMins, formatMinutesToDisplay } from '../../utils/productivity';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose }) => {
  if (!employee) return null;

  const activeHrs = (employee.activeSeconds / 3600).toFixed(1) + 'h';
  const idleHrs = (employee.idleSeconds / 60).toFixed(0) + 'm';
  const breakHrs = (employee.breakSeconds / 60).toFixed(0) + 'm';

  return (
    <Modal
      isOpen={!!employee}
      onClose={onClose}
      title={`${employee.name} — Real-time Telemetry`}
      subtitle={`Employee ID: ${employee.employeeId} · ${employee.department} · ${employee.role}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3.5">
        {/* Profile Card Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl glass-inner">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar
                id={employee.id}
                name={employee.name}
                size="2xl"
                status={employee.status}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">{employee.name}</h3>
                <StatusChip status={employee.status === 'active' ? 'live' : employee.status === 'break' ? 'break' : 'warning'} label={employee.status.toUpperCase()} />
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">{employee.email} · {employee.location}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">Productivity Score</span>
            <div className="text-2xl font-bold text-[#158AF4] dark:text-[#38BDF8] tabular-nums">{employee.productivityScore}%</div>
          </div>
        </div>

        {/* 4 Metric Telemetry Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl glass-inner">
            <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] font-medium">Punch Check-in</span>
            <div className="text-xs font-mono font-semibold text-[#0F172A] dark:text-white mt-0.5">{employee.loginTime}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#BEF1CA]/30 dark:bg-emerald-950/30 text-[#1F7A35] dark:text-emerald-300 border border-[#288F3D]/20">
            <span className="text-[10.5px] font-medium">Active Duration</span>
            <div className="text-xs font-mono font-bold mt-0.5">{activeHrs}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#FDE2C8]/30 dark:bg-amber-950/30 text-[#B45309] dark:text-amber-300 border border-[#F3740F]/20">
            <span className="text-[10.5px] font-medium">Idle Inactivity</span>
            <div className="text-xs font-mono font-bold mt-0.5">{idleHrs}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#DBEAFE]/30 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300 border border-[#158AF4]/20">
            <span className="text-[10.5px] font-medium">Break Duration</span>
            <div className="text-xs font-mono font-bold mt-0.5">{breakHrs}</div>
          </div>
        </div>

        {/* Current Active Task */}
        <GlassCard className="p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">Current Sprint Milestone</span>
            <span className="text-[#288F3D] text-[11px] font-semibold flex items-center gap-1">
              <Activity size={12} />
              <span>Active in IDE Session</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl glass-inner text-xs text-[#0F172A] dark:text-white font-semibold">
            {employee.currentTask}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <div className="flex items-center gap-1">
              <Keyboard size={12} className="text-[#158AF4]" />
              <span>Key: <strong className="text-[#0F172A] dark:text-white">{employee.keyboardActivity}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer size={12} className="text-[#52A3C1]" />
              <span>Mouse: <strong className="text-[#0F172A] dark:text-white">{employee.mouseActivity}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-[#64748B]" />
              <span>Sync: <strong className="text-[#0F172A] dark:text-white">{employee.lastActivity}</strong></span>
            </div>
          </div>
        </GlassCard>

        {/* Admin Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-full btn-yellow"
          >
            Close Telemetry Inspector
          </button>
        </div>
      </div>
    </Modal>
  );
};
