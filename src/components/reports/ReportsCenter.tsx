import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Users,
  Activity,
  Clock,
  Coffee,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { formatSecondsToHoursMins } from '../../utils/productivity';

type SortField = 'name' | 'department' | 'loginTime' | 'activeSeconds' | 'idleSeconds' | 'breakSeconds' | 'productivityScore' | 'compliance';
type SortDirection = 'asc' | 'desc';

export const ReportsCenter: React.FC = () => {
  const { employees, addToast } = useApp();

  // Filter states
  const [reportType, setReportType] = useState('daily_productivity');
  
  const [selectedDept, setSelectedDept] = useState('all');
  const [dateRange, setDateRange] = useState('this_week');
  const [customFrom, setCustomFrom] = useState('2026-10-01');
  const [customTo, setCustomTo] = useState('2026-10-05');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('productivityScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Export loading state
  const [exportingFormat, setExportingFormat] = useState<'CSV' | 'Excel' | 'PDF' | null>(null);

  // Custom date validation
  const isCustomDateValid = useMemo(() => {
    if (dateRange !== 'custom') return true;
    if (!customFrom || !customTo) return false;
    return new Date(customFrom) <= new Date(customTo);
  }, [dateRange, customFrom, customTo]);

  // Dynamic Multiplier based on Date Range
  const dateMultiplier = useMemo(() => {
    switch (dateRange) {
      case 'today':
        return 1.0;
      case 'this_week':
        return 1.0;
      case 'this_month':
        return 1.05;
      case 'last_7_days':
        return 0.98;
      case 'last_30_days':
        return 1.02;
      case 'custom':
        return 1.0;
      default:
        return 1.0;
    }
  }, [dateRange]);

  // Filtered and Sorted Employee Records
  const filteredEmployees = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    const filtered = employees.filter((emp) => {
      const matchDept = selectedDept === 'all' || emp.department.toLowerCase() === selectedDept.toLowerCase();
      const matchSearch = 
        !searchLower ||
        emp.name.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower);

      return matchDept && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'department':
          aVal = a.department.toLowerCase();
          bVal = b.department.toLowerCase();
          break;
        case 'loginTime':
          aVal = a.loginTime;
          bVal = b.loginTime;
          break;
        case 'activeSeconds':
          aVal = a.activeSeconds;
          bVal = b.activeSeconds;
          break;
        case 'idleSeconds':
          aVal = a.idleSeconds;
          bVal = b.idleSeconds;
          break;
        case 'breakSeconds':
          aVal = a.breakSeconds;
          bVal = b.breakSeconds;
          break;
        case 'productivityScore':
          aVal = a.productivityScore;
          bVal = b.productivityScore;
          break;
        case 'compliance':
          aVal = a.productivityScore >= 85 ? 3 : a.productivityScore >= 75 ? 2 : 1;
          bVal = b.productivityScore >= 85 ? 3 : b.productivityScore >= 75 ? 2 : 1;
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, selectedDept, searchTerm, sortField, sortDirection]);

  // Dynamic Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (filteredEmployees.length === 0) {
      return {
        totalEmployees: 0,
        avgProductivity: 0,
        totalActiveHours: '0.0h',
        totalIdleHours: '0m',
        totalBreakHours: '0m',
        complianceRate: 0,
      };
    }

    const totalActiveSec = filteredEmployees.reduce((acc, emp) => acc + emp.activeSeconds, 0);
    const totalIdleSec = filteredEmployees.reduce((acc, emp) => acc + emp.idleSeconds, 0);
    const totalBreakSec = filteredEmployees.reduce((acc, emp) => acc + emp.breakSeconds, 0);
    const avgScore = Math.round(
      filteredEmployees.reduce((acc, emp) => acc + emp.productivityScore, 0) / filteredEmployees.length
    );
    const compliantCount = filteredEmployees.filter((emp) => emp.productivityScore >= 75).length;
    const complianceRate = Math.round((compliantCount / filteredEmployees.length) * 100);

    return {
      totalEmployees: filteredEmployees.length,
      avgProductivity: avgScore,
      totalActiveHours: `${(totalActiveSec / 3600).toFixed(1)}h`,
      totalIdleHours: totalIdleSec >= 3600 ? `${(totalIdleSec / 3600).toFixed(1)}h` : `${Math.floor(totalIdleSec / 60)}m`,
      totalBreakHours: totalBreakSec >= 3600 ? `${(totalBreakSec / 3600).toFixed(1)}h` : `${Math.floor(totalBreakSec / 60)}m`,
      complianceRate,
    };
  }, [filteredEmployees]);

  // Category Information
  const categoryMeta = useMemo(() => {
    switch (reportType) {
      case 'idle_audit':
        return {
          title: 'Idle Time & Inactivity Audit',
          formula: 'Audit Formula: Excess Inactivity = Total Idle Seconds - 45m Policy Grace Threshold',
          badge: 'Compliance Audit',
        };
      case 'punch_attendance':
        return {
          title: 'Biometric Punch & Attendance Report',
          formula: 'Attendance Formula: Standard 9h Shift (09:00 AM - 06:00 PM) with ±15m Grace Window',
          badge: 'Biometric Sync',
        };
      case 'team_performance':
        return {
          title: 'Department Ranking & Efficiency Audit',
          formula: 'Efficiency Formula: Weighted Task Velocity (60%) + Active Engagement (40%)',
          badge: 'Department Velocity',
        };
      case 'workflow_efficiency':
        return {
          title: 'Workflow & Task Completion Report',
          formula: 'Workflow Formula: Completed Story Points / Estimated Sprint Capacity',
          badge: 'Sprint Velocity',
        };
      case 'daily_productivity':
      default:
        return {
          title: 'Daily Productivity & Activity Report',
          formula: 'Standard Formula: Total Login - Idle Duration - Breaks = Productive Time',
          badge: 'Standard Intelligence',
        };
    }
  }, [reportType]);

  // Toggle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setReportType('daily_productivity');
    setSelectedDept('all');
    setDateRange('this_week');
    setCustomFrom('2026-10-01');
    setCustomTo('2026-10-05');
    setSearchTerm('');
    setSortField('productivityScore');
    setSortDirection('desc');
    addToast('Filters Reset', 'Restored default filter settings and full workforce dataset.', 'info');
  };

  // Build Export Table Data
  const generateExportDataset = () => {
    const headers = [
      'Employee',
      'Employee ID',
      'Department',
      'Role',
      'Login Time',
      'Logout Time',
      'Active Time',
      'Idle Time',
      'Break Time',
      'Productivity Score',
      'Compliance'
    ];

    const rows = filteredEmployees.map((emp) => [
      emp.name,
      emp.employeeId,
      emp.department,
      emp.role,
      emp.loginTime,
      emp.logoutTime || 'In Progress',
      (emp.activeSeconds / 3600).toFixed(1) + 'h',
      Math.floor(emp.idleSeconds / 60) + 'm',
      Math.floor(emp.breakSeconds / 60) + 'm',
      `${emp.productivityScore}%`,
      emp.productivityScore >= 85 ? 'Optimal' : emp.productivityScore >= 75 ? 'Satisfactory' : 'Audit Required'
    ]);

    return { headers, rows };
  };

  // Handle Export Action
  const handleExport = async (format: 'CSV' | 'Excel' | 'PDF') => {
    if (filteredEmployees.length === 0) {
      addToast('No Data to Export', 'Please adjust your filter criteria to include at least one employee record.', 'warning');
      return;
    }

    if (!isCustomDateValid) {
      addToast('Invalid Date Range', 'Please ensure From date is prior to or equal to To date.', 'warning');
      return;
    }

    setExportingFormat(format);

    // Short simulated delay for smooth UI feedback and robust Blob packaging
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      const { headers, rows } = generateExportDataset();
      const dateStamp = '2026-10-05';
      const filename = `flowsphere-report-${dateStamp}`;

      const datePeriodLabel = dateRange === 'custom' 
        ? `${customFrom} to ${customTo}` 
        : dateRange.replace('_', ' ').toUpperCase();

      const metaInfo = [
        { label: 'Category', value: categoryMeta.title },
        { label: 'Department', value: selectedDept === 'all' ? 'ALL DEPARTMENTS' : selectedDept.toUpperCase() },
        { label: 'Period', value: datePeriodLabel },
        { label: 'Total Records', value: `${filteredEmployees.length} Employees` },
        { label: 'Avg Productivity', value: `${summaryMetrics.avgProductivity}%` },
      ];

      let success = false;

      if (format === 'CSV') {
        success = exportToCSV(filename, headers, rows);
        if (success) {
          addToast('CSV Downloaded', `Generated ${filename}.csv with ${filteredEmployees.length} records.`, 'success');
        }
      } else if (format === 'Excel') {
        success = exportToExcel(filename, headers, rows, 'Workforce Intelligence');
        if (success) {
          addToast('Excel Report Downloaded', `Generated ${filename}.xlsx with ${filteredEmployees.length} records.`, 'success');
        }
      } else if (format === 'PDF') {
        success = exportToPDF(
          filename,
          `FlowSphere Intelligence — ${categoryMeta.title.toUpperCase()}`,
          headers,
          rows,
          metaInfo
        );
        if (success) {
          addToast('PDF Report Downloaded', `Generated ${filename}.pdf with professional styling.`, 'success');
        }
      }

      if (!success) {
        addToast('Export Error', 'Unable to generate report. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Export Failed:', err);
      addToast('Export Error', 'Unable to generate report. Please try again.', 'error');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[1540px] mx-auto pb-4">
      {/* Header with Aligned Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Reports & Export Intelligence
            </h2>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE956]/30 text-amber-950 dark:text-amber-300 border border-amber-400/30">
              {categoryMeta.badge}
            </span>
          </div>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Filter, audit, and generate real downloadable reports across workforce datasets
          </p>
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Export CSV - Primary Yellow */}
          <button
            type="button"
            id="btn-export-csv"
            disabled={exportingFormat !== null}
            onClick={() => handleExport('CSV')}
            className="btn-yellow h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            title="Download formatted RFC-compliant CSV spreadsheet"
          >
            {exportingFormat === 'CSV' ? (
              <>
                <Loader2 size={15} className="animate-spin text-slate-900" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Export CSV</span>
              </>
            )}
          </button>

          {/* Excel Export - Clean Light Surface */}
          <button
            type="button"
            id="btn-export-excel"
            disabled={exportingFormat !== null}
            onClick={() => handleExport('Excel')}
            className="glass-control h-10 px-4 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white flex items-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm disabled:opacity-60 disabled:pointer-events-none"
            title="Download real Microsoft Excel .xlsx workbook"
          >
            {exportingFormat === 'Excel' ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#288F3D]" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={15} className="text-[#288F3D]" />
                <span>Excel</span>
              </>
            )}
          </button>

          {/* PDF Export - Clean Light Surface */}
          <button
            type="button"
            id="btn-export-pdf"
            disabled={exportingFormat !== null}
            onClick={() => handleExport('PDF')}
            className="glass-control h-10 px-4 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white flex items-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm disabled:opacity-60 disabled:pointer-events-none"
            title="Generate and download high-resolution PDF report"
          >
            {exportingFormat === 'PDF' ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#F3740F]" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileText size={15} className="text-[#F3740F]" />
                <span>PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <GlassCard className="p-3.5 sm:p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Report Category
              </label>
              <select
                id="filter-category"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full h-9 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium transition-colors"
              >
                <option value="daily_productivity">Daily Productivity & Activity</option>
                <option value="idle_audit">Idle Time & Inactivity Audit</option>
                <option value="punch_attendance">Biometric Punch & Attendance</option>
                <option value="team_performance">Department Ranking & Efficiency</option>
                <option value="workflow_efficiency">Workflow & Task Completion</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Department
              </label>
              <select
                id="filter-department"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full h-9 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium transition-colors"
              >
                <option value="all">All Departments ({employees.length} Staff)</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {/* Date Period Dropdown */}
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Date Period
              </label>
              <select
                id="filter-date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-9 px-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium transition-colors"
              >
                <option value="today">Today (Oct 05, 2026)</option>
                <option value="this_week">This Week (Sprint Cycle)</option>
                <option value="this_month">Current Month (October 2026)</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {/* Search Employee */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8]">
                  Search Employee
                </label>
                {(searchTerm || selectedDept !== 'all' || dateRange !== 'this_week' || reportType !== 'daily_productivity') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={10} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  id="search-employee-input"
                  placeholder="Search name, ID (e.g. FS-1001)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none placeholder-[#94A3B8]"
                />
              </div>
            </div>
          </div>

          {/* Custom Date Pickers (Shown only when dateRange === 'custom') */}
          {dateRange === 'custom' && (
            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-[#475569] dark:text-[#94A3B8]">From:</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 px-2.5 text-xs glass-control rounded-lg text-[#0F172A] dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-[#475569] dark:text-[#94A3B8]">To:</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 px-2.5 text-xs glass-control rounded-lg text-[#0F172A] dark:text-white outline-none"
                />
              </div>

              {!isCustomDateValid && (
                <div className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                  <AlertCircle size={13} />
                  <span>'From' date must be prior to or equal to 'To' date.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Dynamic Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <Users size={14} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Employees</span>
          </div>
          <div className="text-lg font-bold text-[#0F172A] dark:text-white">
            {summaryMetrics.totalEmployees}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <Activity size={14} className="text-[#288F3D]" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Score</span>
          </div>
          <div className="text-lg font-bold text-[#288F3D]">
            {summaryMetrics.avgProductivity}%
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <Clock size={14} className="text-[#158AF4]" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Time</span>
          </div>
          <div className="text-lg font-bold text-[#0F172A] dark:text-white">
            {summaryMetrics.totalActiveHours}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <Clock size={14} className="text-[#F3740F]" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Idle</span>
          </div>
          <div className="text-lg font-bold text-[#F3740F]">
            {summaryMetrics.totalIdleHours}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <Coffee size={14} className="text-[#8B5CF6]" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Break Time</span>
          </div>
          <div className="text-lg font-bold text-[#0F172A] dark:text-white">
            {summaryMetrics.totalBreakHours}
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] mb-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Compliance</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {summaryMetrics.complianceRate}%
          </div>
        </GlassCard>
      </div>

      {/* Generated Report Table Card */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-black/5 dark:border-white/10">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <span>Data Preview ({filteredEmployees.length} Records)</span>
            </h3>
            <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
              {categoryMeta.formula}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#288F3D] font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-[#288F3D] live-dot animate-pulse" />
              <span>● Live Synchronized Dataset</span>
            </div>
          </div>
        </div>

        {/* Data Table with Column Sorting */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                {/* Employee Column */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Employee</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Department Column */}
                <th 
                  onClick={() => handleSort('department')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {sortField === 'department' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Login Time Column */}
                <th 
                  onClick={() => handleSort('loginTime')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Login</span>
                    {sortField === 'loginTime' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Active Time Column */}
                <th 
                  onClick={() => handleSort('activeSeconds')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Active</span>
                    {sortField === 'activeSeconds' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Idle Time Column */}
                <th 
                  onClick={() => handleSort('idleSeconds')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Idle</span>
                    {sortField === 'idleSeconds' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Break Time Column */}
                <th 
                  onClick={() => handleSort('breakSeconds')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Break</span>
                    {sortField === 'breakSeconds' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Productivity Score Column */}
                <th 
                  onClick={() => handleSort('productivityScore')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Score</span>
                    {sortField === 'productivityScore' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Compliance Column */}
                <th 
                  onClick={() => handleSort('compliance')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#0F172A] dark:hover:text-white transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Compliance</span>
                    {sortField === 'compliance' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-amber-500" /> : <ArrowDown size={13} className="text-amber-500" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Search size={20} />
                      </div>
                      <p className="font-semibold text-sm text-[#0F172A] dark:text-white">
                        No employees found matching filter criteria
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Try searching for a different keyword or resetting your filters.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 btn-yellow px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={13} />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const activeHrs = (emp.activeSeconds / 3600).toFixed(1) + 'h';
                  const idleHrs = Math.floor(emp.idleSeconds / 60) + 'm';
                  const breakHrs = Math.floor(emp.breakSeconds / 60) + 'm';
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors ${
                        idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            id={emp.id}
                            name={emp.name}
                            size="sm"
                            status={emp.status}
                          />
                          <div>
                            <div className="font-semibold text-[#0F172A] dark:text-white leading-tight">{emp.name}</div>
                            <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-mono">{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#475569] dark:text-[#94A3B8]">
                        {emp.loginTime}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#288F3D] font-semibold text-center">
                        {activeHrs}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#F3740F] text-center">
                        {idleHrs}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#158AF4] text-center">
                        {breakHrs}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#0F172A] dark:text-white font-semibold text-center">
                        {emp.productivityScore}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <StatusChip
                          status={emp.productivityScore >= 85 ? 'passed' : emp.productivityScore >= 75 ? 'active' : 'warning'}
                          label={emp.productivityScore >= 85 ? 'Optimal' : emp.productivityScore >= 75 ? 'Satisfactory' : 'Audit'}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

