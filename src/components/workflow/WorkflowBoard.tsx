import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  CheckSquare,
  User,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import { TaskPriority, TaskStatus } from '../../types';

export const WorkflowBoard: React.FC = () => {
  const { tasks, updateTaskStatus, addTask, currentUser, employees } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('Product Engineering');
  const [newDepartment, setNewDepartment] = useState(currentUser.department);
  const [newAssignedTo, setNewAssignedTo] = useState(currentUser.employeeId);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('Today, 06:00 PM');
  const [newEstimatedHours, setNewEstimatedHours] = useState(2.5);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedEmp = employees.find((emp) => emp.employeeId === newAssignedTo) || currentUser;

    addTask({
      title: newTitle.trim(),
      project: newProject,
      department: newDepartment,
      assignedTo: assignedEmp.employeeId,
      assignedToName: assignedEmp.name,
      assignedToAvatar: assignedEmp.avatar,
      status: 'todo',
      priority: newPriority,
      dueDate: newDueDate,
      estimatedHours: Number(newEstimatedHours),
      spentHours: 0,
      progress: 0,
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const priorityStyles = {
    urgent: 'chip-danger',
    high: 'chip-warning',
    medium: 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950/50 dark:text-blue-300',
    low: 'bg-black/5 text-[#475569] dark:bg-white/10 dark:text-[#94A3B8]',
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesDept = selectedDept === 'all' || t.department === selectedDept;
    return matchesSearch && matchesPriority && matchesDept;
  });

  const columns: { status: TaskStatus; title: string; countColor: string }[] = [
    { status: 'todo', title: 'To Do Backlog', countColor: 'bg-black/5 dark:bg-white/10 text-[#475569] dark:text-[#94A3B8]' },
    { status: 'in_progress', title: 'In Progress Sprint', countColor: 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950/50 dark:text-blue-300' },
    { status: 'pending_approval', title: 'Pending Approval', countColor: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/50 dark:text-amber-300' },
    { status: 'completed', title: 'Completed Today', countColor: 'chip-success' },
  ];

  return (
    <div className="space-y-3.5 max-w-[1540px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-white tracking-tight">
            Workflow & Sprint Management
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Real-time task tracking, milestone logging, and employee workload assignment
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs glass-control rounded-full text-[#0F172A] dark:text-white outline-none focus:ring-1 focus:ring-[#FFE956]"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs glass-control rounded-full text-[#0F172A] dark:text-white outline-none font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs glass-control rounded-full text-[#0F172A] dark:text-white outline-none font-medium"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-yellow flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          >
            <Plus size={14} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col space-y-2.5">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                    {col.title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${col.countColor}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards Stack (Glass Well Container) */}
              <div className="space-y-3 min-h-[460px] p-3 rounded-[22px] glass-inner">
                {colTasks.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-[#94A3B8]">
                    <CheckSquare size={24} className="mb-2 opacity-40" />
                    <span className="text-xs font-medium">No tasks in this column</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <GlassCard
                      key={task.id}
                      hoverEffect
                      className="p-4 relative group cursor-pointer transition-all"
                    >
                      {/* Priority & Project Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-[6px] bg-black/5 dark:bg-white/10 text-[#475569] dark:text-[#94A3B8]">
                          {task.project}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-[6px] ${priorityStyles[task.priority]}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-[14.5px] font-semibold text-[#0F172A] dark:text-white mb-2 leading-[1.38] tracking-tight">
                        {task.title}
                      </h4>

                      {/* Rejection Alert Banner (for rejected tasks sent back to In Progress) */}
                      {col.status === 'in_progress' && task.rejectionReason && (
                        <div className="mb-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[11.5px] leading-tight flex items-start gap-1.5">
                          <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-500" />
                          <div>
                            <span className="font-semibold block mb-0.5">Admin Note ({task.reviewedBy || 'Admin'}):</span>
                            <span className="text-[11px]">{task.rejectionReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Pending Approval Badge & Subtitle */}
                      {col.status === 'pending_approval' && (
                        <div className="mb-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#B45309] dark:text-amber-300 text-[11.5px] leading-tight flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Clock size={12} className="text-amber-500" />
                            Pending Admin Review
                          </span>
                          <span className="text-[10.5px] opacity-80 font-mono">
                            {task.submittedAt || 'Submitted recently'}
                          </span>
                        </div>
                      )}

                      {/* Completed Details */}
                      {col.status === 'completed' && task.reviewedBy && (
                        <div className="mb-2.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#1F7A35] dark:text-emerald-300 text-[11px] flex items-center gap-1 font-medium">
                          <CheckCircle2 size={12} />
                          <span>Approved by {task.reviewedBy}</span>
                          {task.reviewedAt && <span className="text-[10px] opacity-75 font-mono ml-auto">{task.reviewedAt}</span>}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-xs text-[#475569] dark:text-[#94A3B8]">
                          <span>Sprint Progress</span>
                          <span className="font-mono font-semibold">{task.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full rounded-full ${
                              task.status === 'completed'
                                ? 'bg-[#288F3D]'
                                : task.status === 'pending_approval'
                                ? 'bg-[#D97706]'
                                : 'bg-[#158AF4]'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Time Tracking Info & Assignee */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/10 text-xs text-[#475569] dark:text-[#94A3B8]">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock size={13} className="text-[#94A3B8]" />
                          <span>{task.spentHours}h / {task.estimatedHours}h</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <UserAvatar
                            id={task.assignedTo}
                            name={task.assignedToName}
                            size="sm"
                          />
                          <span className="text-[11px] font-medium text-[#0F172A] dark:text-white">
                            {task.assignedToName.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Transition Buttons */}
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-black/5 dark:border-white/10 flex items-center justify-between gap-1.5">
                        {col.status === 'todo' && (
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="text-[11px] px-2.5 py-1 rounded bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950/50 dark:text-blue-300 font-semibold transition-colors flex items-center gap-1 ml-auto cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900"
                          >
                            <span>Start Work</span>
                            <ArrowRight size={11} />
                          </button>
                        )}

                        {col.status === 'in_progress' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task.id, 'todo')}
                              className="text-[11px] px-2.5 py-1 rounded glass-control text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft size={11} />
                              <span>To Do</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task.id, 'pending_approval')}
                              className="text-[11px] px-2.5 py-1 rounded bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/50 dark:text-amber-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900"
                            >
                              <span>Submit for Approval</span>
                              <ArrowRight size={11} />
                            </button>
                          </>
                        )}

                        {col.status === 'pending_approval' && (
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="text-[11px] px-2.5 py-1 rounded glass-control text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft size={11} />
                            <span>Withdraw (In Progress)</span>
                          </button>
                        )}

                        {col.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, 'todo')}
                            className="text-[11px] px-2.5 py-1 rounded glass-control text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeft size={11} />
                            <span>Reopen</span>
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create & Assign Sprint Task"
        subtitle="Add a trackable sprint deliverable to employee workflow"
      >
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g., Prepare weekly project documentation & client sync"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none focus:ring-1 focus:ring-[#FFE956]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Project Domain
              </label>
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
              >
                <option value="Product Engineering">Product Engineering</option>
                <option value="Design System 2026">Design System 2026</option>
                <option value="Analytics Suite">Analytics Suite</option>
                <option value="Compliance & Security">Compliance & Security</option>
                <option value="Operations & Support">Operations & Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Assignee
              </label>
              <select
                value={newAssignedTo}
                onChange={(e) => setNewAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId} · {emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Department
              </label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value as any)}
                className="w-full px-3 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={newEstimatedHours}
                onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-1">
              Due Date / Slot
            </label>
            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="e.g., Today, 06:00 PM"
              className="w-full px-3.5 py-2 text-xs glass-control rounded-xl text-[#0F172A] dark:text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl glass-control text-[#475569] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-yellow px-4 py-2 text-xs font-semibold rounded-xl"
            >
              Create & Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
