import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { MiniBarSparkline } from '../common/MiniBarSparkline';
import { departmentStats, weeklyTrendData, hourlyProductivityData } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { calculateProductivityScore } from '../../utils/productivity';

export const ProductivityDeepDive: React.FC = () => {
  const { workSession } = useApp();
  const [metricTab, setMetricTab] = useState<'weekly' | 'hourly' | 'department'>('weekly');

  const radarData = [
    { subject: 'Focus Rhythm', A: 92, fullMark: 100 },
    { subject: 'Active Ratio', A: 88, fullMark: 100 },
    { subject: 'Task Velocity', A: 85, fullMark: 100 },
    { subject: 'Idle Control', A: 94, fullMark: 100 },
    { subject: 'Punctuality', A: 90, fullMark: 100 },
    { subject: 'Output Volume', A: 87, fullMark: 100 },
  ];

  const currentScore = calculateProductivityScore(
    workSession.activeSeconds,
    workSession.idleSeconds,
    workSession.breakSeconds
  );

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Productivity & Rhythm Intelligence
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Hourly timeline distribution, weekly focus trends, and behavioral radar benchmarks
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center glass-control p-1 rounded-full text-xs">
          <button
            type="button"
            onClick={() => setMetricTab('weekly')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              metricTab === 'weekly'
                ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-sm font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Weekly Rhythm
          </button>
          <button
            type="button"
            onClick={() => setMetricTab('hourly')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              metricTab === 'hourly'
                ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-sm font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Hourly Timeline
          </button>
          <button
            type="button"
            onClick={() => setMetricTab('department')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              metricTab === 'department'
                ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-sm font-semibold'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Department Benchmarks
          </button>
        </div>
      </div>

      {/* 3 Productivity Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
              Focus Velocity Index
            </span>
            <MiniBarSparkline type="bars" height={18} />
          </div>
          <div className="text-[28px] font-semibold text-[#0F172A] dark:text-white my-1 tabular-nums">
            {currentScore} / 100
          </div>
          <div className="text-[11px] text-[#1F7A35] dark:text-[#86EFAC] font-semibold">
            Top 5% in Engineering Organization
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
              Idle Decay Ratio
            </span>
            <MiniBarSparkline type="bell" height={18} />
          </div>
          <div className="text-[28px] font-semibold text-[#0F172A] dark:text-white my-1 tabular-nums">
            7.2% Total
          </div>
          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
            Well below allowed enterprise threshold of 12.5%
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
              Milestone Delivery Ratio
            </span>
            <MiniBarSparkline type="heat-grid" />
          </div>
          <div className="text-[28px] font-semibold text-[#0F172A] dark:text-white my-1 tabular-nums">
            96.8%
          </div>
          <div className="text-[11px] text-[#158AF4] dark:text-[#38BDF8] font-semibold">
            18 of 19 weekly sprint deliverables completed on time
          </div>
        </GlassCard>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 8 Cols: Main Rhythm & Hourly Chart */}
        <div className="lg:col-span-8 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {metricTab === 'weekly'
                  ? 'Weekly Productivity Rhythm (Hours)'
                  : metricTab === 'hourly'
                  ? 'Hourly Focus & Output Timeline (Mins / Hour)'
                  : 'Department Productivity Benchmarks (%)'}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#288F3D]" /> Productive
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F3740F]" /> Idle
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#158AF4]" /> Break
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {metricTab === 'weekly' ? (
                  <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar isAnimationActive={false} dataKey="productive" name="Productive (h)" fill="#288F3D" radius={[4, 4, 0, 0]} />
                    <Bar isAnimationActive={false} dataKey="idle" name="Idle (h)" fill="#F3740F" radius={[4, 4, 0, 0]} />
                    <Bar isAnimationActive={false} dataKey="break" name="Break (h)" fill="#158AF4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : metricTab === 'hourly' ? (
                  <AreaChart data={hourlyProductivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#288F3D" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#288F3D" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Area isAnimationActive={false} type="monotone" dataKey="productive" name="Productive Mins" stroke="#288F3D" fill="url(#areaProd)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[60, 100]} stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar isAnimationActive={false} dataKey="avgProductivity" name="Avg Productivity %" fill="#288F3D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols: Radar Telemetry Matrix */}
        <div className="lg:col-span-4 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">
              Behavioral Radar Profile
            </h3>

            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={10} fontVariant="medium" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                  <Radar isAnimationActive={false} name="Score" dataKey="A" stroke="#158AF4" fill="#158AF4" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-black/5 dark:border-white/10 text-center text-[11px] text-[#475569] dark:text-[#94A3B8]">
              High performance index with superior active task velocity and low idle latency.
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
