import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Clock, AlertCircle, Calendar } from 'lucide-react';

const mockDailyGrid = [
  { name: 'Jane Doe', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'Present', hours: 8.5 },
  { name: 'Alice Vance', checkIn: '09:48 AM', checkOut: '06:00 PM', status: 'Late', hours: 8.2 },
  { name: 'John Smith', checkIn: '09:12 AM', checkOut: '05:45 PM', status: 'Present', hours: 8.5 },
];

export const TeamAttendance = () => {
  const columns = [
    { key: 'name', label: 'Team Member Name', sortable: true },
    { key: 'checkIn', label: 'Check-In' },
    { key: 'checkOut', label: 'Check-Out' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'Present' ? 'emerald' : (val === 'Late' ? 'amber' : 'rose')}>
          {val}
        </Badge>
      )
    },
    { key: 'hours', label: 'Hours Logged' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Department Attendance Logs" 
        description="Daily login logs, check-in thresholds and productivity totals for department team members."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Active Team Present" value="3 Members" icon={Calendar} />
        <StatCard title="Team Late Arrivals" value="1 Flagged" icon={AlertCircle} />
        <StatCard title="Work Hours Logged" value="25.2 Hrs" icon={Clock} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Today's Check-In Status</h3>
        <Table columns={columns} data={mockDailyGrid} />
      </div>
    </div>
  );
};
export default TeamAttendance;
