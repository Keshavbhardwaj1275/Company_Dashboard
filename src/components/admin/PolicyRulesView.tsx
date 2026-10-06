import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  UserCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { IdleException } from '../../types';

export const PolicyRulesView: React.FC = () => {
  const { 
    policies, 
    updatePolicies, 
    resetPoliciesToDefault, 
    idleExceptions,
    approveIdleException,
    rejectIdleException,
    addToast 
  } = useApp();

  // Local form state
  const [minHours, setMinHours] = useState<string | number>(policies.minimumWorkingHours);
  const [allowedIdle, setAllowedIdle] = useState<string | number>(policies.allowedIdleMinutes);
  const [idleThreshold, setIdleThreshold] = useState<number>(policies.idleThresholdMinutes);
  const [gracePeriod, setGracePeriod] = useState<number>(policies.gracePeriodMinutes);
  const [shiftStart, setShiftStart] = useState<string>(policies.shiftStart || '09:00 AM');
  const [shiftEnd, setShiftEnd] = useState<string>(policies.shiftEnd || '06:00 PM');

  // Button state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modal state for idle exception approvals
  const [activeException, setActiveException] = useState<IdleException | null>(null);
  const [approvalComment, setApprovalComment] = useState('Approved per offline client collaboration');
  const [adjustedMinutes, setAdjustedMinutes] = useState(45);

  // Sync form state when saved policies change externally
  useEffect(() => {
    setMinHours(policies.minimumWorkingHours);
    setAllowedIdle(policies.allowedIdleMinutes);
    setIdleThreshold(policies.idleThresholdMinutes);
    setGracePeriod(policies.gracePeriodMinutes);
    setShiftStart(policies.shiftStart || '09:00 AM');
    setShiftEnd(policies.shiftEnd || '06:00 PM');
  }, [policies]);

  // Validation logic
  const shiftHoursNum = Number(minHours);
  const allowedIdleNum = Number(allowedIdle);

  const shiftHoursError = useMemo(() => {
    if (minHours === '' || isNaN(shiftHoursNum)) return 'Shift duration must be a valid number.';
    if (shiftHoursNum < 1 || shiftHoursNum > 24) return 'Daily shift duration must be between 1 and 24 hours.';
    return null;
  }, [minHours, shiftHoursNum]);

  const allowedIdleError = useMemo(() => {
    if (allowedIdle === '' || isNaN(allowedIdleNum)) return 'Allowed idle duration must be a valid number.';
    if (allowedIdleNum < 0 || allowedIdleNum > 720) return 'Allowed idle duration must be between 0 and 720 minutes.';
    return null;
  }, [allowedIdle, allowedIdleNum]);

  const isValid = !shiftHoursError && !allowedIdleError;

  // Policy dependency warning
  const dependencyWarning = useMemo(() => {
    if (isValid && idleThreshold > allowedIdleNum && allowedIdleNum > 0) {
      return `Idle detection trigger (${idleThreshold}m) is greater than the daily allowed idle duration (${allowedIdleNum}m).`;
    }
    return null;
  }, [isValid, idleThreshold, allowedIdleNum]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      shiftHoursNum !== policies.minimumWorkingHours ||
      allowedIdleNum !== policies.allowedIdleMinutes ||
      idleThreshold !== policies.idleThresholdMinutes ||
      gracePeriod !== policies.gracePeriodMinutes ||
      shiftStart !== policies.shiftStart ||
      shiftEnd !== policies.shiftEnd
    );
  }, [shiftHoursNum, allowedIdleNum, idleThreshold, gracePeriod, shiftStart, shiftEnd, policies]);

  // Handle Save Rules
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid) {
      addToast('Validation Error', 'Please correct the invalid policy fields before saving.', 'error');
      return;
    }

    setIsSaving(true);
    // Smooth transition feedback
    await new Promise((resolve) => setTimeout(resolve, 350));

    updatePolicies({
      minimumWorkingHours: shiftHoursNum,
      allowedIdleMinutes: allowedIdleNum,
      idleThresholdMinutes: idleThreshold,
      gracePeriodMinutes: gracePeriod,
      shiftStart,
      shiftEnd,
    });

    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Handle Reset to Defaults
  const handleResetDefaults = () => {
    resetPoliciesToDefault();
    setMinHours(8.5);
    setAllowedIdle(45);
    setIdleThreshold(5);
    setGracePeriod(15);
    setShiftStart('09:00 AM');
    setShiftEnd('06:00 PM');
    setIsSaved(false);
  };

  const handleOpenApprovalModal = (exc: IdleException) => {
    setActiveException(exc);
    setApprovalComment(`Approved for ${exc.employeeName} (${exc.reason})`);
    setAdjustedMinutes(exc.durationMinutes);
  };

  const handleConfirmApproval = () => {
    if (!activeException) return;
    approveIdleException(activeException.id, approvalComment, adjustedMinutes);
    setActiveException(null);
  };

  return (
    <div className="space-y-4 max-w-[1540px] mx-auto pb-4">
      {/* Header with Aligned Save & Reset Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Enterprise Policies & Idle Thresholds
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Configure automated calculations, idle detection timers, and attendance deduction policies
          </p>
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            id="btn-reset-policy-defaults"
            onClick={handleResetDefaults}
            className="glass-control h-10 px-4 rounded-xl text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            title="Restore default enterprise thresholds (8.5h shift, 45m idle, 5m trigger, 15m grace)"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            id="btn-save-policy-rules"
            disabled={!isValid || isSaving}
            onClick={() => handleSave()}
            className="btn-yellow h-10 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Save and synchronize policy rules across the enterprise workspace"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin text-slate-900" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 size={15} className="text-slate-900" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Rules</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Split Layout: Calculation Parameters (Left 8) + Formula Specification (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 8 Cols (~70%): Parameters Form */}
        <div className="lg:col-span-8 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[#158AF4]" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                    Automated Calculation Parameters
                  </h3>
                </div>

                {hasUnsavedChanges && (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Unsaved changes</span>
                  </span>
                )}
              </div>

              {/* 2-Column Responsive Grid for Core 4 Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Control 1: Standard Daily Shift (Hours) */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Standard Daily Shift (Hours)
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1.5 leading-tight">
                    Minimum active hours required per shift
                  </p>
                  <input
                    type="number"
                    id="input-shift-hours"
                    step="0.5"
                    min="1"
                    max="24"
                    value={minHours}
                    onChange={(e) => setMinHours(e.target.value)}
                    className={`w-full h-10 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono transition-colors ${
                      shiftHoursError ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20' : ''
                    }`}
                  />
                  {shiftHoursError ? (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{shiftHoursError}</span>
                    </span>
                  ) : (
                    <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                      Configured standard: {shiftHoursNum}h productive time
                    </span>
                  )}
                </div>

                {/* Control 2: Allowed Idle Duration (Mins / Day) */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Allowed Idle Duration (Mins / Day)
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1.5 leading-tight">
                    Permitted idle allowance before payroll/attendance deduction
                  </p>
                  <input
                    type="number"
                    id="input-allowed-idle"
                    step="5"
                    min="0"
                    max="720"
                    value={allowedIdle}
                    onChange={(e) => setAllowedIdle(e.target.value)}
                    className={`w-full h-10 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono transition-colors ${
                      allowedIdleError ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20' : ''
                    }`}
                  />
                  {allowedIdleError ? (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{allowedIdleError}</span>
                    </span>
                  ) : (
                    <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                      Max permitted: {allowedIdleNum} mins/day before LOP deduction
                    </span>
                  )}
                </div>

                {/* Control 3: Idle Inactivity Detection Trigger */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Idle Inactivity Detection Trigger
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1.5 leading-tight">
                    Inactivity window before auto-pausing productive timer
                  </p>
                  <select
                    id="select-idle-trigger"
                    value={idleThreshold}
                    onChange={(e) => setIdleThreshold(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium transition-colors cursor-pointer"
                  >
                    <option value={1}>1 Minute (Ultra Strict)</option>
                    <option value={3}>3 Minutes (Strict Monitoring)</option>
                    <option value={5}>5 Minutes (Enterprise Standard)</option>
                    <option value={10}>10 Minutes (Flexible / Remote)</option>
                    <option value={15}>15 Minutes (Extended Window)</option>
                    <option value={30}>30 Minutes (Relaxed)</option>
                  </select>
                  <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                    Productive timer pauses after {idleThreshold}m of continuous inactivity
                  </span>
                </div>

                {/* Control 4: Morning Check-in Grace Period */}
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-0.5">
                    Morning Check-in Grace Period
                  </label>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1.5 leading-tight">
                    Grace window after shift start (09:00 AM) before marked Late
                  </p>
                  <select
                    id="select-grace-period"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium transition-colors cursor-pointer"
                  >
                    <option value={5}>5 Minutes (Strict)</option>
                    <option value={10}>10 Minutes (Moderate)</option>
                    <option value={15}>15 Minutes (Standard Grace)</option>
                    <option value={20}>20 Minutes (Extended)</option>
                    <option value={30}>30 Minutes (Generous)</option>
                  </select>
                  <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                    Logins after 09:{gracePeriod < 10 ? '0' + gracePeriod : gracePeriod} AM classified as Late
                  </span>
                </div>
              </div>

              {/* Shift Schedule Window Row */}
              <div className="pt-3 border-t border-black/5 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] dark:text-white">
                      Shift Schedule Window
                    </label>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Default enterprise shift start & end timestamps
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className="w-28 h-9 px-2.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono text-center"
                    />
                    <span className="text-xs text-[#94A3B8] font-semibold">–</span>
                    <input
                      type="text"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className="w-28 h-9 px-2.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Dependency Warning */}
              {dependencyWarning && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/50 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0 text-amber-500" />
                  <span>{dependencyWarning}</span>
                </div>
              )}
            </form>

            <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>Changes take effect immediately across all workspace sessions and reports.</span>
              <span className="font-mono">Policy ID: POL-2026-V2</span>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols (~30%): Formula Specification Card */}
        <div className="lg:col-span-4 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/10">
                <ShieldCheck size={16} className="text-[#288F3D]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Formula Specification
                </h3>
              </div>

              {/* High-Contrast Readable Formula Box */}
              <div className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-mono text-[#0F172A] dark:text-white leading-relaxed font-bold">
                Total Login - Idle - Break = Productive Hours
              </div>

              {/* Dynamic Explanations */}
              <div className="space-y-2.5 text-xs text-[#475569] dark:text-[#94A3B8]">
                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                  <strong className="text-[#0F172A] dark:text-white block mb-0.5">
                    • Shift Expectation
                  </strong>
                  <p className="text-[11.5px] leading-relaxed">
                    Standard daily shift requires <strong>{shiftHoursNum}</strong> productive active hours.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                  <strong className="text-[#0F172A] dark:text-white block mb-0.5">
                    • Idle Pausing Trigger
                  </strong>
                  <p className="text-[11.5px] leading-relaxed">
                    Productive timer pauses automatically when continuous inactivity reaches <strong>{idleThreshold} minutes</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                  <strong className="text-[#0F172A] dark:text-white block mb-0.5">
                    • Payroll & Inactivity Rule
                  </strong>
                  <p className="text-[11.5px] leading-relaxed">
                    Idle duration exceeding <strong>{allowedIdleNum} minutes/day</strong> triggers configured Loss of Pay (LOP) payroll deduction.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40">
                  <strong className="text-[#0F172A] dark:text-white block mb-0.5">
                    • Morning Grace Window
                  </strong>
                  <p className="text-[11.5px] leading-relaxed">
                    Logins within <strong>{gracePeriod} minutes</strong> of {shiftStart} (until 09:{gracePeriod < 10 ? '0' + gracePeriod : gracePeriod} AM) are marked On-Time.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/10 text-[10px] text-[#64748B] dark:text-[#94A3B8]">
              * Standardized enterprise calculation engine
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Section: Admin Idle Exception Management & Adjustments */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-[#8B5CF6]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                Idle Exceptions & Manual Adjustments ({idleExceptions.length} Requests)
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Review flagged inactivity periods, approve offline client meetings, and adjust productive times
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF] self-start sm:self-auto">
            Admin Audit Mode
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                <th className="py-2.5 px-3 font-semibold">Employee</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Flagged Inactivity</th>
                <th className="py-2.5 px-3 font-semibold">Stated Reason</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
              {idleExceptions.map((exc, idx) => (
                <tr
                  key={exc.id}
                  className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors ${
                    idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#0F172A] dark:text-white">{exc.employeeName}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">{exc.employeeId}</div>
                  </td>
                  <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8] font-medium">{exc.department}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#F3740F]">{exc.durationMinutes} mins</td>
                  <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8] max-w-xs">{exc.reason}</td>
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
                  <td className="py-2.5 px-3 text-right">
                    {exc.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenApprovalModal(exc)}
                          className="px-2.5 py-1 rounded-lg bg-[#BEF1CA] text-[#1F7A35] font-semibold hover:bg-emerald-200 text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectIdleException(exc.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#F7C9C6] text-[#B42318] font-semibold hover:bg-rose-200 text-[11px] flex items-center gap-1"
                        >
                          <XCircle size={12} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                        {exc.adminComment || 'Logged'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Exception Approval & Adjustment Modal */}
      <Modal
        isOpen={!!activeException}
        onClose={() => setActiveException(null)}
        title="Approve Idle Exception"
        subtitle={`Employee: ${activeException?.employeeName} (${activeException?.employeeId})`}
      >
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
              Flagged Inactivity Duration
            </label>
            <div className="font-mono font-semibold text-sm text-[#0F172A] dark:text-white">
              {activeException?.durationMinutes} Minutes (Date: {activeException?.date})
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Reason: "{activeException?.reason}"
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
              Credited / Adjusted Active Minutes
            </label>
            <input
              type="number"
              min="1"
              max={activeException?.durationMinutes || 120}
              value={adjustedMinutes}
              onChange={(e) => setAdjustedMinutes(Number(e.target.value))}
              className="w-full h-9 px-3 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono"
            />
            <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
              These minutes will be credited back to the employee's productive working hours.
            </span>
          </div>

          <div>
            <label className="block font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
              Admin Approval Note / Justification
            </label>
            <input
              type="text"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              className="w-full h-9 px-3 glass-control rounded-xl text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveException(null)}
              className="px-4 py-2 rounded-xl glass-control text-[#475569] hover:text-[#0F172A] font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmApproval}
              className="btn-yellow px-4 py-2 rounded-xl font-semibold"
            >
              Confirm Exception Approval
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

