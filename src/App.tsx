import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { AuthView } from './components/auth/AuthView';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { WorkflowBoard } from './components/workflow/WorkflowBoard';
import { AttendanceCenter } from './components/attendance/AttendanceCenter';
import { ProductivityDeepDive } from './components/analytics/ProductivityDeepDive';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LiveEmployeeMonitor } from './components/admin/LiveEmployeeMonitor';
import { AdminWorkflowCenter } from './components/admin/AdminWorkflowCenter';
import { DepartmentAnalytics } from './components/admin/DepartmentAnalytics';
import { AdminAttendanceCenter } from './components/admin/AdminAttendanceCenter';
import { PolicyRulesView } from './components/admin/PolicyRulesView';

export const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EmployeeDashboard />;
      case 'workflow':
        return <WorkflowBoard />;
      case 'attendance':
        return <AttendanceCenter />;
      case 'productivity':
        return <ProductivityDeepDive />;
      case 'reports':
        return <ReportsCenter />;
      case 'notifications':
        return <NotificationsCenter />;
      case 'settings':
        return <SettingsView />;
      case 'admin-overview':
        return <AdminDashboard />;
      case 'admin-monitoring':
        return <LiveEmployeeMonitor />;
      case 'admin-workflow':
        return <AdminWorkflowCenter />;
      case 'admin-analytics':
        return <DepartmentAnalytics />;
      case 'admin-attendance':
        return <AdminAttendanceCenter />;
      case 'admin-policies':
        return <PolicyRulesView />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <AppShell>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full"
      >
        {renderActiveView()}
      </motion.div>
    </AppShell>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
