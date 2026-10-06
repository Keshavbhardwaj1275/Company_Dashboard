import React from 'react';
import { 
  Users, 
  Activity, 
  Hourglass, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Sliders,
  Calendar
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { MetricCard } from '../common/MetricCard';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { departmentStats } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { setActiveTab, setSelectedEmployee, employees } = useApp();

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Workforce Intelligence Command Center
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Enterprise telemetry, real-time activity oversight, department productivity rankings, and shift compliance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('admin-policies')}
            className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80"
          >
            <Sliders size={14} className="text-[#158AF4]" />
            <span>Policy Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin-monitoring')}
            className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          >
            <Activity size={14} />
            <span>Live Monitor Matrix</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Total Workforce Headcount"
          value="128"
          subValue="Active: 94 · Idle: 17 · Break: 9"
          trend={{ value: '+4', isPositive: true, text: 'new onboarded' }}
          sparklineType="bars"
          sparklineValues={[118, 120, 122, 124, 125, 126, 128]}
          onClick={() => setActiveTab('admin-monitoring')}
        />

        <MetricCard
          label="Active Tracking Now"
          value="94 Active"
          subValue="73.4% of total workforce"
          trend={{ value: 'Optimal', isPositive: true, text: 'focus rhythm' }}
          sparklineType="bell"
          onClick={() => setActiveTab('admin-monitoring')}
        />

        <MetricCard
          label="Idle Inactivity Warnings"
          value="17 Inactive"
          subValue="13.2% exceeds 5m threshold"
          trend={{ value: '-6', isPositive: true, text: 'vs yesterday' }}
          sparklineType="bars"
          sparklineValues={[28, 25, 22, 20, 19, 18, 17]}
          highlightIndex={6}
          onClick={() => setActiveTab('admin-policies')}
        />

        <MetricCard
          label="Average Productivity"
          value="85.4%"
          subValue="Enterprise Target: 80.0%"
          trend={{ value: '+5.4%', isPositive: true, text: 'above target' }}
          sparklineType="heat-grid"
          onClick={() => setActiveTab('admin-analytics')}
        />
      </div>

      {/* 2 Middle Cards: Department Leaderboard & Live Telemetry Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 6 Cols: Department Performance Matrix */}
        <div className="lg:col-span-6 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                    Department Productivity Rankings
                  </h3>
                  <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
                    Calculated via daily active output & sprint velocity
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin-analytics')}
                  className="text-xs text-[#0F172A] dark:text-white hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Analytics</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-2">
                {departmentStats.map((dept, idx) => (
                  <div
                    key={dept.name}
                    className="p-2.5 rounded-xl glass-inner flex items-center justify-between gap-3 hover:bg-white/80 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg glass-control flex items-center justify-center text-[11px] font-mono font-bold text-[#475569] dark:text-[#94A3B8]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-[#0F172A] dark:text-white flex items-center gap-1.5">
                          <span>{dept.name}</span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal">({dept.total} staff)</span>
                        </div>
                        <span className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                          Top Performer: <strong className="text-[#0F172A] dark:text-white">{dept.topPerformer}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-20 hidden sm:block">
                        <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#288F3D]"
                            style={{ width: `${dept.avgProductivity}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#288F3D] font-bold">
                        {dept.avgProductivity}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 6 Cols: Live Employee Stream */}
        <div className="lg:col-span-6 flex">
          <GlassCard className="p-4 sm:p-5 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#288F3D] live-dot" />
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                    Live Employee Activity Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-[#288F3D] font-medium">Real-time sync</span>
              </div>

              <div className="space-y-2">
                {employees.slice(0, 5).map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="p-2.5 rounded-xl glass-inner hover:bg-white/80 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <UserAvatar
                          id={emp.id}
                          name={emp.name}
                          size="sm"
                          status={emp.status}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-white">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] truncate max-w-[150px] sm:max-w-[190px]">
                          {emp.currentTask}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-[#158AF4] font-bold">
                        {emp.productivityScore}%
                      </span>
                      <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">{emp.lastActivity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('admin-monitoring')}
              className="w-full mt-3 py-2 rounded-xl glass-control text-xs text-[#0F172A] dark:text-white font-semibold text-center hover:bg-white/80"
            >
              Open Full Workforce Telemetry Grid ({employees.length} Staff)
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
