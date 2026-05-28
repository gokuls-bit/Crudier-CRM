import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';

const mockInitialTasks = [
  { _id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', status: 'Review', assignee: 'Jane Doe' },
  { _id: '2', title: 'Design lead dashboard layout', priority: 'High', status: 'In Progress', assignee: 'Alice Vance' },
  { _id: '3', title: 'Verify attendance late triggers', priority: 'Medium', status: 'Pending', assignee: 'John Smith' },
  { _id: '4', title: 'OAuth2 integration', priority: 'Critical', status: 'Pending', assignee: 'Jane Doe' },
  { _id: '5', title: 'PostgreSQL DB optimization', priority: 'High', status: 'Done', assignee: 'Alice Vance' },
  { _id: '6', title: 'Create automated CRM test suites', priority: 'Low', status: 'Submitted', assignee: 'John Smith' },
];

export const SprintBoard = () => {
  const user = useAuthStore(state => state.user);
  const [tasks, setTasks] = useState(mockInitialTasks);
  const [developerFilter, setDeveloperFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const columns = ['Pending', 'In Progress', 'Submitted', 'Review', 'Done'];

  const moveTask = (taskId, direction) => {
    // Only allow moves if user is Technical Lead/CTO/Founder/Admin
    const hasMoveRights = ['Founder', 'Admin', 'Team Lead', 'CTO', 'VP Engineering', 'Tech Head'].includes(user?.role);
    if (!hasMoveRights) {
      alert('Access Denied: Only Technical Leads / Executive roles can modify task statuses on the sprint board.');
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t._id === taskId) {
        const curIdx = columns.indexOf(t.status);
        const nextIdx = curIdx + direction;
        if (nextIdx >= 0 && nextIdx < columns.length) {
          return { ...t, status: columns[nextIdx] };
        }
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(t => {
    const devMatch = developerFilter === 'All' || t.assignee === developerFilter;
    const priMatch = priorityFilter === 'All' || t.priority === priorityFilter;
    return devMatch && priMatch;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Agile Sprint Kanban Board" 
        description="Visualize and track team tasks through active status columns. Drag-and-move is restricted to Team Leads+ only."
        actions={
          <div className="flex gap-2 text-xs">
            <select
              value={developerFilter}
              onChange={(e) => setDeveloperFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg glass-input border border-white/10 outline-none text-slate-300 font-semibold"
            >
              <option value="All">All Assignees</option>
              <option value="Jane Doe">Jane Doe</option>
              <option value="Alice Vance">Alice Vance</option>
              <option value="John Smith">John Smith</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg glass-input border border-white/10 outline-none text-slate-300 font-semibold"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        }
      />

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start select-none">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-200 Outfit">{col}</span>
                <Badge variant="brand">{colTasks.length}</Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                {colTasks.map(t => (
                  <div key={t._id} className="glass-card p-3.5 rounded-lg border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-slate-100 leading-normal line-clamp-2">{t.title}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <PriorityBadge priority={t.priority} />
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.assignee} size="xs" />
                      </div>
                    </div>

                    {/* Move triggers for lead role simulation */}
                    <div className="flex justify-end gap-1 border-t border-white/5 pt-2 mt-1">
                      {col !== 'Pending' && (
                        <button 
                          onClick={() => moveTask(t._id, -1)} 
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}
                      {col !== 'Done' && (
                        <button 
                          onClick={() => moveTask(t._id, 1)} 
                          className="p-1 rounded bg-brand-600/20 hover:bg-brand-600/35 text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SprintBoard;
