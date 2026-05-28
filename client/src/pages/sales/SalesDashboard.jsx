import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import BarChart from '../../components/charts/BarChart';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { DollarSign, Award, Target, Calendar } from 'lucide-react';

const mockPipelineStages = [
  { name: 'New Leads', value: 8 },
  { name: 'Contacted', value: 12 },
  { name: 'Meeting', value: 6 },
  { name: 'Proposal', value: 4 },
  { name: 'Negotiation', value: 3 },
];

const mockFollowups = [
  { id: '1', name: 'Alpha Corp Demo', time: '10:30 AM', rep: 'Alice Vance' },
  { id: '2', name: 'Beta Systems Proposal follow-up', time: '02:00 PM', rep: 'Bob Ross' },
];

export const SalesDashboard = () => {
  const columns = [
    { key: 'name', label: 'Follow-up Client / Lead' },
    { key: 'time', label: 'Reminder Time' },
    { key: 'rep', label: 'Assigned Sales Rep' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Revenue & Leads Command" 
        description="Monitor sales pipeline values, client interaction records, and closed won ratios."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Sales Pipeline Value" value="$763,500" trend="+18.2% vs last month" trendType="up" icon={DollarSign} />
        <StatCard title="Deals Won Month" value="$145,000" trend="5 deals finalized" trendType="up" icon={Award} />
        <StatCard title="Lead Conversion Rate" value="62.5%" trend="Top rep Alice" trendType="up" icon={Target} />
        <StatCard title="Follow-ups Scheduled" value="2 Reminders" trend="Required today" trendType="down" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Sales Pipeline Stage distribution</h3>
          <BarChart data={mockPipelineStages} height={240} color="#10b981" />
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Today's Follow-up Agenda</h3>
          <Table columns={columns} data={mockFollowups} emptyMessage="No followups scheduled for today." />
        </div>
      </div>
    </div>
  );
};
export default SalesDashboard;
