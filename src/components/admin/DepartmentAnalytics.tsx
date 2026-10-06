import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Award, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  X, 
  ExternalLink,
  Users,
  Clock,
  CalendarCheck,
  Zap,
  Activity
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';

export type TimePeriod = 'Today' | 'This Week' | 'This Month' | 'Last 30 Days';

interface DepartmentData {
  id: string;
  name: string;
  headcount: number;
  activeNow: number;
  idleCount: number;
  breakCount: number;
  avgProductivity: number;
  avgIdleMinutes: number;
  attendanceRate: number;
  trend: number; // e.g. +4.2%
  trendDirection: 'up' | 'down' | 'neutral';
  topPerformerName: string;
  topPerformerRole: string;
  topPerformerScore: number;
  topPerformerAttendance: number;
  topPerformerActiveHours: string;
  color: string;
}

// Master consistent department dataset
const MASTER_DEPARTMENTS: DepartmentData[] = [
  {
    id: 'dept-finance',
    name: 'Finance',
    headcount: 12,
    activeNow: 10,
    idleCount: 1,
    breakCount: 1,
    avgProductivity: 92.4,
    avgIdleMinutes: 21,
    attendanceRate: 98.2,
    trend: 3.2,
    trendDirection: 'up',
    topPerformerName: 'Neha Kapoor',
    topPerformerRole: 'Financial Operations Lead',
    topPerformerScore: 95,
    topPerformerAttendance: 99.0,
    topPerformerActiveHours: '07h 06m',
    color: '#158AF4', // Blue
  },
  {
    id: 'dept-eng',
    name: 'Engineering',
    headcount: 42,
    activeNow: 31,
    idleCount: 6,
    breakCount: 3,
    avgProductivity: 91.2,
    avgIdleMinutes: 28,
    attendanceRate: 97.4,
    trend: 4.2,
    trendDirection: 'up',
    topPerformerName: 'Karan Malhotra',
    topPerformerRole: 'Senior Frontend Engineer',
    topPerformerScore: 93,
    topPerformerAttendance: 98.0,
    topPerformerActiveHours: '06h 54m',
    color: '#288F3D', // Green
  },
  {
    id: 'dept-product',
    name: 'Product',
    headcount: 14,
    activeNow: 11,
    idleCount: 2,
    breakCount: 1,
    avgProductivity: 86.8,
    avgIdleMinutes: 25,
    attendanceRate: 98.1,
    trend: 3.1,
    trendDirection: 'neutral',
    topPerformerName: 'Ananya Patel',
    topPerformerRole: 'Lead Product Manager',
    topPerformerScore: 88,
    topPerformerAttendance: 98.0,
    topPerformerActiveHours: '06h 30m',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'dept-design',
    name: 'Design',
    headcount: 18,
    activeNow: 13,
    idleCount: 3,
    breakCount: 1,
    avgProductivity: 84.6,
    avgIdleMinutes: 34,
    attendanceRate: 95.8,
    trend: 1.8,
    trendDirection: 'up',
    topPerformerName: 'Ishita Banerjee',
    topPerformerRole: 'Senior UI/UX Designer',
    topPerformerScore: 84,
    topPerformerAttendance: 96.0,
    topPerformerActiveHours: '05h 12m',
    color: '#F3740F', // Orange
  },
  {
    id: 'dept-marketing',
    name: 'Marketing',
    headcount: 16,
    activeNow: 10,
    idleCount: 4,
    breakCount: 1,
    avgProductivity: 81.4,
    avgIdleMinutes: 42,
    attendanceRate: 94.2,
    trend: -2.4,
    trendDirection: 'down',
    topPerformerName: 'Arjun Das',
    topPerformerRole: 'Growth Marketing Lead',
    topPerformerScore: 72,
    topPerformerAttendance: 94.0,
    topPerformerActiveHours: '04h 00m',
    color: '#52A3C1', // Cyan/Steel
  },
  {
    id: 'dept-ops',
    name: 'Operations',
    headcount: 26,
    activeNow: 19,
    idleCount: 4,
    breakCount: 2,
    avgProductivity: 79.8,
    avgIdleMinutes: 48,
    attendanceRate: 93.6,
    trend: -1.6,
    trendDirection: 'down',
    topPerformerName: 'Rohan Mehra',
    topPerformerRole: 'Workforce Operations Manager',
    topPerformerScore: 88,
    topPerformerAttendance: 95.0,
    topPerformerActiveHours: '06h 48m',
    color: '#EAB308', // Amber
  },
];

// Clean 7-day trend dataset
const TREND_SERIES = [
  { day: 'Mon', score: 85.2, active: 92 },
  { day: 'Tue', score: 87.4, active: 95 },
  { day: 'Wed', score: 83.8, active: 91 },
  { day: 'Thu', score: 88.9, active: 96 },
  { day: 'Fri', score: 86.6, active: 94 },
  { day: 'Sat', score: 79.2, active: 52 },
  { day: 'Sun', score: 77.0, active: 46 },
];

export const DepartmentAnalytics: React.FC = () => {
  const { policies, employees, setSelectedEmployee } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('This Month');
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null);

  // Departments calculated per selected time period
  const departmentsForPeriod = useMemo(() => {
    switch (selectedPeriod) {
      case 'Today':
        return MASTER_DEPARTMENTS.map((d) => ({
          ...d,
          avgProductivity: Number(Math.min(98, d.avgProductivity + 1.8).toFixed(1)),
          avgIdleMinutes: Math.max(15, d.avgIdleMinutes - 4),
          activeNow: Math.min(d.headcount, d.activeNow + 1),
          trend: Number((d.trend + 0.8).toFixed(1)),
        }));
      case 'This Week':
        return MASTER_DEPARTMENTS.map((d) => ({
          ...d,
          avgProductivity: Number((d.avgProductivity + 0.6).toFixed(1)),
          avgIdleMinutes: Math.max(18, d.avgIdleMinutes - 2),
          trend: Number((d.trend + 0.3).toFixed(1)),
        }));
      case 'This Month':
        return MASTER_DEPARTMENTS;
      case 'Last 30 Days':
        return MASTER_DEPARTMENTS.map((d) => ({
          ...d,
          avgProductivity: Number(Math.max(75, d.avgProductivity - 1.2).toFixed(1)),
          avgIdleMinutes: d.avgIdleMinutes + 3,
          trend: Number((d.trend - 0.9).toFixed(1)),
        }));
      default:
        return MASTER_DEPARTMENTS;
    }
  }, [selectedPeriod]);

  // Computed departments sorted by productivity descending (Ranking #1 to #6)
  const rankedDepartments = useMemo(() => {
    return [...departmentsForPeriod].sort((a, b) => b.avgProductivity - a.avgProductivity);
  }, [departmentsForPeriod]);

  // Organization aggregate values
  const orgMetrics = useMemo(() => {
    const totalHeadcount = departmentsForPeriod.reduce((sum, d) => sum + d.headcount, 0);
    const activeNow = departmentsForPeriod.reduce((sum, d) => sum + d.activeNow, 0);
    const totalProd = departmentsForPeriod.reduce((sum, d) => sum + (d.avgProductivity * d.headcount), 0);
    const totalIdle = departmentsForPeriod.reduce((sum, d) => sum + (d.avgIdleMinutes * d.headcount), 0);
    const totalAtt = departmentsForPeriod.reduce((sum, d) => sum + (d.attendanceRate * d.headcount), 0);

    return {
      totalHeadcount,
      activeNow,
      activeRate: ((activeNow / totalHeadcount) * 100).toFixed(1),
      avgProductivity: (totalProd / totalHeadcount).toFixed(1),
      avgIdleMinutes: Math.round(totalIdle / totalHeadcount),
      attendanceRate: (totalAtt / totalHeadcount).toFixed(1),
    };
  }, [departmentsForPeriod]);

  // Donut chart distribution data
  const donutData = useMemo(() => {
    return departmentsForPeriod.map((d) => ({
      name: d.name,
      value: d.headcount,
      percentage: ((d.headcount / 128) * 100).toFixed(1),
      color: d.color,
    }));
  }, [departmentsForPeriod]);

  // Open top performer employee details
  const handleOpenPerformer = (name: string, dept: DepartmentData) => {
    const existing = employees.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSelectedEmployee(existing);
    } else {
      const fallback: Employee = {
        id: `emp-top-${Date.now()}`,
        employeeId: 'FS-1007',
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@flowsphere.internal`,
        avatar: '',
        department: dept.name as Employee['department'],
        role: dept.topPerformerRole,
        systemRole: 'employee',
        seedRole: 'employee',
        status: 'active',
        loginTime: '08:55 AM',
        logoutTime: '--',
        activeSeconds: 24840,
        idleSeconds: 1080,
        breakSeconds: 1980,
        productivityScore: dept.topPerformerScore,
        attendanceStatus: 'present',
        lastActivity: 'Just now',
        keyboardActivity: 'High',
        mouseActivity: 'Active',
        currentTask: `Lead Milestone Execution for ${dept.name}`,
        location: 'Tech Hub Floor 4',
      };
      setSelectedEmployee(fallback);
    }
  };

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto pb-10 font-sans">
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-[26px] font-bold text-[#0F172A] dark:text-white tracking-tight">
            Department Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5 font-medium">
            Compare productivity, workforce distribution, and team health
          </p>
        </div>

        {/* Tab Switcher matching ProductivityDeepDive.tsx */}
        <div className="flex items-center glass-control p-1 rounded-full text-xs self-start sm:self-auto">
          {(['Today', 'This Week', 'This Month', 'Last 30 Days'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                selectedPeriod === period
                  ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO REGION: ORGANIZATION PULSE ────────────────── */}
      <GlassCard className="p-6 sm:p-7 w-full bg-white/85 dark:bg-[#0F172A]/90 border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Anchor Number */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8] uppercase">
                Organization Pulse
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#288F3D]/10 text-[#288F3D]">
                <ArrowUpRight size={13} />
                +3.2% vs previous period
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-mono">
                {orgMetrics.avgProductivity}%
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#475569] dark:text-[#94A3B8]">
                Average Productivity
              </span>
            </div>

            {/* Clean Telemetry Badges */}
            <div className="flex items-center gap-4 pt-1 text-xs text-[#64748B] dark:text-[#94A3B8] flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-[#158AF4]" />
                <strong className="text-[#0F172A] dark:text-white">{orgMetrics.activeNow} Active</strong> ({orgMetrics.activeRate}% of 128)
              </span>
              <span className="text-black/20 dark:text-white/20">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-[#F3740F]" />
                <strong className="text-[#0F172A] dark:text-white">{orgMetrics.avgIdleMinutes}m</strong> Avg Idle
              </span>
              <span className="text-black/20 dark:text-white/20">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarCheck size={14} className="text-[#288F3D]" />
                <strong className="text-[#0F172A] dark:text-white">{orgMetrics.attendanceRate}%</strong> Attendance
              </span>
            </div>
          </div>

          {/* Right 7-Day Subtle Trend Chart */}
          <div className="w-full lg:w-[420px] h-28">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">
              <span>7-Day Productivity Velocity</span>
              <span className="text-[#288F3D] font-semibold">Target: 85.0%</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_SERIES} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroPulseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#158AF4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#158AF4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={85} stroke="#EAB308" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="px-2.5 py-1.5 bg-white/95 dark:bg-[#0F172A]/95 rounded-lg shadow-md border border-black/10 dark:border-white/10 text-xs font-mono backdrop-blur-md">
                          <span className="font-bold text-[#0F172A] dark:text-white">{label}: </span>
                          <span className="text-[#158AF4] font-bold">{payload[0].value}%</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#158AF4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#heroPulseGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* ── MAIN ANALYTICS: 2-COLUMN BALANCED REGION ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 Cols: Department Performance (Horizontal Ranking) */}
        <div className="lg:col-span-7 flex flex-col">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col bg-white/85 dark:bg-[#0F172A]/90 border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                    Department Performance
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Average productivity ranked across teams
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Click team to inspect
                </span>
              </div>

              {/* Clean Horizontal Ranked Rows */}
              <div className="space-y-1.5">
                {rankedDepartments.map((dept, index) => {
                  const isSelected = selectedDept?.name === dept.name;
                  const isPositive = dept.trendDirection === 'up';
                  const isNegative = dept.trendDirection === 'down';

                  return (
                    <div
                      key={dept.name}
                      onClick={() => setSelectedDept(dept)}
                      className={`group px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#158AF4]/10 border-[#158AF4]/30 shadow-xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:border-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8] bg-black/5 dark:bg-white/10">
                            0{index + 1}
                          </span>
                          <span className="font-semibold text-xs text-[#0F172A] dark:text-white group-hover:text-[#158AF4] transition-colors">
                            {dept.name}
                          </span>
                          <span className="text-[11px] text-[#64748B] font-normal">
                            ({dept.headcount} staff)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-xs text-[#0F172A] dark:text-white">
                            {dept.avgProductivity}%
                          </span>
                          <span
                            className={`inline-flex items-center text-[11px] font-bold ${
                              isPositive
                                ? 'text-[#288F3D]'
                                : isNegative
                                ? 'text-[#EF4444]'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp size={13} />
                            ) : isNegative ? (
                              <TrendingDown size={13} />
                            ) : (
                              <Minus size={13} />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Smooth Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dept.avgProductivity >= 90
                              ? 'bg-[#288F3D]'
                              : dept.avgProductivity >= 84
                              ? 'bg-[#158AF4]'
                              : 'bg-[#F3740F]'
                          }`}
                          style={{ width: `${dept.avgProductivity}%` }}
                        />
                        {/* Target line at 85% */}
                        <div className="absolute top-0 bottom-0 left-[85%] w-[1.5px] bg-black/30 dark:bg-white/40" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 mt-1.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>Organization SLA Benchmark: <strong>85.0%</strong></span>
              <span>Top Output: <strong>Finance (92.4%)</strong></span>
            </div>
          </GlassCard>
        </div>

        {/* Right 5 Cols: Workforce Distribution (Refined Donut) */}
        <div className="lg:col-span-5 flex flex-col">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col bg-white/85 dark:bg-[#0F172A]/90 border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  Workforce Distribution
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  Headcount proportion by division
                </p>
              </div>
            </div>

            {/* Elegant Donut Chart */}
            <div className="h-44 w-full relative my-1.5 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                    onClick={(data) => {
                      const match = MASTER_DEPARTMENTS.find((d) => d.name === data.name);
                      if (match) setSelectedDept(match);
                    }}
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke={selectedDept?.name === entry.name ? '#0F172A' : 'rgba(255,255,255,0.8)'}
                        strokeWidth={selectedDept?.name === entry.name ? 2 : 1}
                        className="cursor-pointer transition-transform hover:scale-105"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="px-2.5 py-1.5 bg-white/95 dark:bg-[#0F172A]/95 rounded-lg shadow-md border border-black/10 dark:border-white/10 text-xs backdrop-blur-md">
                            <div className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}: {item.value} ({item.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold font-mono text-[#0F172A] dark:text-white leading-tight">
                  128
                </span>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Staff
                </span>
              </div>
            </div>

            {/* Compact Legend Grid */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
              {donutData.map((dept) => {
                const isSelected = selectedDept?.name === dept.name;
                return (
                  <button
                    key={dept.name}
                    type="button"
                    onClick={() => {
                      const match = MASTER_DEPARTMENTS.find((d) => d.name === dept.name);
                      if (match) setSelectedDept(match);
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black/5 dark:bg-white/10 font-bold text-[#0F172A] dark:text-white'
                        : 'text-[#475569] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                      <span className="truncate font-medium">{dept.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] shrink-0 font-semibold">
                      {dept.value}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-dashed border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>Primary Concentration</span>
              <span className="font-semibold text-[#0F172A] dark:text-white">Engineering (32.8%)</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── BOTTOM REGION: TEAM PULSE (ONE INTELLIGENT PANEL) ─ */}
      <GlassCard className="p-5 sm:p-6 w-full bg-white/85 dark:bg-[#0F172A]/90 border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md rounded-2xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#158AF4] live-dot" />
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
              Team Pulse
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-medium">3 key signals</span>
        </div>

        {/* 3 Lightweight Observations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Signal 1: Finance Leads */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#288F3D]/10 text-[#288F3D] shrink-0 mt-0.5">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                Finance leads productivity
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-medium">
                <strong>92.4%</strong> average output with 98.2% attendance rate.
              </p>
            </div>
          </div>

          {/* Signal 2: Engineering Improving */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#158AF4]/10 text-[#158AF4] shrink-0 mt-0.5">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                Engineering is improving
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-medium">
                <strong>+4.2%</strong> gain this period across 42 active developers.
              </p>
            </div>
          </div>

          {/* Signal 3: Operations Needs Attention */}
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] shrink-0 mt-0.5">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                Operations needs attention
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-medium">
                Highest idle duration (<strong>48m avg</strong>) vs {policies.allowedIdleMinutes}m policy.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── SELECTED DEPARTMENT COMPACT DETAIL MODAL ──────── */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedDept.color }} />
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white tracking-tight">
                    {selectedDept.name} Overview
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {selectedDept.headcount} Employees · {((selectedDept.headcount / 128) * 100).toFixed(1)}% of workforce
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* 4-Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Productivity</span>
                <div className="text-lg font-bold font-mono text-[#288F3D] mt-0.5">
                  {selectedDept.avgProductivity}%
                </div>
                <span className="text-[10px] text-[#288F3D]">
                  {selectedDept.trend >= 0 ? `+${selectedDept.trend}%` : `${selectedDept.trend}%`} trend
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Now</span>
                <div className="text-lg font-bold font-mono text-[#158AF4] mt-0.5">
                  {selectedDept.activeNow} / {selectedDept.headcount}
                </div>
                <span className="text-[10px] text-[#64748B]">
                  {selectedDept.idleCount} idle · {selectedDept.breakCount} break
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Avg Idle</span>
                <div className="text-lg font-bold font-mono text-[#0F172A] dark:text-white mt-0.5">
                  {selectedDept.avgIdleMinutes}m
                </div>
                <span className="text-[10px] text-[#64748B]">
                  Policy: {policies.allowedIdleMinutes}m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Attendance</span>
                <div className="text-lg font-bold font-mono text-[#8B5CF6] mt-0.5">
                  {selectedDept.attendanceRate}%
                </div>
                <span className="text-[10px] text-[#288F3D]">Reliable</span>
              </div>
            </div>

            {/* Top Performer Showcase */}
            <div className="p-3.5 rounded-xl bg-[#158AF4]/5 border border-[#158AF4]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={selectedDept.topPerformerName} size="md" status="active" />
                <div>
                  <div className="text-[10px] font-bold text-[#158AF4] uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} /> Top Performer
                  </div>
                  <div className="font-bold text-sm text-[#0F172A] dark:text-white">
                    {selectedDept.topPerformerName}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {selectedDept.topPerformerRole}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-[#288F3D]">
                  {selectedDept.topPerformerScore}% Score
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPerformer(selectedDept.topPerformerName, selectedDept);
                    setSelectedDept(null);
                  }}
                  className="mt-1 text-xs font-semibold text-[#158AF4] hover:underline flex items-center gap-0.5"
                >
                  <span>Profile</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAnalytics;
