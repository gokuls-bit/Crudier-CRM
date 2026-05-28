import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import DonutChart from '../../components/charts/DonutChart';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Terminal, ShieldAlert, AlertOctagon, CheckSquare, Star } from 'lucide-react';

const mockSprintCompletion = [
  { name: 'Day 1', value: 5 },
  { name: 'Day 3', value: 15 },
  { name: 'Day 5', value: 30 },
  { name: 'Day 7', value: 55 },
  { name: 'Day 9', value: 78 },
  { name: 'Day 10', value: 92 },
];

const mockTaskPriorities = [
  { name: 'Critical', value: 4 },
  { name: 'High', value: 12 },
  { name: 'Medium', value: 18 },
  { name: 'Low', value: 8 },
];

const mockBlockedTasks = [
  { id: '1', title: 'OAuth Sign In Redirection loop', developer: 'Bob Ross', reason: 'Blocked by API endpoint CORS updates' },
  { id: '2', title: 'Stripe webhook payment validation', developer: 'Alice Vance', reason: 'Awaiting Stripe CLI webhook sandbox access' },
];

export const TechDashboard = () => {
  const columns = [
    { key: 'title', label: 'Blocked Task Title' },
    { key: 'developer', label: 'Assigned Engineer' },
    { 
      key: 'reason', 
      label: 'Blocking Reason / Dependency',
      render: (val) => <span className="text-rose-400 font-semibold">{val}</span>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Technical Operations Dashboard" 
        description="Engineering sprint completion tracking, critical task alerts, and developer sprint load distribution."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Sprint Task Completion" value="92.4%" trend="+4.2% vs last sprint" trendType="up" icon={CheckSquare} />
        <StatCard title="Critical Tasks Count" value="4 Active" trend="Requires hotfix deploy" trendType="down" icon={ShieldAlert} />
        <StatCard title="Blocked Sprint Tasks" value="2 Blocked" trend="Actions required" trendType="down" icon={AlertOctagon} />
        <StatCard title="Engineer Velocity Index" value="88.2" trend="Excellent team rating" trendType="up" icon={Terminal} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Sprint Task Completion Burndown (Burndown progress %)</h3>
          <AreaChart data={mockSprintCompletion} height={240} color="#06b6d4" />
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Sprint Task Priority distribution</h3>
          <DonutChart data={mockTaskPriorities} height={240} />
        </div>
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2 Outfit"><AlertOctagon className="w-5 h-5 text-rose-400" />Blocked Tasks Queue Alert</h3>
        <Table columns={columns} data={mockBlockedTasks} />
      </div>
    </div>
  );
};
export default TechDashboard;
