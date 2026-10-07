import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  Employee, 
  WorkflowTask, 
  NotificationItem, 
  PolicyConfig, 
  Role, 
  ActiveTab, 
  WorkSession,
  TaskStatus,
  DeviceSession,
  IdleException
} from '../types';
import { 
  initialEmployees, 
  initialWorkflowTasks, 
  mockNotifications, 
  initialPolicyConfig,
  initialDeviceSessions,
  initialIdleExceptions
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  tasks: WorkflowTask[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (task: Omit<WorkflowTask, 'id'>) => void;
  approveTask: (taskId: string, adminName: string) => void;
  rejectTask: (taskId: string, adminName: string, reason: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationCount: number;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  policies: PolicyConfig;
  updatePolicies: (newConfig: Partial<PolicyConfig>) => void;
  resetPoliciesToDefault: () => void;
  workSession: WorkSession;
  startWorkSession: () => void;
  stopWorkSession: () => void;
  toggleBreakSession: () => void;
  toggleSimulateIdle: () => void;
  deviceSessions: DeviceSession[];
  revokeSession: (id: string) => void;
  revokeAllOtherSessions: () => void;
  idleExceptions: IdleException[];
  requestIdleException: (input: { date: string; startTime: string; endTime: string; reason: string; durationMinutes?: number }) => void;
  approveIdleException: (id: string, comment?: string, adjustedMinutes?: number) => void;
  rejectIdleException: (id: string, comment?: string) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loginAttempts: number;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  isLockedOut: boolean;
  lockoutSeconds: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to create employee-specific work session
const createSessionFromEmployee = (emp: Employee): WorkSession => ({
  isActive: emp.status !== 'offline',
  isPaused: emp.status === 'idle',
  isOnBreak: emp.status === 'break',
  isSimulatedIdle: false,
  loginTime: emp.loginTime || '09:00 AM',
  logoutTime: emp.logoutTime || '--',
  activeSeconds: emp.activeSeconds || 21600,
  idleSeconds: emp.idleSeconds || 1200,
  breakSeconds: emp.breakSeconds || 1800,
  systemLockSeconds: 0,
  screenInactivitySeconds: 0,
  keyboardActivity: emp.keyboardActivity || 'High',
  mouseActivity: emp.mouseActivity || 'Active',
  lastHeartbeat: new Date(),
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('flowsphere-employees-dataset');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialEmployees;
  });

  const [currentUser, setCurrentUserState] = useState<Employee>(() => {
    try {
      const savedEmpId = localStorage.getItem('flowsphere-auth-emp-id');
      const isAuth = localStorage.getItem('flowsphere-is-authenticated') === 'true';
      if (isAuth && savedEmpId) {
        const match = initialEmployees.find(
          (e) => e.employeeId.toLowerCase() === savedEmpId.toLowerCase() || e.id === savedEmpId
        );
        if (match) return match;
      }
    } catch (e) {
      console.error(e);
    }
    return initialEmployees[0];
  });

  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flowsphere-is-authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [role, setRoleState] = useState<Role>(() => {
    try {
      const savedEmpId = localStorage.getItem('flowsphere-auth-emp-id');
      if (savedEmpId) {
        const match = initialEmployees.find(
          (e) => e.employeeId.toLowerCase() === savedEmpId.toLowerCase() || e.id === savedEmpId
        );
        if (match) return match.systemRole || match.seedRole || 'employee';
      }
    } catch (e) {
      console.error(e);
    }
    return 'employee';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tasks, setTasks] = useState<WorkflowTask[]>(initialWorkflowTasks);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [policies, setPolicies] = useState<PolicyConfig>(() => {
    try {
      const saved = localStorage.getItem('flowsphere-policy-settings');
      if (saved) {
        return { ...initialPolicyConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load saved policies from localStorage:', e);
    }
    return initialPolicyConfig;
  });
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>(initialDeviceSessions);
  const [idleExceptions, setIdleExceptions] = useState<IdleException[]>(initialIdleExceptions);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Login attempt restrictions state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Live session timer state initialized per authenticated user
  const [workSession, setWorkSession] = useState<WorkSession>(() => {
    try {
      const savedEmpId = localStorage.getItem('flowsphere-auth-emp-id');
      if (savedEmpId) {
        const match = initialEmployees.find(
          (e) => e.employeeId.toLowerCase() === savedEmpId.toLowerCase() || e.id === savedEmpId
        );
        if (match) return createSessionFromEmployee(match);
      }
    } catch (e) {
      console.error(e);
    }
    return createSessionFromEmployee(initialEmployees[0]);
  });

  const lastActivityTimestamp = useRef<number>(Date.now());

  // Dynamic setCurrentUser that updates session and persists user identity
  const setCurrentUser = (emp: Employee) => {
    setCurrentUserState(emp);
    try {
      localStorage.setItem('flowsphere-auth-emp-id', emp.employeeId);
    } catch (e) {
      console.error(e);
    }
    setWorkSession(createSessionFromEmployee(emp));
  };

  // Dynamic setIsAuthenticated that manages local storage
  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
    try {
      if (auth) {
        localStorage.setItem('flowsphere-is-authenticated', 'true');
      } else {
        localStorage.removeItem('flowsphere-is-authenticated');
        localStorage.removeItem('flowsphere-auth-emp-id');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Clean setRole that adjusts navigation without overwriting the authenticated currentUser
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      if (activeTab === 'dashboard') {
        setActiveTab('admin-overview');
      }
    } else {
      if (activeTab.startsWith('admin-')) {
        setActiveTab('dashboard');
      }
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    (window as any).__FLOWSPHERE__ = {
      setActiveTab,
      setRole,
      setTheme,
    };
  }, [activeTab, role, theme]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLockedOut || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSeconds]);

  const incrementLoginAttempts = () => {
    setLoginAttempts((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(30);
        addToast('Security Lockout', 'Maximum failed attempts reached. Account locked for 30 seconds.', 'error');
      }
      return next;
    });
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
    setIsLockedOut(false);
    setLockoutSeconds(0);
  };

  // Real-time browser user activity listener
  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityTimestamp.current = Date.now();
      setWorkSession((prev) => {
        if (prev.isSimulatedIdle) {
          return prev; // keep simulated idle until explicitly toggled
        }
        if (prev.screenInactivitySeconds > 0) {
          return {
            ...prev,
            screenInactivitySeconds: 0,
            keyboardActivity: Math.random() > 0.4 ? 'High' : 'Moderate',
            mouseActivity: 'Active',
          };
        }
        return prev;
      });
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    document.addEventListener('visibilitychange', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('visibilitychange', handleUserActivity);
    };
  }, []);

  // Live real-time clock tick for active session
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkSession((prev) => {
        if (!prev.isActive || prev.isPaused) return prev;

        const idleThresholdSec = policies.idleThresholdMinutes * 60;
        const secondsSinceLastInteraction = Math.floor((Date.now() - lastActivityTimestamp.current) / 1000);

        if (prev.isOnBreak) {
          return {
            ...prev,
            breakSeconds: prev.breakSeconds + 1,
            keyboardActivity: 'Inactive',
            mouseActivity: 'Inactive',
          };
        } else if (prev.isSimulatedIdle || secondsSinceLastInteraction > idleThresholdSec) {
          return {
            ...prev,
            idleSeconds: prev.idleSeconds + 1,
            screenInactivitySeconds: prev.screenInactivitySeconds + 1,
            keyboardActivity: 'Inactive',
            mouseActivity: 'Inactive',
          };
        } else {
          return {
            ...prev,
            activeSeconds: prev.activeSeconds + 1,
            screenInactivitySeconds: 0,
            keyboardActivity: Math.random() > 0.35 ? 'High' : 'Moderate',
            mouseActivity: 'Active',
            lastHeartbeat: new Date(),
          };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [policies.idleThresholdMinutes]);

  const startWorkSession = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkSession((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
      isOnBreak: false,
      isSimulatedIdle: false,
      loginTime: prev.loginTime || timeString,
      logoutTime: '--',
    }));
    addNotification({
      title: 'Work Session Active',
      message: `Productive tracking started at ${timeString}. Core hours logging active.`,
      type: 'success',
      category: 'productivity',
    });
    addToast('Work Session Active', 'Productive tracking started automatically.', 'success');
  };

  const stopWorkSession = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkSession((prev) => ({
      ...prev,
      isActive: false,
      isPaused: true,
      logoutTime: timeString,
    }));
    addNotification({
      title: 'Work Session Paused',
      message: `Session paused at ${timeString}. Timesheet submitted for daily compliance.`,
      type: 'info',
      category: 'system',
    });
    addToast('Session Paused', 'Work session paused and logged.', 'info');
  };

  const toggleBreakSession = () => {
    setWorkSession((prev) => {
      const willBeOnBreak = !prev.isOnBreak;
      if (willBeOnBreak) {
        addNotification({
          title: 'Break Session Started',
          message: 'Productivity timer paused. Break duration is currently tracking.',
          type: 'info',
          category: 'system',
        });
        addToast('Break Started', 'Productivity tracking paused for break.', 'warning');
      } else {
        addToast('Break Resumed', 'Back to active work tracking.', 'success');
      }
      return {
        ...prev,
        isOnBreak: willBeOnBreak,
        isSimulatedIdle: false,
      };
    });
  };

  const toggleSimulateIdle = () => {
    setWorkSession((prev) => {
      const willBeIdle = !prev.isSimulatedIdle;
      if (willBeIdle) {
        addNotification({
          title: 'Inactivity Threshold Exceeded',
          message: `Screen inactivity detected (${policies.idleThresholdMinutes}m threshold). Productive timer auto-paused.`,
          type: 'warning',
          category: 'idle',
        });
        addToast('Idle Simulation Triggered', `Simulating ${policies.idleThresholdMinutes}min inactivity. Productive timer paused.`, 'warning');
      } else {
        lastActivityTimestamp.current = Date.now();
        addToast('Activity Resumed', 'Keyboard & mouse interaction detected. Tracking active.', 'success');
      }
      return {
        ...prev,
        isSimulatedIdle: willBeIdle,
        isOnBreak: false,
      };
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'completed' && role !== 'admin') {
      addToast('Not allowed', 'Only an admin can approve and complete tasks.', 'error');
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const progress =
            newStatus === 'completed'
              ? 100
              : newStatus === 'pending_approval'
              ? 90
              : newStatus === 'in_progress'
              ? 65
              : 0;
          return {
            ...t,
            status: newStatus,
            progress,
            submittedAt: newStatus === 'pending_approval' ? 'Just now' : t.submittedAt,
          };
        }
        return t;
      })
    );
    if (newStatus === 'pending_approval') {
      addNotification({
        title: 'Task Submitted for Review',
        message: 'Your sprint task has been submitted for admin approval.',
        type: 'info',
        category: 'productivity',
      });
      addToast('Submitted for Review', 'Sprint milestone sent to admin for approval.', 'info');
    } else {
      addToast('Task Status Updated', `Sprint milestone moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
    }
  };

  const approveTask = (taskId: string, adminName: string) => {
    if (role !== 'admin') {
      addToast('Not allowed', 'Only an admin can approve tasks.', 'error');
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed' as TaskStatus,
              progress: 100,
              reviewedAt: 'Just now',
              reviewedBy: adminName,
              rejectionReason: undefined,
            }
          : t
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      addNotification({
        title: 'Task Approved',
        message: `Your task "${task.title}" was approved by ${adminName}.`,
        type: 'success',
        category: 'productivity',
      });
      addToast('Task Approved', `"${task.title}" was approved by ${adminName}.`, 'success');
    }
  };

  const rejectTask = (taskId: string, adminName: string, reason: string) => {
    if (role !== 'admin') {
      addToast('Not allowed', 'Only an admin can reject tasks.', 'error');
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'in_progress' as TaskStatus,
              reviewedAt: 'Just now',
              reviewedBy: adminName,
              rejectionReason: reason,
              progress: 60,
            }
          : t
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      addNotification({
        title: 'Task Revision Required',
        message: `Your task "${task.title}" was sent back: ${reason}`,
        type: 'warning',
        category: 'productivity',
      });
      addToast('Task Revision Requested', `"${task.title}" sent back for revision: ${reason}`, 'warning');
    }
  };

  const addTask = (taskData: Omit<WorkflowTask, 'id'>) => {
    const newTask: WorkflowTask = {
      ...taskData,
      id: 'task-' + (tasks.length + 1),
    };
    setTasks((prev) => [newTask, ...prev]);
    addNotification({
      title: 'New Workflow Task Created',
      message: `"${taskData.title}" added to sprint backlog for ${taskData.department}.`,
      type: 'info',
      category: 'system',
    });
    addToast('Workflow Item Added', `"${taskData.title}" added to sprint board.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Notifications Cleared', 'All alerts marked as read.', 'info');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const updatePolicies = (newConfig: Partial<PolicyConfig>) => {
    setPolicies((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('flowsphere-policy-settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save policies to localStorage:', e);
      }
      return updated;
    });
    addNotification({
      title: 'Policy Configuration Updated',
      message: 'Admin updated enterprise tracking thresholds & shift parameters.',
      type: 'announcement',
      category: 'system',
    });
    addToast('Policy Rules Saved', 'Updated enterprise tracking parameters and attendance rules.', 'success');
  };

  const resetPoliciesToDefault = () => {
    setPolicies(initialPolicyConfig);
    try {
      localStorage.setItem('flowsphere-policy-settings', JSON.stringify(initialPolicyConfig));
    } catch (e) {
      console.error('Failed to reset policies in localStorage:', e);
    }
    addToast('Defaults Restored', 'Restored standard enterprise policy parameters.', 'info');
  };

  const revokeSession = (id: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== id));
    addToast('Session Revoked', 'Device disconnected from active access.', 'info');
  };

  const revokeAllOtherSessions = () => {
    setDeviceSessions((prev) => prev.filter((s) => s.isCurrent));
    addToast('All Other Sessions Revoked', 'Successfully signed out from all other devices.', 'success');
  };

  const requestIdleException = (input: { 
    date: string; 
    startTime: string; 
    endTime: string; 
    reason: string; 
    durationMinutes?: number;
  }) => {
    let duration = input.durationMinutes || 0;
    if (!duration && input.startTime && input.endTime) {
      const [sh, sm] = input.startTime.split(':').map(Number);
      const [eh, em] = input.endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        duration = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
      }
    }
    if (!duration) duration = 30;

    const newException: IdleException = {
      id: `exc-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      durationMinutes: duration,
      ...input,
    };

    setIdleExceptions((prev) => [newException, ...prev]);
    addNotification({
      title: 'Idle Exception Submitted',
      message: `Exception request for ${input.date} (${duration} mins) submitted for admin review.`,
      type: 'info',
      category: 'system',
    });
    addToast('Exception Requested', 'Your idle exception request was sent to admin for review.', 'info');
  };

  const approveIdleException = (id: string, comment?: string, adjustedMinutes?: number) => {
    setIdleExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'approved',
              adminComment: comment || 'Approved by Admin',
              adjustedMinutes: adjustedMinutes || e.durationMinutes,
            }
          : e
      )
    );
    addToast('Idle Exception Approved', 'Inactivity duration marked as approved offline work.', 'success');
  };

  const rejectIdleException = (id: string, comment?: string) => {
    setIdleExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'rejected',
              adminComment: comment || 'Rejected per policy guidelines',
            }
          : e
      )
    );
    addToast('Idle Exception Rejected', 'Inactivity logged as unapproved idle time.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        employees,
        setEmployees,
        tasks,
        updateTaskStatus,
        addTask,
        approveTask,
        rejectTask,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotificationCount,
        addNotification,
        policies,
        updatePolicies,
        resetPoliciesToDefault,
        workSession,
        startWorkSession,
        stopWorkSession,
        toggleBreakSession,
        toggleSimulateIdle,
        deviceSessions,
        revokeSession,
        revokeAllOtherSessions,
        idleExceptions,
        requestIdleException,
        approveIdleException,
        rejectIdleException,
        selectedEmployee,
        setSelectedEmployee,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        theme,
        setTheme,
        toasts,
        addToast,
        removeToast,
        isAuthenticated,
        setIsAuthenticated,
        loginAttempts,
        incrementLoginAttempts,
        resetLoginAttempts,
        isLockedOut,
        lockoutSeconds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
