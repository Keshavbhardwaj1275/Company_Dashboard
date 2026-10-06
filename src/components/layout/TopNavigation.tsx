import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Shield, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { CircleIconButton } from '../common/CircleIconButton';
import { UserAvatar } from '../common/UserAvatar';

export const TopNavigation: React.FC = () => {
  const {
    role,
    currentUser,
    activeTab,
    setActiveTab,
    tasks,
    unreadNotificationCount,
    setIsCommandPaletteOpen,
    theme,
    setTheme,
    setIsAuthenticated,
    addToast
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pendingApprovalsCount = tasks.filter((t) => t.status === 'pending_approval').length;

  const employeeNavItems: { label: string; tab: ActiveTab; icon: React.ReactNode }[] = [
    { label: 'Dashboard', tab: 'dashboard', icon: <LayoutDashboard size={17} /> },
    { label: 'Workflow', tab: 'workflow', icon: <CheckSquare size={17} /> },
    { label: 'Attendance', tab: 'attendance', icon: <Calendar size={17} /> },
    { label: 'Productivity', tab: 'productivity', icon: <TrendingUp size={17} /> },
    { label: 'Reports', tab: 'reports', icon: <FileText size={17} /> },
    { label: 'Notifications', tab: 'notifications', icon: <Bell size={17} /> },
  ];

  const adminNavItems: { label: string; tab: ActiveTab; icon: React.ReactNode }[] = [
    { label: 'Overview', tab: 'admin-overview', icon: <LayoutDashboard size={17} /> },
    { label: 'Live Monitor', tab: 'admin-monitoring', icon: <Shield size={17} /> },
    { label: 'Workflow', tab: 'admin-workflow', icon: <CheckSquare size={17} /> },
    { label: 'Analytics', tab: 'admin-analytics', icon: <TrendingUp size={17} /> },
    { label: 'Attendance', tab: 'admin-attendance', icon: <Calendar size={17} /> },
    { label: 'Policies', tab: 'admin-policies', icon: <Sliders size={17} /> },
    { label: 'Notifications', tab: 'notifications', icon: <Bell size={17} /> },
  ];

  const currentNav = role === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <header className="relative z-50 w-full h-16 px-5 sm:px-6 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white/95 dark:bg-slate-900/95">
      {/* 1. Left: Brand Logo & Wordmark */}
      <div 
        onClick={() => setActiveTab(role === 'admin' ? 'admin-overview' : 'dashboard')}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="w-8 h-8 rounded-full bg-[#FFE956] text-[#111827] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform font-bold">
          <Layers className="w-4 h-4" />
        </div>
        <span className="text-[17px] font-semibold tracking-tight text-[#0F172A] dark:text-white">
          FlowSphere
        </span>
      </div>

      {/* 2. Center: 40px Circular Navigation Buttons with expanding active pill (Desktop / Tablet only) */}
      <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
        {currentNav.map((item) => (
          <CircleIconButton
            key={item.tab}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.tab}
            onClick={() => setActiveTab(item.tab)}
            badgeCount={
              item.tab === 'notifications'
                ? unreadNotificationCount
                : item.tab === 'admin-workflow' && role === 'admin' && pendingApprovalsCount > 0
                ? pendingApprovalsCount
                : undefined
            }
          />
        ))}
      </nav>

      {/* 3. Right: Search, Theme Toggle, Avatar */}
      <div className="flex items-center gap-2">
        {/* Quick Search Button (⌘K) */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          title="Search (⌘K)"
          className="w-10 h-10 rounded-full glass-control flex items-center justify-center text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#FFE956]"
        >
          <Search size={17} />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
          className="w-10 h-10 rounded-full glass-control flex items-center justify-center text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#FFE956]"
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-[#FFE956]" />
          ) : (
            <Moon size={17} />
          )}
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative z-50">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-white/80 dark:hover:ring-white/20 transition-all outline-none"
          >
            <UserAvatar
              id={currentUser.id}
              name={currentUser.name}
              size="md"
            />
            <ChevronDown size={13} className="text-[#475569] dark:text-[#94A3B8] pr-0.5" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                {/* Invisible backdrop to catch outside clicks */}
                <div 
                  className="fixed inset-0 z-[999]" 
                  onClick={() => setIsProfileOpen(false)} 
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#0F172A] p-2.5 shadow-xl z-[1000] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-white/10"
                  style={{
                    backgroundColor: '#FFFFFF',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    boxShadow: '0 16px 32px -4px rgba(15, 23, 42, 0.18), 0 4px 10px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* User Info Header: Email & Role Grouped */}
                  <div className="px-2 pt-1 pb-2 border-b border-[#E2E8F0] dark:border-white/10">
                    <div className="text-[13px] font-bold text-[#0F172A] dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                      {currentUser.email}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#288F3D] shrink-0" />
                      <span className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium truncate">
                        {role === 'admin' ? 'System Administrator' : (currentUser.role || 'Senior Frontend Engineer')}
                      </span>
                    </div>
                  </div>

                  {/* Settings Item */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                    >
                      <Sliders size={14} className="text-[#64748B] flex-shrink-0" />
                      <span>Settings & Preferences</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 border-t border-[#E2E8F0] dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthenticated(false);
                        setIsProfileOpen(false);
                        addToast('Logged Out', 'Session ended successfully.', 'info');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-xl text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-bold cursor-pointer"
                    >
                      <LogOut size={14} className="flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
