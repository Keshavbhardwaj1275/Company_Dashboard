import React, { useState } from 'react';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Save, 
  Laptop, 
  Smartphone, 
  Trash2, 
  AlertCircle, 
  RotateCcw 
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    policies, 
    updatePolicies, 
    theme, 
    setTheme, 
    deviceSessions,
    revokeSession,
    revokeAllOtherSessions,
    addToast 
  } = useApp();

  const [confirmRevokeModalOpen, setConfirmRevokeModalOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const handleResetPreferences = () => {
    updatePolicies({ autoTrackOnLogin: true, enableActivityAlerts: true });
    addToast('Preferences Reset', 'Your local session preferences have been restored to defaults.', 'info');
  };

  const handleSaveSettings = () => {
    addToast('Preferences Updated', 'Your workspace tracking settings have been saved.', 'success');
  };

  const handleConfirmRevoke = () => {
    if (sessionToRevoke === 'all') {
      revokeAllOtherSessions();
    } else if (sessionToRevoke) {
      revokeSession(sessionToRevoke);
    }
    setConfirmRevokeModalOpen(false);
    setSessionToRevoke(null);
  };

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Account & System Preferences
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Configure telemetry triggers, idle detection thresholds, multi-device sessions, and appearance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetPreferences}
            className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A]"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="btn-yellow flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
          >
            <Save size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Tracking Policies & Sessions */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 1. Productivity & Inactivity Triggers */}
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/10">
              <Sliders size={16} className="text-[#158AF4]" />
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                Productivity & Inactivity Triggers
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[#0F172A] dark:text-white">Idle Detection Threshold</div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Inactivity duration before automatically pausing the productive timer — set by your organization's admin.
                  </p>
                </div>
                <div className="px-3 py-1.5 glass-control rounded-xl text-xs font-semibold opacity-80 text-[#0F172A] dark:text-white flex-shrink-0">
                  {policies.idleThresholdMinutes} Minutes
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/10">
                <div>
                  <div className="font-semibold text-[#0F172A] dark:text-white">Auto-Start Session on Login</div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Immediately start work session clock when authenticated
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.autoTrackOnLogin}
                  onChange={(e) => updatePolicies({ autoTrackOnLogin: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FFE956] accent-[#FFE956]"
                />
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/10">
                <div>
                  <div className="font-semibold text-[#0F172A] dark:text-white">Inactivity Audio & Visual Warnings</div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    Show subtle toast reminder when idle status is triggered
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.enableActivityAlerts}
                  onChange={(e) => updatePolicies({ enableActivityAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FFE956] accent-[#FFE956]"
                />
              </div>
            </div>
          </GlassCard>

          {/* 2. Multi-Device Sessions */}
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Laptop size={16} className="text-[#8B5CF6]" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                  Active Multi-Device Sessions ({deviceSessions.length})
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSessionToRevoke('all');
                  setConfirmRevokeModalOpen(true);
                }}
                className="text-xs text-[#B42318] hover:underline font-semibold"
              >
                Revoke All Others
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {deviceSessions.map((sess) => (
                <div key={sess.id} className="flex items-center justify-between p-3 rounded-xl glass-inner">
                  <div className="flex items-center gap-3">
                    {sess.type === 'mobile' ? (
                      <Smartphone size={18} className="text-[#94A3B8]" />
                    ) : (
                      <Laptop size={18} className="text-[#158AF4]" />
                    )}
                    <div>
                      <div className="font-semibold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                        <span>{sess.deviceName}</span>
                        {sess.isCurrent && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#BEF1CA] text-[#1F7A35] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                        {sess.browser} · IP: {sess.ipAddress} · {sess.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                      {sess.lastActive}
                    </span>
                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          setSessionToRevoke(sess.id);
                          setConfirmRevokeModalOpen(true);
                        }}
                        className="p-1 rounded text-[#B42318] hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Revoke session"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Profile & Appearance */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Profile Card */}
          <GlassCard className="p-5 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <UserAvatar
                id={currentUser.id}
                name={currentUser.name}
                size="2xl"
                status="active"
              />
            </div>

            <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
              {currentUser.name}
            </h3>
            <span className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-medium">{currentUser.role}</span>

            <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/10 text-left text-xs">
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Employee ID</span>
                <div className="font-mono font-semibold text-[#0F172A] dark:text-white">{currentUser.employeeId}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Department</span>
                <div className="text-[#158AF4] font-semibold">{currentUser.department}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Location</span>
                <div className="text-[#0F172A] dark:text-white font-medium">{currentUser.location}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Role</span>
                <div className="text-[#8B5CF6] capitalize font-semibold">{currentUser.systemRole}</div>
              </div>
            </div>
          </GlassCard>

          {/* Appearance & Theme Mode */}
          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/10">
              <Sun size={16} className="text-[#F59E0B]" />
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                Appearance & Theme Mode
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl glass-control flex flex-col items-center justify-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'border-[#FFE956] ring-2 ring-[#FFE956]/50 bg-white/90 shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                <Sun size={18} className="text-[#F59E0B]" />
                <span className="text-xs font-semibold text-[#0F172A]">Light Frosted SaaS</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl glass-control flex flex-col items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'border-[#FFE956] ring-2 ring-[#FFE956]/50 bg-slate-900/90 shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                <Moon size={18} className="text-[#38BDF8]" />
                <span className="text-xs font-semibold text-white">Dark Slate Refraction</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Revoke Session Confirmation Modal */}
      <Modal
        isOpen={confirmRevokeModalOpen}
        onClose={() => setConfirmRevokeModalOpen(false)}
        title="Revoke Device Session"
        subtitle="Confirm device disconnection"
      >
        <div className="space-y-3 text-xs text-[#475569] dark:text-[#94A3B8]">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
            <span>
              {sessionToRevoke === 'all'
                ? 'Are you sure you want to terminate all other active device sessions?'
                : 'Are you sure you want to disconnect this device session?'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setConfirmRevokeModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-control text-[#475569] hover:text-[#0F172A] font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevoke}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm"
            >
              Confirm Disconnect
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
