import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import LineChart from '../../components/charts/LineChart';
import { Clock, AlertCircle, TrendingUp } from 'lucide-react';

const mockDailyGrid = [
  { name: 'Alice Vance', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'Present', hours: 8.5 },
  { name: 'Bob Ross', checkIn: '09:48 AM', checkOut: '06:00 PM', status: 'Late', hours: 8.2 },
  { name: 'Charlie Cox', checkIn: '09:12 AM', checkOut: '05:45 PM', status: 'Present', hours: 8.5 },
  { name: 'David Smith', checkIn: '08:30 AM', checkOut: '05:00 PM', status: 'Present', hours: 8.5 },
  { name: 'Eva Green', checkIn: '--:--', checkOut: '--:--', status: 'Absent', hours: 0 },
];

const mockAlerts = [
  { name: 'Bob Ross', alert: 'Checked in late at 09:48 AM (Threshold: 09:30 AM)', type: 'Late Arrival' },
  { name: 'Eva Green', alert: 'No check-in logs submitted for today', type: 'Absent' },
];

const mockWeeklyTrend = [
  { name: 'Mon', value: 92 },
  { name: 'Tue', value: 96 },
  { name: 'Wed', value: 94 },
  { name: 'Thu', value: 98 },
  { name: 'Fri', value: 90 },
];

export const TechAttendance = () => {
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
    { key: 'hours', label: 'Total Hours Worked' },
  ];

  const alertColumns = [
    { key: 'name', label: 'Developer / Designer' },
    { key: 'type', label: 'Flag Type' },
    { 
      key: 'alert', 
      label: 'Alert Description',
      render: (val) => <span className="text-rose-400 font-semibold">{val}</span>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Developer & Designer Attendance" 
        description="Daily standup attendance grid, tracking thresholds, and late arrival alert summaries."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Team Attendance rate" value="94.2%" trend="+1.2% MoM" trendType="up" icon={Clock} />
        <StatCard title="Late Arrivals Today" value="1 Developer" trend="Bob Ross (09:48 AM)" trendType="down" icon={AlertCircle} />
        <StatCard title="Average Productive Hours" value="8.4 hrs" trend="+0.2 hrs vs last week" trendType="up" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Daily Check-In Status Grid</h3>
          <Table columns={columns} data={mockDailyGrid} />
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Weekly Productivity Trend (%)</h3>
          <LineChart data={mockWeeklyTrend} height={200} color="#06b6d4" />
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-rose-400 mb-4 Outfit">Late / Absent Flag Alerts</h3>
        <Table columns={alertColumns} data={mockAlerts} />
      </div>
    </div>
  );
};
export default TechAttendance;
