import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { HalfGauge } from '../common/HalfGauge';
import { MiniBarSparkline } from '../common/MiniBarSparkline';
import { StatusChip } from '../common/StatusChip';
import { CircleIconButton } from '../common/CircleIconButton';
import { SegmentedBar } from '../common/SegmentedBar';
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Bell, Play } from 'lucide-react';

export const DesignSystemGallery: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal text-[#111827] dark:text-white">
            FlowSphere Design System Primitives
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Phase 1 Component Verification (Light / Dark Adaptive Glass Tokens)
          </p>
        </div>
        <button className="btn-yellow px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <Play size={15} /> Primary Yellow CTA
        </button>
      </div>

      {/* 1. Circle Icon Buttons */}
      <GlassCard>
        <h3 className="text-sm font-medium mb-3 text-[#111827] dark:text-white">
          1. Circle Icon Button Navigation Controls
        </h3>
        <div className="flex items-center gap-2">
          <CircleIconButton
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <CircleIconButton
            icon={<CheckSquare size={18} />}
            label="Workflow"
            isActive={activeTab === 'workflow'}
            onClick={() => setActiveTab('workflow')}
          />
          <CircleIconButton
            icon={<Calendar size={18} />}
            label="Attendance"
            isActive={activeTab === 'attendance'}
            onClick={() => setActiveTab('attendance')}
          />
          <CircleIconButton
            icon={<BarChart3 size={18} />}
            label="Productivity"
            isActive={activeTab === 'productivity'}
            onClick={() => setActiveTab('productivity')}
          />
          <CircleIconButton
            icon={<Bell size={18} />}
            label="Notifications"
            isActive={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
            badgeCount={3}
          />
        </div>
      </GlassCard>

      {/* 2. HalfGauge & Status Chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center p-6">
          <h3 className="text-sm font-medium self-start mb-2 text-[#111827] dark:text-white">
            2. Three-Segment Half Gauge
          </h3>
          <HalfGauge score={87} label="Productivity Pulse" size={220} />
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-sm font-medium text-[#111827] dark:text-white">
            3. Status Chips & Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            <StatusChip status="active" label="Active" />
            <StatusChip status="passed" label="Passed" />
            <StatusChip status="warning" label="Warning" />
            <StatusChip status="idle" label="Idle" />
            <StatusChip status="break" label="Break" />
            <StatusChip status="closed" label="Closed" />
            <StatusChip status="live" label="Live Stream" />
          </div>

          <h3 className="text-sm font-medium pt-2 text-[#111827] dark:text-white">
            4. Mini Bar Sparklines
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-inner p-3">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Thin Bars</span>
              <MiniBarSparkline type="bars" height={22} />
            </div>
            <div className="glass-inner p-3">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Bell Mound</span>
              <MiniBarSparkline type="bell" height={22} />
            </div>
            <div className="glass-inner p-3">
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block mb-2">Heat Grid</span>
              <MiniBarSparkline type="heat-grid" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3. Segmented Bar */}
      <SegmentedBar />
    </div>
  );
};
