import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import { Palette, CheckSquare, Clock, LogIn, LogOut } from 'lucide-react';

const mockDesignTasks = [
  { _id: '1', title: 'Design lead dashboard layout', priority: 'High', status: 'In Progress' },
  { _id: '2', title: 'Create marketing social media assets templates', priority: 'Medium', status: 'Pending' },
];

export const DesignerDashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const columns = [
    { key: 'title', label: 'Design Goal Title' },
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
        title="Creative Design Dashboard" 
        description="Monitor design goals queue, log attendance logs, and reference brand asset guidelines."
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
        <StatCard title="Active Design Goals" value={`${mockDesignTasks.length} Assigned`} icon={Palette} />
        <StatCard title="Standup log Status" value={isCheckedIn ? 'Checked In' : 'Absent'} icon={Clock} />
        <StatCard title="Goals Completed" value="12 Completed" icon={CheckSquare} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Active Creative Deliverables</h3>
        <Table columns={columns} data={mockDesignTasks} />
      </div>
    </div>
  );
};
export default DesignerDashboard;
