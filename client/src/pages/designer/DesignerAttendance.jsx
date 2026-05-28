import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Clock, Calendar } from 'lucide-react';

const mockLogs = [
  { date: 'May 28, 2026', checkIn: '08:50 AM', checkOut: '05:35 PM', status: 'Present', hours: 8.5 },
  { date: 'May 27, 2026', checkIn: '09:05 AM', checkOut: '05:40 PM', status: 'Present', hours: 8.5 },
  { date: 'May 26, 2026', checkIn: '09:55 AM', checkOut: '06:10 PM', status: 'Late', hours: 8.0 },
];

export const DesignerAttendance = () => {
  const [logs] = useState(mockLogs);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check-In Time' },
    { key: 'checkOut', label: 'Check-Out Time' },
    { 
      key: 'status', 
      label: 'Status badge',
      render: (val) => (
        <Badge variant={val === 'Present' ? 'emerald' : (val === 'Late' ? 'amber' : 'rose')}>
          {val}
        </Badge>
      )
    },
    { key: 'hours', label: 'Total Hours' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="My Attendance Logs" 
        description="Review personal history logs, check-in thresholds and total productive hours."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard title="Total Present Days" value="3 Days" icon={Calendar} />
        <StatCard title="Total Logged Hours" value="25.0 Hrs" icon={Clock} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Check-In History</h3>
        <Table columns={columns} data={logs} />
      </div>
    </div>
  );
};
export default DesignerAttendance;
