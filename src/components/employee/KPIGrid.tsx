import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { useApp } from '../../context/AppContext';
import { 
  formatSecondsToHoursMins, 
  calculateProductiveSeconds, 
  calculateProductivityScore 
} from '../../utils/productivity';

export const KPIGrid: React.FC = () => {
  const { setActiveTab, workSession, policies } = useApp();

  const productiveSec = calculateProductiveSeconds(
    workSession.activeSeconds,
    workSession.idleSeconds,
    workSession.breakSeconds
  );

  const prodScore = calculateProductivityScore(
    workSession.activeSeconds,
    workSession.idleSeconds,
    workSession.breakSeconds
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {/* 1. Active Time */}
      <MetricCard
        label="Total Active Time"
        value={formatSecondsToHoursMins(workSession.activeSeconds)}
        subValue={`Target: ${policies.minimumWorkingHours}h / day`}
        trend={{ value: '+12.4%', isPositive: true, text: 'vs last week' }}
        sparklineType="bars"
        sparklineValues={[35, 55, 60, 75, 80, 85, 90, 95, 70, 92, 45, 88]}
        highlightIndex={10}
        onClick={() => setActiveTab('productivity')}
      />

      {/* 2. Idle Time */}
      <MetricCard
        label="Idle Time Duration"
        value={formatSecondsToHoursMins(workSession.idleSeconds)}
        subValue={`Limit: ${policies.allowedIdleMinutes}m max`}
        trend={{ 
          value: workSession.idleSeconds / 60 > policies.allowedIdleMinutes ? 'Warning' : '-18.2%', 
          isPositive: workSession.idleSeconds / 60 <= policies.allowedIdleMinutes, 
          text: workSession.idleSeconds / 60 > policies.allowedIdleMinutes ? 'exceeds limit' : 'reduction' 
        }}
        sparklineType="bars"
        sparklineValues={[60, 50, 45, 40, 35, 30, 25, 20, 18, 15, 40, 12]}
        highlightIndex={10}
        onClick={() => setActiveTab('productivity')}
      />

      {/* 3. Net Productive Hours (Total Active - Idle - Break) */}
      <MetricCard
        label="Net Productive Hours"
        value={formatSecondsToHoursMins(productiveSec)}
        subValue={`Efficiency: ${prodScore}%`}
        trend={{ value: '+8.6%', isPositive: true, text: 'vs baseline' }}
        sparklineType="bell"
        onClick={() => setActiveTab('productivity')}
      />

      {/* 4. Attendance Status */}
      <MetricCard
        label="Attendance Status"
        value="Present"
        subValue={`Login: ${workSession.loginTime} · 22 Days`}
        trend={{ value: '100%', isPositive: true, text: 'on time' }}
        sparklineType="heat-grid"
        onClick={() => setActiveTab('attendance')}
      />
    </div>
  );
};
