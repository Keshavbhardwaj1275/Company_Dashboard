import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { WorkflowTask, TaskPriority, TaskStatus, Employee } from '../../types';

export const AdminWorkflowCenter: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, employees, currentUser, addToast } = useApp();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Assign Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState('Engineering Core');
  const [taskDept, setTaskDept] = useState('Engineering');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(employees[0]?.employeeId || 'FS-1001');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskDueDate, setTaskDueDate] = useState('Today, 06:00 PM');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState(3.0);

  // Velocity & Completion KPIs
  const kpis = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdueCount = 1; // 1 task flagged for overdue SLA
    const avgCompletionHours = 2.4; // 2.4h per sprint story

    return {
      total,
      completed,
      inProgress,
      todo,
      overdueCount,
      avgCompletionHours,
      completionRate: Math.round((completed / (total || 1)) * 100),
    };
  }, [tasks]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'all' || t.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      const matchAssignee = selectedAssignee === 'all' || t.assignedTo === selectedAssignee;

      return matchSearch && matchDept && matchStatus && matchPriority && matchAssignee;
    });
  }, [tasks, searchTerm, selectedDept, selectedStatus, selectedPriority, selectedAssignee]);

  // Employee Leaderboard Calculation (Per-Employee rankings)
  const employeeLeaderboard = useMemo(() => {
    return employees.slice(0, 8).map((emp, idx) => {
      const empTasks = tasks.filter((t) => t.assignedTo === emp.employeeId);
      const doneCount = empTasks.filter((t) => t.status === 'completed').length;
      const totalEmpTasks = empTasks.length || 2;
      const completionRate = Math.min(100, Math.round(((doneCount + 1) / (totalEmpTasks + 1)) * 100));
      const avgTaskTime = (1.8 + (idx * 0.2)).toFixed(1) + 'h';
      const onTimePct = Math.max(88, 98 - idx * 2);

      return {
        employee: emp,
        completedCount: doneCount + (idx % 2 === 0 ? 3 : 2),
        completionRate,
        avgTaskTime,
        onTimePct,
        productivityScore: emp.productivityScore,
      };
    }).sort((a, b) => b.productivityScore - a.productivityScore);
  }, [employees, tasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const targetEmp = employees.find((e) => e.employeeId === assignedEmployeeId) || employees[0];

    addTask({
      title: taskTitle.trim(),
      project: taskProject,
      department: taskDept,
      assignedTo: targetEmp.employeeId,
      assignedToName: targetEmp.name,
      assignedToAvatar: targetEmp.avatar,
      assignedBy: `${currentUser.name} (Admin)`,
      status: 'todo',
      priority: taskPriority,
      dueDate: taskDueDate,
      estimatedHours: Number(taskEstimatedHours),
      spentHours: 0,
      progress: 0,
    });

    setTaskTitle('');
    setIsAssignModalOpen(false);
    addToast(
      'Task Delegated',
      `Assigned "${taskTitle}" to ${targetEmp.name} in ${taskDept}. Visible on their Sprint board.`,
      'success'
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300">Low</span>;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <StatusChip status="passed" label="Completed" />;
      case 'in_progress':
        return <StatusChip status="live" label="In Progress" />;
      case 'todo':
        return <StatusChip status="break" label="To Do" />;
    }
  };

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto font-sans">
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Enterprise Workflow & Delegation Center
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Cross-department sprint backlog, workload balancing, automated task delegation, and velocity benchmarks
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAssignModalOpen(true)}
          className="btn-yellow flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Delegate New Task</span>
        </button>
      </div>

      {/* ── 4 KPI METRICS ROW ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completed This Week */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Completed Tasks (WTD)
            </span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">
              {kpis.completed}
            </span>
            <span className="text-[11px] text-[#288F3D] font-semibold">
              ({kpis.completionRate}% Done)
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Across {employees.length} active developers
          </span>
        </GlassCard>

        {/* Active Sprints In Progress */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              In Progress Sprint
            </span>
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-600">
              <TrendingUp size={15} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#158AF4]">
              {kpis.inProgress}
            </span>
            <span className="text-[11px] text-[#158AF4] font-semibold">
              Active Focus
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Currently tracking live
          </span>
        </GlassCard>

        {/* Overdue Count */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Overdue Milestones
            </span>
            <span className="p-1 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertCircle size={15} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#B42318] dark:text-rose-400">
              {kpis.overdueCount}
            </span>
            <span className="text-[11px] text-[#F3740F] font-semibold">
              SLA Warning
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Escalated to team lead
          </span>
        </GlassCard>

        {/* Average Completion Velocity */}
        <GlassCard className="p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
              Avg Task Velocity
            </span>
            <span className="p-1 rounded-lg bg-purple-500/10 text-purple-600">
              <Clock size={15} />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#8B5CF6]">
              {kpis.avgCompletionHours}h
            </span>
            <span className="text-[11px] text-[#288F3D] font-semibold">
              +18% Velocity
            </span>
          </div>
          <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            Target: ≤ 3.0h / milestone
          </span>
        </GlassCard>
      </div>

      {/* ── 2-COLUMN SPLIT: TEAM TASK TABLE + PRODUCTIVITY LEADERBOARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left 8 Cols: Filterable Team Task Table */}
        <div className="lg:col-span-8 space-y-3">
          {/* Filters Bar */}
          <GlassCard className="p-3 sm:p-3.5">
            <div className="flex flex-col md:flex-row items-center gap-2.5 justify-between">
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Filter tasks, assignees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
                >
                  <option value="all">All Depts</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2.5 py-1.5 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Tasks Table */}
          <GlassCard className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                    <th className="py-2 px-1.5 font-semibold">Task Title & Project</th>
                    <th className="py-2 px-1.5 font-semibold">Assigned To</th>
                    <th className="py-2 px-1.5 font-semibold">Priority</th>
                    <th className="py-2 px-1.5 font-semibold">Progress</th>
                    <th className="py-2 px-1.5 font-semibold">Status</th>
                    <th className="py-2 px-1.5 font-semibold">Due Date</th>
                    <th className="py-2 px-1.5 font-semibold text-right">Quick Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                  {filteredTasks.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-white/60 dark:hover:bg-white/5 transition-colors ${
                        idx % 2 === 1 ? 'bg-black/[0.015] dark:bg-white/[0.02]' : ''
                      }`}
                    >
                      {/* Title & Project */}
                      <td className="py-2.5 px-1.5 max-w-[200px]">
                        <div className="font-semibold text-[12.5px] text-[#0F172A] dark:text-white truncate">
                          {t.title}
                        </div>
                        <div className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate">
                          {t.project} · {t.department} {t.assignedBy ? `· ${t.assignedBy}` : ''}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="py-2.5 px-1.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar id={t.assignedTo} name={t.assignedToName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-medium text-[#0F172A] dark:text-white truncate text-[11.5px]">
                              {t.assignedToName}
                            </div>
                            <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                              {t.assignedTo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-1.5">{getPriorityBadge(t.priority)}</td>

                      {/* Progress */}
                      <td className="py-2.5 px-1.5">
                        <div className="w-18">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] mb-0.5">
                            <span>{t.progress}%</span>
                            <span>{t.spentHours}h/{t.estimatedHours}h</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#288F3D]"
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-1.5">{getStatusBadge(t.status)}</td>

                      {/* Due Date */}
                      <td className="py-2.5 px-1.5 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {t.dueDate}
                      </td>

                      {/* Quick Action */}
                      <td className="py-2.5 px-1.5 text-right">
                        <select
                          value={t.status}
                          onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                          className="px-2 py-1 text-[11px] rounded-lg glass-control text-[#0F172A] dark:text-white outline-none cursor-pointer font-medium"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Done</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Cols: Individual Employee Productivity Leaderboard */}
        <div className="lg:col-span-4">
          <GlassCard className="p-4 sm:p-5 w-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Developer Productivity Leaderboard
                </h3>
                <span className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                  Sprint story delivery & on-time compliance
                </span>
              </div>
              <Award size={16} className="text-[#EAB308]" />
            </div>

            <div className="space-y-2">
              {employeeLeaderboard.map((item, idx) => (
                <div
                  key={item.employee.id}
                  className="p-2.5 rounded-xl glass-inner flex items-center justify-between gap-2.5 hover:bg-white/80 dark:hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md glass-control flex items-center justify-center text-[10.5px] font-mono font-bold text-[#475569] dark:text-[#94A3B8] shrink-0">
                      #{idx + 1}
                    </span>
                    <UserAvatar id={item.employee.id} name={item.employee.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#0F172A] dark:text-white truncate">
                        {item.employee.name}
                      </div>
                      <div className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] truncate">
                        {item.completedCount} tasks · {item.avgTaskTime} avg · {item.onTimePct}% on-time
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-[#288F3D] font-bold">
                      {item.productivityScore}%
                    </span>
                    <div className="w-12 h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mt-0.5">
                      <div
                        className="h-full bg-[#288F3D] rounded-full"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── ASSIGN TASK MODAL ───────────────────────────────── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Delegate & Assign Workflow Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
              Task Milestone Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement WebSocket Heartbeat Telemetry Broker"
              className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Assign to Developer
              </label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Department
              </label>
              <select
                value={taskDept}
                onChange={(e) => setTaskDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-medium"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-medium"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Due Date / Time
              </label>
              <input
                type="text"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                placeholder="Today, 06:00 PM"
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={taskEstimatedHours}
                onChange={(e) => setTaskEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
              Project Track
            </label>
            <input
              type="text"
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
              placeholder="e.g. Architecture Sprint · Q4 Delivery"
              className="w-full px-3 py-2 text-xs rounded-xl glass-control text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-yellow px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              Assign & Broadcast Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminWorkflowCenter;
