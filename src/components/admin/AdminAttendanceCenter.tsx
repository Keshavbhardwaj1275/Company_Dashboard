import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Download, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  UserCheck, 
  FileSpreadsheet,
  Sliders,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';

export const AdminAttendanceCenter: React.FC = () => {
  const { employees, setEmployees, addToast, setActiveTab } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-10-06');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Manual Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingEmployee, setAdjustingEmployee] = useState<Employee | null>(null);
  const [adjustLoginTime, setAdjustLoginTime] = useState('09:00 AM');
  const [adjustLogoutTime, setAdjustLogoutTime] = useState('06:00 PM');
  const [adjustStatus, setAdjustStatus] = useState<Employee['attendanceStatus']>('present');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustReasonError, setAdjustReasonError] = useState('');

  // Org-wide KPI metrics
  const kpis = useMemo(() => {
    const total = employees.length;
    const present = employees.filter((e) => e.attendanceStatus === 'present').length;
    const absent = employees.filter((e) => e.attendanceStatus === 'absent').length;
    const late = employees.filter((e) => e.attendanceStatus === 'late').length;
    const halfDay = employees.filter((e) => e.attendanceStatus === 'half-day').length;
    const missing = employees.filter(
      (e) => (e.loginTime !== '--' && (!e.logoutTime || e.logoutTime === '--')) || e.attendanceStatus === 'late' && !e.logoutTime
    ).length;

    // Estimated overtime in hours
    const totalOvertimeHrs = 42.5;

    return {
      total,
      present,
      absent,
      late,
      halfDay,
      missing,
      totalOvertimeHrs,
    };
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'all' || emp.department === selectedDept;
      
      let matchStatus = true;
      if (selectedStatus === 'missing') {
        matchStatus = emp.loginTime !== '--' && (!emp.logoutTime || emp.logoutTime === '--');
      } else if (selectedStatus !== 'all') {
        matchStatus = emp.attendanceStatus === selectedStatus;
      }

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  // Missing punches list
  const missingPunchList = useMemo(() => {
    return employees.filter(
      (emp) => emp.attendanceStatus === 'absent' || (emp.loginTime !== '--' && (!emp.logoutTime || emp.logoutTime === '--'))
    );
  }, [employees]);

  const handleOpenAdjustModal = (emp: Employee) => {
    setAdjustingEmployee(emp);
    setAdjustLoginTime(emp.loginTime === '--' ? '09:00 AM' : emp.loginTime);
    setAdjustLogoutTime(emp.logoutTime === '--' || !emp.logoutTime ? '06:00 PM' : emp.logoutTime);
    setAdjustStatus(emp.attendanceStatus);
    setAdjustReason('');
    setAdjustReasonError('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustReason.trim()) {
      setAdjustReasonError('Please provide a mandatory audit reason for manual timesheet adjustment.');
      return;
    }
    if (!adjustingEmployee) return;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === adjustingEmployee.id) {
          const isActive = adjustStatus === 'present' || adjustStatus === 'late';
          return {
            ...emp,
            loginTime: adjustLoginTime,
            logoutTime: adjustLogoutTime,
            attendanceStatus: adjustStatus,
            status: isActive ? 'active' : 'offline',
            activeSeconds: isActive && emp.activeSeconds === 0 ? 25200 : emp.activeSeconds,
          };
        }
        return emp;
      })
    );

    addToast(
      'Attendance Adjusted',
      `Manual adjustment saved for ${adjustingEmployee.name}. Audit log entry recorded.`,
      'success'
    );
    setIsAdjustModalOpen(false);
  };

  const handleExportOrgAttendance = (format: 'CSV' | 'Excel') => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Role',
      'Date',
      'Login Time',
      'Logout Time',
      'Active Hours',
      'Idle Hours',
      'Status',
      'Productivity Score'
    ];

    const rows = employees.map((emp) => [
      emp.employeeId,
      emp.name,
      emp.department,
      emp.role,
      selectedDate,
      emp.loginTime,
      emp.logoutTime || '--',
      (emp.activeSeconds / 3600).toFixed(1) + 'h',
      (emp.idleSeconds / 60).toFixed(0) + 'm',
      emp.attendanceStatus.toUpperCase(),
      `${emp.productivityScore}%`
    ]);

    if (format === 'CSV') {
      exportToCSV(`flowsphere-team-attendance-${selectedDate}`, headers, rows);
      addToast('Org Timesheet Exported', `Downloaded team attendance CSV for ${selectedDate}.`, 'success');
    } else {
      exportToExcel(`flowsphere-team-attendance-${selectedDate}`, headers, rows);
      addToast('Excel Exported', `Downloaded team attendance Excel report.`, 'success');
    }
  };

  const getAttendanceStatusChip = (status: Employee['attendanceStatus']) => {
    switch (status) {
      case 'present':
        return <StatusChip status="passed" label="Present" />;
      case 'late':
        return <StatusChip status="warning" label="Late Login" />;
      case 'half-day':
        return <StatusChip status="break" label="Half-day" />;
      case 'absent':
        return <StatusChip status="closed" label="Absent" />;
      case 'overtime':
        return <StatusChip status="live" label="Overtime" />;
      default:
        return <StatusChip status="closed" label={status} />;
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto font-sans">
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Team Attendance & Shift Governance
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Org-wide biometric punch logs, missing punch regularization, manual timesheet adjustments, and overtime tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => handleExportOrgAttendance('CSV')}
            className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportOrgAttendance('Excel')}
            className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80"
          >
            <FileSpreadsheet size={14} className="text-[#288F3D]" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS ROW (ORG-WIDE) ──────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Present Today */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Present Today
            </span>
            <span className="w-2 h-2 rounded-full bg-[#288F3D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
              {kpis.present}
            </span>
            <span className="text-[11px] text-[#288F3D] font-semibold">
              ({Math.round((kpis.present / kpis.total) * 100)}%)
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Standard shift compliant
          </span>
        </GlassCard>

        {/* Absent Today */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Absent Today
            </span>
            <span className="w-2 h-2 rounded-full bg-[#B42318]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#B42318] dark:text-red-400">
              {kpis.absent}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              of {kpis.total} staff
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Approved leaves & off
          </span>
        </GlassCard>

        {/* Late Logins Today */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Late Logins
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F3740F]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#F3740F]">
              {kpis.late}
            </span>
            <span className="text-[11px] text-[#F3740F] font-semibold">
              Grace exceeded
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Logged in after 09:15 AM
          </span>
        </GlassCard>

        {/* Missing Punch-outs */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Missing Punch-Outs
            </span>
            <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
              {kpis.missing}
            </span>
            <span className="text-[11px] text-[#EAB308] font-semibold">
              Requires review
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Active / no checkout
          </span>
        </GlassCard>

        {/* Total Overtime This Week */}
        <GlassCard className="p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Total Overtime (WTD)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#158AF4]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#158AF4]">
              {kpis.totalOvertimeHrs}h
            </span>
            <span className="text-[11px] text-[#288F3D] font-semibold">
              +14% vs avg
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Calculated across org
          </span>
        </GlassCard>
      </div>

      {/* ── MISSING PUNCH REPORT PANEL ──────────────────────── */}
      {missingPunchList.length > 0 && (
        <GlassCard className="p-3.5 sm:p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#F3740F] shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                Missing Punch & Exception Queue ({missingPunchList.length} Records)
              </h3>
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Employees with missing checkout timestamps or irregular attendance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {missingPunchList.slice(0, 4).map((emp) => (
              <div
                key={emp.id}
                className="p-2 rounded-xl glass-inner flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar id={emp.id} name={emp.name} size="sm" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#0F172A] dark:text-white truncate text-[12px]">
                      {emp.name}
                    </div>
                    <div className="text-[10.5px] text-[#F3740F] font-mono">
                      {emp.loginTime !== '--' ? `In: ${emp.loginTime} · Missing Out` : 'No punch recorded'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAdjustModal(emp)}
                  className="px-2 py-1 rounded-lg glass-control text-[11px] font-semibold text-[#158AF4] hover:bg-white dark:hover:bg-slate-800 shrink-0"
                >
                  Adjust
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── FILTERS & SEARCH BAR ────────────────────────────── */}
      <GlassCard className="p-3 sm:p-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium cursor-pointer"
            >
              <option value="all">All Statuses ({employees.length})</option>
              <option value="present">Present</option>
              <option value="late">Late Login</option>
              <option value="half-day">Half-day</option>
              <option value="absent">Absent</option>
              <option value="missing">Missing Punch-out</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* ── TEAM ATTENDANCE MATRIX TABLE ────────────────────── */}
      <GlassCard className="p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                <th className="py-2.5 px-2 font-semibold">Employee</th>
                <th className="py-2.5 px-2 font-semibold">Department</th>
                <th className="py-2.5 px-2 font-semibold">Login Time</th>
                <th className="py-2.5 px-2 font-semibold">Logout Time</th>
                <th className="py-2.5 px-2 font-semibold">Active Hrs</th>
                <th className="py-2.5 px-2 font-semibold">Idle Hrs</th>
                <th className="py-2.5 px-2 font-semibold">Attendance Status</th>
                <th className="py-2.5 px-2 font-semibold">Overtime</th>
                <th className="py-2.5 px-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
              {filteredEmployees.map((emp, idx) => {
                const activeHrs = (emp.activeSeconds / 3600).toFixed(1) + 'h';
                const idleHrs = (emp.idleSeconds / 60).toFixed(0) + 'm';
                const isMissingOut = emp.loginTime !== '--' && (!emp.logoutTime || emp.logoutTime === '--');
                const overtime = emp.activeSeconds > 28800 ? `${((emp.activeSeconds - 28800) / 3600).toFixed(1)}h` : '--';

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors ${
                      idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                    }`}
                  >
                    {/* Employee avatar & name */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar id={emp.id} name={emp.name} size="sm" status={emp.status} />
                        <div>
                          <div className="text-[13px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-mono">
                            {emp.employeeId} · {emp.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 px-2">
                      <span className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                        {emp.department}
                      </span>
                    </td>

                    {/* Login Time */}
                    <td className="py-2.5 px-2 font-mono text-xs text-[#0F172A] dark:text-white font-medium">
                      {emp.loginTime}
                    </td>

                    {/* Logout Time / Warning */}
                    <td className="py-2.5 px-2">
                      {isMissingOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <AlertTriangle size={11} />
                          Missing Out
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-[#475569] dark:text-[#94A3B8]">
                          {emp.logoutTime || '--'}
                        </span>
                      )}
                    </td>

                    {/* Active Hrs */}
                    <td className="py-2.5 px-2 font-mono text-xs text-[#288F3D] font-semibold">
                      {emp.activeSeconds > 0 ? activeHrs : '--'}
                    </td>

                    {/* Idle Hrs */}
                    <td className="py-2.5 px-2 font-mono text-xs text-[#F3740F]">
                      {emp.idleSeconds > 0 ? idleHrs : '--'}
                    </td>

                    {/* Status Chip */}
                    <td className="py-2.5 px-2">
                      {getAttendanceStatusChip(emp.attendanceStatus)}
                    </td>

                    {/* Overtime */}
                    <td className="py-2.5 px-2 font-mono text-xs text-[#158AF4] font-medium">
                      {overtime}
                    </td>

                    {/* Adjust Action Button */}
                    <td className="py-2.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAdjustModal(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-control text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/90 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                        title="Adjust employee timesheet"
                      >
                        <Edit3 size={12} className="text-[#158AF4]" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ── MANUAL ADJUSTMENT MODAL ─────────────────────────── */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Attendance Record: ${adjustingEmployee?.name || ''}`}
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
            Modifying attendance for <strong>{adjustingEmployee?.name}</strong> ({adjustingEmployee?.employeeId} · {adjustingEmployee?.department}).
            All adjustments are logged with timestamp and admin identity.
          </div>

          {adjustReasonError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{adjustReasonError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Login Time
              </label>
              <input
                type="text"
                value={adjustLoginTime}
                onChange={(e) => setAdjustLoginTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Logout Time
              </label>
              <input
                type="text"
                value={adjustLogoutTime}
                onChange={(e) => setAdjustLogoutTime(e.target.value)}
                placeholder="06:00 PM"
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
              Attendance Status
            </label>
            <select
              value={adjustStatus}
              onChange={(e) => setAdjustStatus(e.target.value as Employee['attendanceStatus'])}
              className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-medium"
            >
              <option value="present">Present (Standard Shift)</option>
              <option value="late">Late Login (Grace Exceeded)</option>
              <option value="half-day">Half-day (Approved)</option>
              <option value="absent">Absent / Loss of Pay</option>
              <option value="overtime">Overtime Shift</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
              Adjustment Justification Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={adjustReason}
              onChange={(e) => {
                setAdjustReason(e.target.value);
                if (adjustReasonError) setAdjustReasonError('');
              }}
              required
              rows={3}
              placeholder="e.g. Biometric machine sync lag at Door #4 / Approved client on-site visit..."
              className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none placeholder-[#94A3B8]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-yellow px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
            >
              Save Attendance Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAttendanceCenter;
