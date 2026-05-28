import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import { useAuthStore } from '../../store/auth.store';
import { CheckSquare, Clock, Bell, LogIn, LogOut } from 'lucide-react';

const mockTasks = [
  { _id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', status: 'In Progress' },
  { _id: '2', title: 'OAuth2 integration', priority: 'Critical', status: 'Pending' },
];

export const DevDashboard = () => {
  const user = useAuthStore(state => state.user);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const columns = [
    { key: 'title', label: 'Task Title' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title={`Welcome, ${user?.name || 'Developer'}`} 
        description="Monitor sprint tasks assignments, log attendance hours, and review announcements."
        actions={
          <button
            onClick={() => setIsCheckedIn(!isCheckedIn)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all Outfit ${
              isCheckedIn 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
            }`}
          >
            {isCheckedIn ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Check Out</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Check In</span>
              </>
            )}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="My Active Tasks" value={`${mockTasks.length} Assigned`} icon={CheckSquare} />
        <StatCard title="Standup Log Status" value={isCheckedIn ? 'Checked In' : 'Absent'} icon={Clock} />
        <StatCard title="Team Announcements" value="1 New Alert" icon={Bell} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Active Sprint Goals</h3>
        <Table columns={columns} data={mockTasks} />
      </div>
    </div>
  );
};
export default DevDashboard;
