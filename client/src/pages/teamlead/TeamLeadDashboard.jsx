import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { routePaths } from '../../routes/routePaths';
import { ClipboardCheck, Users, Clock, Plus } from 'lucide-react';

const mockTeamAttendance = [
  { name: 'Alice Vance', checkIn: '08:45 AM', status: 'Present' },
  { name: 'Bob Ross', checkIn: '09:48 AM', status: 'Late' },
  { name: 'Charlie Cox', checkIn: '09:12 AM', status: 'Present' },
];

export const TeamLeadDashboard = () => {
  const navigate = useNavigate();

  const columns = [
    { key: 'name', label: 'Team Member Name' },
    { key: 'checkIn', label: 'Standup Check-In Time' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'Present' ? 'emerald' : 'amber'}>
          {val}
        </Badge>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Department Lead Command" 
        description="Monitor team activities, sign off task submissions, assign sprint goals, and review check-in statistics."
        actions={
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => navigate(routePaths.LEAD_ASSIGN_TASK)}
              className="flex items-center gap-1 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold transition-all Outfit"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Active Sprint Tasks" value="8 Tasks" icon={Users} />
        <StatCard title="Standup Checkins" value="3 Present" icon={Clock} />
        <StatCard title="Pending Task Reviews" value="2 Reviews" icon={ClipboardCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Department Attendance Log</h3>
          <Table columns={columns} data={mockTeamAttendance} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center gap-4">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-slate-200 Outfit">Approve Submissions</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              You have 2 pending sprint submissions to verify and sign off.
            </p>
          </div>
          <button
            onClick={() => navigate(routePaths.LEAD_REVIEWS)}
            className="text-xs text-brand-400 font-bold hover:underline"
          >
            Open review queue
          </button>
        </div>
      </div>
    </div>
  );
};
export default TeamLeadDashboard;
