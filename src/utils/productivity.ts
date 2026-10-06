// FlowSphere — Productivity & Attendance Calculation Utilities
// Formula: Total Login Hours - Idle Time - Break Time = Productive Hours

export interface SessionMetrics {
  activeSeconds: number;
  idleSeconds: number;
  breakSeconds: number;
  loginTime: string;
}

/**
 * Calculates net productive seconds based on total tracked active seconds, idle, and breaks
 */
export const calculateProductiveSeconds = (
  activeSeconds: number,
  idleSeconds: number,
  breakSeconds: number
): number => {
  // If activeSeconds is total elapsed session time:
  const productive = Math.max(0, activeSeconds - idleSeconds - breakSeconds);
  return productive;
};

/**
 * Calculates productivity percentage score (0 - 100)
 */
export const calculateProductivityScore = (
  activeSeconds: number,
  idleSeconds: number,
  breakSeconds: number
): number => {
  const totalTracked = activeSeconds + idleSeconds + breakSeconds;
  if (totalTracked === 0) return 0;
  
  // Net productive ratio
  const ratio = (activeSeconds / (activeSeconds + idleSeconds + (breakSeconds * 0.5))) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
};

/**
 * Formats seconds into HH:MM:SS
 */
export const formatSecondsToHMS = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Formats seconds into "07h 45m" style
 */
export const formatSecondsToHoursMins = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
};

/**
 * Formats minutes into "45m" or "1h 15m"
 */
export const formatMinutesToDisplay = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`;
};

/**
 * Calculates Simulated Payroll Impact from Excess Idle Duration
 */
export const calculatePayrollImpact = (
  actualIdleMinutes: number,
  allowedIdleMinutes: number = 45,
  hourlyRate: number = 38.5
) => {
  const excessIdleMinutes = Math.max(0, actualIdleMinutes - allowedIdleMinutes);
  const lossOfPay = (excessIdleMinutes / 60) * hourlyRate;
  const isDeductionApplied = excessIdleMinutes > 0;

  return {
    actualIdleMinutes,
    allowedIdleMinutes,
    excessIdleMinutes,
    lossOfPay: Number(lossOfPay.toFixed(2)),
    isDeductionApplied,
    status: isDeductionApplied ? 'Deduction Pending' : 'Full Pay Approved',
  };
};

/**
 * Calculates Overtime Hours and Payout
 */
export const calculateOvertime = (
  activeSeconds: number,
  standardWorkingHours: number = 8.5,
  hourlyRate: number = 38.5
) => {
  const activeHours = activeSeconds / 3600;
  const overtimeHours = Math.max(0, activeHours - standardWorkingHours);
  const overtimePayout = overtimeHours * hourlyRate * 1.5; // 1.5x multiplier

  return {
    activeHours: Number(activeHours.toFixed(2)),
    overtimeHours: Number(overtimeHours.toFixed(2)),
    overtimePayout: Number(overtimePayout.toFixed(2)),
  };
};
