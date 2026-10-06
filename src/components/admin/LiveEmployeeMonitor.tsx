import React, { useState } from 'react';
import { Search, Eye, Sliders, Activity, UserCheck } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { useApp } from '../../context/AppContext';

export const LiveEmployeeMonitor: React.FC = () => {
  const { employees, selectedEmployee, setSelectedEmployee, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusChip status="live" label="Active IDE" />;
      case 'idle':
        return <StatusChip status="warning" label="Idle Inactive" />;
      case 'break':
        return <StatusChip status="break" label="On Break" />;
      default:
        return <span className="text-[11px] text-[#94A3B8] font-medium">Offline</span>;
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Live Workforce Telemetry Matrix
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Real-time activity sync, idle detection monitoring, and individual developer telemetry inspection
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('admin-policies')}
          className="glass-control flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-white/80"
        >
          <Sliders size={14} className="text-[#158AF4]" />
          <span>Configure Policies & Exceptions</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-3.5 sm:p-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
            >
              <option value="all">All Statuses ({employees.length})</option>
              <option value="active">Active Now</option>
              <option value="idle">Idle Inactive</option>
              <option value="break">On Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Employee Matrix Table */}
      <GlassCard className="p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                <th className="py-2.5 px-2 font-semibold">Employee</th>
                <th className="py-2.5 px-2 font-semibold">Department</th>
                <th className="py-2.5 px-2 font-semibold">Status</th>
                <th className="py-2.5 px-2 font-semibold">Login</th>
                <th className="py-2.5 px-2 font-semibold">Active Time</th>
                <th className="py-2.5 px-2 font-semibold">Idle Time</th>
                <th className="py-2.5 px-2 font-semibold">Score</th>
                <th className="py-2.5 px-2 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
              {filteredEmployees.map((emp, idx) => {
                const activeHrs = (emp.activeSeconds / 3600).toFixed(1) + 'h';
                const idleHrs = (emp.idleSeconds / 60).toFixed(0) + 'm';
                return (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`hover:bg-white/60 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                      idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          id={emp.id}
                          name={emp.name}
                          size="sm"
                          status={emp.status}
                        />
                        <div>
                          <div className="text-[13px] font-semibold text-[#0F172A] dark:text-white leading-tight">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-mono">
                            {emp.employeeId} · {emp.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2">
                      <span className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                        {emp.department}
                      </span>
                    </td>

                    <td className="py-2.5 px-2">{getStatusChip(emp.status)}</td>
                    <td className="py-2.5 px-2 font-mono text-xs text-[#475569] dark:text-[#94A3B8]">{emp.loginTime}</td>
                    <td className="py-2.5 px-2 font-mono text-xs text-[#288F3D] font-semibold">{activeHrs}</td>
                    <td className="py-2.5 px-2 font-mono text-xs text-[#F3740F]">{idleHrs}</td>
                    <td className="py-2.5 px-2 font-mono text-xs text-[#0F172A] dark:text-white font-bold">{emp.productivityScore}%</td>

                    <td className="py-2.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(emp);
                        }}
                        className="p-1.5 rounded-lg glass-control text-[#475569] hover:text-[#0F172A]"
                        title="Inspect telemetry"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detailed Inspection Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
};
