import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import LineChart from '../../components/charts/LineChart';
import Table from '../../components/ui/Table';
import { DollarSign, Landmark, TrendingUp, Award } from 'lucide-react';

const mockSalesTrend = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 49000 },
  { name: 'Apr', value: 63000 },
  { name: 'May', value: 58000 },
  { name: 'Jun', value: 72000 },
];

const mockPerformers = [
  { rank: 1, name: 'Alice Vance', sales: '$240,000', leads: 15, conversion: '65%' },
  { rank: 2, name: 'Bob Ross', sales: '$180,000', leads: 12, conversion: '58%' },
  { rank: 3, name: 'Charlie Cox', sales: '$120,000', leads: 8, conversion: '50%' },
];

export const SalesAnalytics = () => {
  const columns = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Rep Name' },
    { key: 'sales', label: 'Sales Closed Value', sortable: true },
    { key: 'leads', label: 'Total Leads Assigned' },
    { key: 'conversion', label: 'Conversion %' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Sales CRM Analytics" 
        description="Monitor sales rep closed values leaderboards, monthly trends, and conversion ratings."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Deals Won" value="$540,000" trend="+12.4% MoM" trendType="up" icon={Landmark} />
        <StatCard title="Average Deal Value" value="$68,000" trend="+1.2% MoM" trendType="up" icon={DollarSign} />
        <StatCard title="Total Leads Closed" value="35 Leads" icon={TrendingUp} />
        <StatCard title="Top Conversion Rate" value="65.0%" icon={Award} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-200 Outfit">Closed Won Sales Revenue (6-Month Trend)</h3>
        <LineChart data={mockSalesTrend} height={250} color="#10b981" />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Leaderboard: Top Closed Deals Reps</h3>
        <Table columns={columns} data={mockPerformers} />
      </div>
    </div>
  );
};
export default SalesAnalytics;
