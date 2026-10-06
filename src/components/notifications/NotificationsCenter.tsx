import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useApp } from '../../context/AppContext';

export const NotificationsCenter: React.FC = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications, unreadNotificationCount } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unread') return !item.read;
    return item.category === activeCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={16} className="text-[#F3740F]" />;
      case 'alert':
        return <ShieldAlert size={16} className="text-[#B42318]" />;
      case 'success':
        return <CheckCircle size={16} className="text-[#288F3D]" />;
      default:
        return <Info size={16} className="text-[#158AF4]" />;
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
              Notification & Alert Center
            </h2>
            {unreadNotificationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F7C9C6] text-[#B42318] dark:bg-red-950/40 dark:text-red-300">
                {unreadNotificationCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Compliance alerts, idle threshold triggers, attendance warnings, and enterprise policy notices
          </p>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={clearAllNotifications}
          className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread' },
          { id: 'idle', label: 'Idle Warnings' },
          { id: 'productivity', label: 'Productivity' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'system', label: 'System & Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white font-semibold shadow-sm border border-white/80 dark:border-white/10'
                : 'glass-control text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <GlassCard className="p-8 text-center text-[#94A3B8]">
              <Bell size={24} className="mx-auto mb-2 opacity-40" />
              <div className="text-sm font-medium">No notifications in this category.</div>
            </GlassCard>
          ) : (
            filteredNotifications.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`p-4 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                  !item.read ? 'border-l-4 border-l-[#FFE956]' : 'opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl glass-control mt-0.5 flex-shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#FFE956] live-dot" />
                      )}
                    </div>
                    <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed font-normal">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock size={12} />
                        <span>{item.timestamp}</span>
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {!item.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(item.id);
                    }}
                    className="text-xs text-[#0F172A] dark:text-white hover:underline font-semibold whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                )}
              </GlassCard>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
