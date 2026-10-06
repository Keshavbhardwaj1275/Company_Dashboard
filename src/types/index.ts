export type Role = 'employee' | 'admin';

export type UserStatus = 'active' | 'idle' | 'break' | 'offline';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  loginId?: string;
  password?: string;
  avatar: string;
  department: 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'HR' | 'Finance' | 'Operations';
  firstTimeCompleted?: boolean;
  role: string;
  systemRole: Role;
  seedRole: Role;
  status: UserStatus;
  loginTime: string;
  logoutTime?: string;
  activeSeconds: number;
  idleSeconds: number;
  breakSeconds: number;
  productivityScore: number;
  attendanceStatus: 'present' | 'late' | 'half-day' | 'absent' | 'overtime';
  lastActivity: string;
  keyboardActivity: 'High' | 'Moderate' | 'Low' | 'Inactive';
  mouseActivity: 'Active' | 'Moderate' | 'Low' | 'Inactive';
  currentTask: string;
  location: string;
}

export interface WorkSession {
  isActive: boolean;
  isPaused: boolean;
  isOnBreak: boolean;
  isSimulatedIdle: boolean;
  loginTime: string;
  logoutTime?: string;
  activeSeconds: number;
  idleSeconds: number;
  breakSeconds: number;
  systemLockSeconds: number;
  screenInactivitySeconds: number;
  keyboardActivity: 'High' | 'Moderate' | 'Low' | 'Inactive';
  mouseActivity: 'Active' | 'Moderate' | 'Low' | 'Inactive';
  lastHeartbeat: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'pending_approval' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkflowTask {
  id: string;
  title: string;
  project: string;
  department: string;
  assignedTo: string;
  assignedToName: string;
  assignedToAvatar: string;
  assignedBy?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  spentHours: number;
  progress: number;
  timeSlot?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface AttendanceDay {
  date: string;
  dayName: string;
  status: 'present' | 'late' | 'half-day' | 'absent' | 'holiday' | 'weekend';
  loginTime: string;
  logoutTime: string;
  activeHours: string;
  idleHours: string;
  breakHours: string;
  overtimeHours: string;
  earlyLogout?: string;
  productivityPercentage: number;
  excessIdleMinutes?: number;
  deductionStatus?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success' | 'announcement';
  timestamp: string;
  read: boolean;
  category: 'attendance' | 'idle' | 'productivity' | 'system' | 'security';
}

export interface PolicyConfig {
  minimumWorkingHours: number; // e.g. 8.5
  allowedIdleMinutes: number; // e.g. 45
  idleThresholdMinutes: number; // e.g. 3, 5, 10
  gracePeriodMinutes: number; // e.g. 15
  shiftStart: string; // e.g. "09:00 AM"
  shiftEnd: string; // e.g. "06:00 PM"
  autoTrackOnLogin: boolean;
  enableScreenshotSimulation: boolean;
  enableActivityAlerts: boolean;
  idlePenaltyEnabled: boolean;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile' | 'tablet';
}

export interface IdleException {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  reason: string;
  status: 'approved' | 'rejected' | 'pending';
  adminComment?: string;
  adjustedMinutes?: number;
  requestedAt?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'workflow'
  | 'attendance'
  | 'productivity'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'admin-overview'
  | 'admin-monitoring'
  | 'admin-workflow'
  | 'admin-analytics'
  | 'admin-attendance'
  | 'admin-policies';
