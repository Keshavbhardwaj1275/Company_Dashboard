import React from 'react';
import { HeroOverview } from './HeroOverview';
import { KPIGrid } from './KPIGrid';
import { SegmentedBar } from '../common/SegmentedBar';
import { LiveActivityStream } from './LiveActivityStream';

export const EmployeeDashboard: React.FC = () => {
  return (
    <div className="space-y-2.5 sm:space-y-3 max-w-[1540px] mx-auto">
      {/* 1. Header & Symmetrical Top Row (Checklist + Productivity Pulse HalfGauge) */}
      <HeroOverview />

      {/* 2. Four Equal KPI Metric Cards */}
      <KPIGrid />

      {/* 3. Lower Row: Time Distribution Segmented Bar + Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        <div className="lg:col-span-6 flex">
          <div className="w-full">
            <SegmentedBar />
          </div>
        </div>

        <div className="lg:col-span-6 flex">
          <div className="w-full">
            <LiveActivityStream />
          </div>
        </div>
      </div>
    </div>
  );
};
