import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, Calendar, CheckSquare, Settings, Shield, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { StatusChip } from './StatusChip';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab, 
    employees, 
    setSelectedEmployee
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const quickNav = [
    { label: 'Employee Dashboard', icon: User, tab: 'dashboard', category: 'Navigation' },
    { label: 'My Workflow Tasks', icon: CheckSquare, tab: 'workflow', category: 'Navigation' },
    { label: 'Attendance & Timelog', icon: Calendar, tab: 'attendance', category: 'Navigation' },
    { label: 'Productivity Analytics', icon: FileText, tab: 'productivity', category: 'Navigation' },
    { label: 'Reports & Export Center', icon: FileText, tab: 'reports', category: 'Navigation' },
    { label: 'System Settings & Preferences', icon: Settings, tab: 'settings', category: 'Navigation' },
    { label: 'Admin Workforce Monitor', icon: Shield, tab: 'admin-monitoring', category: 'Admin' },
    { label: 'Admin Analytics & Ranking', icon: Shield, tab: 'admin-analytics', category: 'Admin' },
    { label: 'Admin Policies & Exceptions', icon: Settings, tab: 'admin-policies', category: 'Admin' },
  ];

  const filteredNav = quickNav.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(query.toLowerCase()) ||
    emp.department.toLowerCase().includes(query.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCommandPaletteOpen(false)}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-sm"
        />

        {/* Command Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl glass-card rounded-[24px] shadow-2xl overflow-hidden z-10 p-0 border border-white/90 dark:border-white/10"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-black/5 dark:border-white/10">
            <Search size={16} className="text-[#94A3B8] mr-2.5" />
            <input
              type="text"
              placeholder="Search workflows, employees, reports, or commands... (ESC to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-xs text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none font-medium"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#475569] dark:text-[#94A3B8] glass-control rounded font-semibold">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-2.5">
            {/* Quick Navigation */}
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                Quick Actions
              </div>
              <div className="space-y-0.5 mt-0.5">
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.tab as any);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-lg glass-control text-[#475569]">
                          <Icon size={14} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight size={12} className="opacity-40" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employees List */}
            {filteredEmployees.length > 0 && (
              <div className="pt-2 border-t border-black/5 dark:border-white/10">
                <div className="px-3 py-1 text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Employees ({filteredEmployees.length})
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs text-[#0F172A] dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          id={emp.id}
                          name={emp.name}
                          size="sm"
                          status={emp.status}
                        />
                        <div>
                          <div className="font-semibold text-xs">{emp.name}</div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                            {emp.department} · {emp.employeeId}
                          </div>
                        </div>
                      </div>
                      <StatusChip
                        status={emp.status === 'active' ? 'live' : 'warning'}
                        label={emp.status}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
