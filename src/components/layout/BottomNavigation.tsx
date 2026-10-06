import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Shield, 
  Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { role, activeTab, setActiveTab } = useApp();

  const employeeTabs: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { tab: 'workflow', label: 'Workflow', icon: <CheckSquare size={18} /> },
    { tab: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
    { tab: 'productivity', label: 'Productivity', icon: <TrendingUp size={18} /> },
    { tab: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  ];

  const adminTabs: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'admin-overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { tab: 'admin-monitoring', label: 'Live Monitor', icon: <Shield size={18} /> },
    { tab: 'admin-workflow', label: 'Workflow', icon: <CheckSquare size={18} /> },
    { tab: 'admin-analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
    { tab: 'admin-attendance', label: 'Attendance', icon: <Calendar size={18} /> },
    { tab: 'admin-policies', label: 'Policies', icon: <Sliders size={18} /> },
  ];

  const tabs = role === 'admin' ? adminTabs : employeeTabs;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-white/60 dark:border-white/10 px-2 py-1.5 flex items-center justify-around shadow-lg select-none"
    >
      {tabs.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-xl transition-all duration-200 outline-none ${
              isActive
                ? 'bg-[#111827] text-[#FFE956] dark:bg-white dark:text-[#111827] font-medium shadow-sm'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center">{item.icon}</span>
            <span className="text-[10px] leading-tight tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
