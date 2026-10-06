import React, { useState } from 'react';
import { Download, ShieldCheck, DollarSign, FileSpreadsheet, Clock, AlertTriangle, Plus, Send } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { Modal } from '../common/Modal';
import { mockMonthlyAttendance } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import { calculatePayrollImpact, calculateOvertime } from '../../utils/productivity';

export const AttendanceCenter: React.FC = () => {
  const { addToast, policies, workSession, currentUser, idleExceptions, requestIdleException } = useApp();
  const [selectedMonth] = useState('October 2026');

  // Idle Exception Form State
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [formDate, setFormDate] = useState('2026-10-06');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('14:45');
  const [formReason, setFormReason] = useState('');

  const myExceptions = idleExceptions.filter((exc) => exc.employeeId === currentUser.id);

  const calculateRequestedDuration = () => {
    if (!formStartTime || !formEndTime) return 30;
    const [sh, sm] = formStartTime.split(':').map(Number);
    const [eh, em] = formEndTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 30;
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : 30;
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim()) {
      addToast('Reason Required', 'Please explain the reason for the offline or idle period.', 'warning');
      return;
    }

    const duration = calculateRequestedDuration();
    requestIdleException({
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      reason: formReason.trim(),
      durationMinutes: duration,
    });

    setFormReason('');
    setIsExceptionModalOpen(false);
  };

  const handleExportAttendance = (format: 'CSV' | 'Excel') => {
    const headers = [
      'Date',
      'Day',
      'Status',
      'Login Time',
      'Logout Time',
      'Active Hours',
      'Idle Hours',
      'Break Hours',
      'Early Logout',
      'Productivity %',
      'Payroll Status'
    ];

    const rows = mockMonthlyAttendance.map((item) => [
      item.date,
      item.dayName,
      item.status.toUpperCase(),
      item.loginTime,
      item.logoutTime,
      item.activeHours,
      item.idleHours,
      item.breakHours,
      item.earlyLogout || '--',
      item.productivityPercentage > 0 ? `${item.productivityPercentage}%` : '--',
      item.deductionStatus || 'Full Pay Approved'
    ]);

    if (format === 'CSV') {
      exportToCSV(`flowsphere-attendance-${selectedMonth.toLowerCase().replace(' ', '-')}`, headers, rows);
      addToast('Timesheet Exported', `Downloaded ${selectedMonth} attendance CSV report.`, 'success');
    } else {
      exportToExcel(`flowsphere-attendance-${selectedMonth.toLowerCase().replace(' ', '-')}`, headers, rows);
      addToast('Excel Exported', `Downloaded ${selectedMonth} Excel timesheet.`, 'success');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'present':
        return <StatusChip status="passed" label="Present" />;
      case 'late':
        return <StatusChip status="warning" label="Late Login" />;
      case 'half-day':
        return <StatusChip status="break" label="Half Day" />;
      case 'absent':
        return <StatusChip status="closed" label="Absent" />;
      default:
        return <span className="text-[10px] text-[#94A3B8] font-medium">Weekend</span>;
    }
  };

  const payrollSummary = calculatePayrollImpact(
    Math.floor(workSession.idleSeconds / 60),
    policies.allowedIdleMinutes
  );

  const overtimeSummary = calculateOvertime(
    workSession.activeSeconds,
    policies.minimumWorkingHours
  );

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Attendance & Payroll Timesheet
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Biometric punch logs, shift grace period tracking, early logout monitoring, and payroll impact
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExceptionModalOpen(true)}
            className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm"
          >
            <Clock size={14} />
            <span>Request Idle Exception</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportAttendance('CSV')}
            className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportAttendance('Excel')}
            className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80"
          >
            <FileSpreadsheet size={14} className="text-[#288F3D]" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* 5 Attendance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Present Days</span>
          <div className="text-[26px] font-semibold text-[#0F172A] dark:text-white my-0.5 tabular-nums">22 days</div>
          <span className="text-[11px] text-[#1F7A35] dark:text-[#86EFAC] font-semibold">100% On-Track</span>
        </GlassCard>

        <GlassCard className="p-3.5 flex flex-col justify-between">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Late Logins</span>
          <div className="text-[26px] font-semibold text-[#F3740F] my-0.5 tabular-nums">2 days</div>
          <span className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">Within {policies.gracePeriodMinutes}m Grace</span>
        </GlassCard>

        <GlassCard className="p-3.5 flex flex-col justify-between">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Early Logouts</span>
          <div className="text-[26px] font-semibold text-[#158AF4] my-0.5 tabular-nums">1 day</div>
          <span className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">Approved Half-Day</span>
        </GlassCard>

        <GlassCard className="p-3.5 flex flex-col justify-between">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Absent Days</span>
          <div className="text-[26px] font-semibold text-[#288F3D] my-0.5 tabular-nums">0 days</div>
          <span className="text-[11px] text-[#1F7A35] dark:text-[#86EFAC] font-semibold">Zero Unplanned</span>
        </GlassCard>

        <GlassCard className="p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">Total Overtime</span>
          <div className="text-[26px] font-semibold text-[#8B5CF6] my-0.5 tabular-nums">04h 20m</div>
          <span className="text-[11px] text-[#8B5CF6] font-semibold">+1.5x Pay Multiplier</span>
        </GlassCard>
      </div>

      {/* Main Attendance Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 8 Cols: Punch Log Table */}
        <div className="lg:col-span-8 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                  Daily Punch Log & Telemetry
                </h3>
                <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  Shift Schedule: {policies.shiftStart} – {policies.shiftEnd} ({policies.gracePeriodMinutes}m Grace)
                </span>
              </div>
              <span className="text-xs font-semibold text-[#0F172A] dark:text-white px-3 py-1 rounded-full glass-control">
                {selectedMonth}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-2.5 font-semibold">Date & Day</th>
                    <th className="py-2.5 px-2.5 font-semibold">Status</th>
                    <th className="py-2.5 px-2.5 font-semibold">Login</th>
                    <th className="py-2.5 px-2.5 font-semibold">Logout</th>
                    <th className="py-2.5 px-2.5 font-semibold">Active</th>
                    <th className="py-2.5 px-2.5 font-semibold">Idle</th>
                    <th className="py-2.5 px-2.5 font-semibold">Early Exit</th>
                    <th className="py-2.5 px-2.5 font-semibold text-right">Productivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                  {mockMonthlyAttendance.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors ${
                        idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2.5 font-semibold text-[#0F172A] dark:text-white">
                        {item.date} <span className="text-xs text-[#64748B] font-normal">({item.dayName})</span>
                      </td>
                      <td className="py-2.5 px-2.5">{getStatusChip(item.status)}</td>
                      <td className="py-2.5 px-2.5 font-mono text-xs text-[#475569] dark:text-[#94A3B8]">{item.loginTime}</td>
                      <td className="py-2.5 px-2.5 font-mono text-xs text-[#475569] dark:text-[#94A3B8]">{item.logoutTime}</td>
                      <td className="py-2.5 px-2.5 font-mono text-xs text-[#288F3D] font-semibold">{item.activeHours}</td>
                      <td className="py-2.5 px-2.5 font-mono text-xs text-[#F3740F]">{item.idleHours}</td>
                      <td className="py-2.5 px-2.5 text-xs text-[#64748B] dark:text-[#94A3B8]">{item.earlyLogout || '--'}</td>
                      <td className="py-2.5 px-2.5 text-right text-[#0F172A] dark:text-white font-mono text-xs font-semibold">
                        {item.productivityPercentage > 0 ? `${item.productivityPercentage}%` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols: Payroll & Compliance Rule Summary */}
        <div className="lg:col-span-4 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-[#288F3D]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                  Payroll & Inactivity Impact
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-[#475569] dark:text-[#94A3B8]">
                <div className="glass-inner p-3">
                  <div className="font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Standard Daily Shift Hours
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {policies.minimumWorkingHours} Hours required per shift. Formula: <strong>Total Login - Idle Duration - Breaks = Productive Time</strong>.
                  </p>
                </div>

                <div className="glass-inner p-3">
                  <div className="font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Idle Time Threshold & Policy
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Inactivity &gt; {policies.idleThresholdMinutes} mins auto-pauses productive timer. Max {policies.allowedIdleMinutes} mins allowed idle/day.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#BEF1CA]/40 dark:bg-emerald-950/30 border border-[#288F3D]/20 text-[#1F7A35] dark:text-emerald-300">
                  <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} />
                    <span>Payroll Status: {payrollSummary.status}</span>
                  </div>
                  <p className="text-[11px]">
                    Loss of Pay (LOP) Deduction: <strong>${payrollSummary.lossOfPay.toFixed(2)}</strong>. Overtime payout accrued: <strong>+${(overtimeSummary.overtimePayout + 142.5).toFixed(2)}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 text-[10px] text-[#64748B] dark:text-[#94A3B8]">
              * Simulated frontend compliance & payroll impact model
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Employee's Own Idle Exception History Section */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#158AF4]" />
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                My Idle Exceptions & Offline Requests ({myExceptions.length})
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Track your submitted offline work logs, client meeting exceptions, and admin approval status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExceptionModalOpen(true)}
            className="btn-yellow flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            <Plus size={13} />
            <span>New Exception Request</span>
          </button>
        </div>

        {myExceptions.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <p className="font-medium">No idle exception requests submitted yet.</p>
            <p className="text-[11px] mt-0.5">
              Have an offline client workshop or unexpected connection outage? Click <strong>"New Exception Request"</strong> to submit for admin review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Time Window / Duration</th>
                  <th className="py-2.5 px-3 font-semibold">Reason</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Admin Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                {myExceptions.map((exc) => (
                  <tr key={exc.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A] dark:text-white">
                      {exc.date}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#F3740F] font-semibold">
                      {exc.startTime && exc.endTime ? `${exc.startTime} – ${exc.endTime} ` : ''}
                      ({exc.durationMinutes} mins)
                    </td>
                    <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8] max-w-xs">
                      {exc.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      {exc.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#BEF1CA] text-[#1F7A35]">
                          Approved Exception
                        </span>
                      ) : exc.status === 'rejected' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F7C9C6] text-[#B42318]">
                          Rejected / Disputed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDE2C8] text-[#B45309]">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {exc.adminComment ? (
                        <span className="italic font-medium">{exc.adminComment}</span>
                      ) : exc.status === 'pending' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Manager Review</span>
                      ) : (
                        '--'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Request Idle Exception Modal */}
      <Modal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        title="Request Inactivity / Idle Exception"
        subtitle={`Submit offline working period or outage for approval (${currentUser.name} · ${currentUser.employeeId})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleExceptionSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-[#0F172A] dark:text-white mb-1">
              Date of Activity
            </label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-2 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#0F172A] dark:text-white mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-[#0F172A] dark:text-white mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl glass-inner flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
            <span>Estimated Duration:</span>
            <span className="font-mono font-bold text-[#F3740F]">{calculateRequestedDuration()} Minutes</span>
          </div>

          <div>
            <label className="block font-medium text-[#0F172A] dark:text-white mb-1">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="e.g. In-person client whiteboard sprint, ISP fiber connection outage, external hardware setup..."
              className="w-full px-3 py-2 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none text-xs resize-none placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsExceptionModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl glass-control text-[#475569] hover:text-[#0F172A] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-yellow flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-semibold shadow-sm"
            >
              <Send size={13} />
              <span>Submit Request</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
