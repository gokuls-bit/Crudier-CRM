import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { DollarSign, Activity, CheckSquare, Users, Star } from 'lucide-react';

const mockRevenueTrend = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 49000 },
  { name: 'Apr', value: 63000 },
  { name: 'May', value: 58000 },
  { name: 'Jun', value: 72000 },
];

const mockDeptDistribution = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales & Marketing', value: 30 },
  { name: 'Design', value: 15 },
  { name: 'HR & Ops', value: 10 },
];

const mockApprovals = [
  { id: '1', title: 'Hire Senior Lead Engineer', type: 'Budget Approval', status: 'Pending', requestedBy: 'CTO' },
  { id: '2', title: 'Q2 Marketing Agency Retainer', type: 'Expense Approval', status: 'Pending', requestedBy: 'CMO' },
  { id: '3', title: 'Enterprise Hubspot Subscription', type: 'Tool SaaS Approval', status: 'Pending', requestedBy: 'VP Sales' },
];

export const ExecutiveDashboard = () => {
  const approvalColumns = [
    { key: 'title', label: 'Proposal Title' },
    { key: 'type', label: 'Category' },
    { key: 'requestedBy', label: 'Requested By' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge variant="amber">{val}</Badge>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Executive Leadership Command" 
        description="Bird's-eye metrics, corporate pipeline, and company-wide department health overview."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Revenue Pipeline" value="$1,248,500" trend="+14.2% MoM" trendType="up" icon={DollarSign} />
        <StatCard title="Org Attendance Rate" value="96.4%" trend="+0.8% vs last week" trendType="up" icon={Activity} />
        <StatCard title="All-Dept Task Completion" value="84.2%" trend="-2.1% MoM" trendType="down" icon={CheckSquare} />
        <StatCard title="Corporate Headcount" value="48 Active" trend="3 pending hires" trendType="up" icon={Users} />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 Outfit">6-Month Revenue Pipeline Trend</h3>
            <span className="text-xs text-slate-500 font-medium">USD Value Accumulation</span>
          </div>
          <AreaChart data={mockRevenueTrend} height={260} color="#8b5cf6" />
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Team Headcount Distribution</h3>
          <DonutChart data={mockDeptDistribution} height={260} />
        </div>
      </div>

      {/* Pending Approvals Summary */}
      <div className="glass-card p-5 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Pending Executive Approvals</h3>
          <Badge variant="brand">{mockApprovals.length} Requests</Badge>
        </div>
        <Table columns={approvalColumns} data={mockApprovals} />
      </div>
    </div>
  );
};
export default ExecutiveDashboard;
