import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { useApp } from '../../context/AppContext';

export const LiveActivityStream: React.FC = () => {
  const { setActiveTab, workSession } = useApp();

  const activityStreams = [
    {
      id: 'stream-1',
      title: 'UI Design System & Component Contrast Audit',
      time: 'Just now',
      latency: '16ms',
      status: 'live' as const,
      label: 'Active IDE',
    },
    {
      id: 'stream-2',
      title: 'Weekly Sprint Retrospective & Architecture Review',
      time: '18 min ago',
      latency: '24ms',
      status: 'closed' as const,
      label: 'Completed',
    },
    {
      id: 'stream-3',
      title: 'Telemetry Stream Latency Optimization',
      time: '45 min ago',
      latency: '32ms',
      status: 'closed' as const,
      label: 'Completed',
    },
    {
      id: 'stream-4',
      title: 'Morning Biometric Punch & Timesheet Verification',
      time: '09:04 AM',
      latency: '12ms',
      status: 'closed' as const,
      label: 'Verified',
    },
  ];

  return (
    <GlassCard className="p-4 sm:p-5 h-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#288F3D] live-dot" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            Live Activity Stream
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-[#475569] dark:text-[#94A3B8]">
            Real-time
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className="text-xs text-[#0F172A] dark:text-white hover:underline font-semibold"
        >
          View all tasks
        </button>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">
              <th className="py-2 px-1 font-semibold">Activity Task</th>
              <th className="py-2 px-1 font-semibold">Timestamp</th>
              <th className="py-2 px-1 font-semibold">Latency</th>
              <th className="py-2 px-1 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
            {activityStreams.map((item, idx) => (
              <tr
                key={item.id}
                className={`transition-colors ${
                  idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                } hover:bg-white/60 dark:hover:bg-white/5`}
              >
                {/* Task Name */}
                <td className="py-2.5 px-1 font-medium text-[#0F172A] dark:text-white">
                  <span className="truncate block max-w-[170px] sm:max-w-[220px]">
                    {item.title}
                  </span>
                </td>

                {/* Time */}
                <td className="py-2.5 px-1 text-[#475569] dark:text-[#94A3B8] font-mono text-[11px]">
                  {item.time}
                </td>

                {/* Latency */}
                <td className="py-2.5 px-1 text-[#475569] dark:text-[#94A3B8] font-mono text-[11px]">
                  {item.latency}
                </td>

                {/* Status Chip */}
                <td className="py-2.5 px-1 text-right">
                  <StatusChip status={item.status} label={item.label} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Status */}
      <div className="pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#475569] dark:text-[#94A3B8]">
        <span className="flex items-center gap-1.5 text-[#288F3D] font-medium">
          <Activity size={13} />
          <span>Heartbeat: {workSession.keyboardActivity} interaction</span>
        </span>
        <span className="font-mono text-[#64748B]">Telemetry P99: 22ms</span>
      </div>
    </GlassCard>
  );
};
