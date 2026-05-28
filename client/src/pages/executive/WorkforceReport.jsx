import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Users, Clock, Award, AlertCircle } from 'lucide-react';

const mockProductivity = [
  { id: '1', name: 'Dev Team', headcount: 14, attendance: '97.2%', tasksDone: '42/48', score: '94/100' },
  { id: '2', name: 'Design Team', headcount: 6, attendance: '94.5%', tasksDone: '18/22', score: '88/100' },
  { id: '3', name: 'Sales Force', headcount: 10, attendance: '98.0%', tasksDone: '28/30', score: '96/100' },
  { id: '4', name: 'Ops & Support', headcount: 8, attendance: '91.2%', tasksDone: '15/20', score: '79/100' },
];

const mockAlerts = [
  { member: 'John Smith (Ops)', reason: '3 Consecutive Absences', severity: 'High' },
  { member: 'Jane Doe (Dev)', reason: 'Repeated Late Check-Ins (4x)', severity: 'Medium' },
  { member: 'Dave Jones (Support)', reason: 'Low Productivity score trend', severity: 'Low' },
];

export const WorkforceReport = () => {
  const columns = [
    { key: 'name', label: 'Department / Team', sortable: true },
    { key: 'headcount', label: 'Headcount', sortable: true },
    { key: 'attendance', label: 'Attendance Rate', sortable: true },
    { key: 'tasksDone', label: 'Tasks Completed' },
    { 
      key: 'score', 
      label: 'Team Health Score',
      render: (val) => <span className="font-bold text-slate-100">{val}</span>
    },
  ];

  const alertColumns = [
    { key: 'member', label: 'Employee Name' },
    { key: 'reason', label: 'Flagged Activity / Pattern' },
    { 
      key: 'severity', 
      label: 'Severity',
      render: (val) => (
        <Badge variant={val === 'High' ? 'rose' : (val === 'Medium' ? 'amber' : 'slate')}>
          {val}
        </Badge>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Workforce Report & HR Analytics" 
        description="Monitor staff attendance rates, productivity metrics and employee activity logs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Company Attendance" value="95.2%" trend="+0.4% MoM" trendType="up" icon={Clock} />
        <StatCard title="Total Employees" value="38 active staff" trend="+2 hired Q2" trendType="up" icon={Users} />
        <StatCard title="Company Health Score" value="89/100" trend="Good tier status" trendType="up" icon={Award} />
        <StatCard title="Active HR Flags" value="3 Alerts" trend="Actions required" trendType="down" icon={AlertCircle} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Departmental Health & Productivity Comparison</h3>
        <Table columns={columns} data={mockProductivity} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">HR Flag Alerts (Absence / Late Triggers)</h3>
        <Table columns={alertColumns} data={mockAlerts} />
      </div>
    </div>
  );
};
export default WorkforceReport;
