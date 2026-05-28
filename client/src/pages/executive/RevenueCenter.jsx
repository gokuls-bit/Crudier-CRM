import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import AreaChart from '../../components/charts/AreaChart';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Landmark, TrendingUp, DollarSign, Award } from 'lucide-react';

const mockRevenueDetails = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 68000 },
  { name: 'Mar', value: 85000 },
  { name: 'Apr', value: 110000 },
  { name: 'May', value: 95000 },
  { name: 'Jun', value: 148000 },
];

const mockDeals = [
  { id: '1', client: 'Alpha Corp', value: '$85,000', status: 'Closed Won', date: 'May 12, 2026' },
  { id: '2', client: 'Omega Logistics', value: '$120,000', status: 'In Negotiation', date: 'May 18, 2026' },
  { id: '3', client: 'Beta Systems', value: '$45,000', status: 'Closed Won', date: 'May 22, 2026' },
  { id: '4', client: 'Gamma Retail', value: '$60,000', status: 'Closed Lost', date: 'May 24, 2026' },
];

const mockSalesReps = [
  { rank: 1, name: 'Alice Vance', closedValue: '$340,000', conversion: '68%' },
  { rank: 2, name: 'Bob Roberts', closedValue: '$280,000', conversion: '59%' },
  { rank: 3, name: 'Charlie Cox', closedValue: '$190,000', conversion: '45%' },
];

export const RevenueCenter = () => {
  const dealColumns = [
    { key: 'client', label: 'Client / Company' },
    { key: 'value', label: 'Deal Value' },
    { key: 'date', label: 'Close Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <Badge variant={val.includes('Won') ? 'emerald' : (val.includes('Lost') ? 'rose' : 'amber')}>
          {val}
        </Badge>
      )
    },
  ];

  const repColumns = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Sales Representative' },
    { key: 'closedValue', label: 'Total Closed Won' },
    { key: 'conversion', label: 'Conversion Rate' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Revenue & Pipeline Analytics" 
        description="Comprehensive deal trackers, monthly revenue projections, and sales productivity metrics."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Won Deals" value="$485,000" trend="+18.4% YoY" trendType="up" icon={Landmark} />
        <StatCard title="Pipeline Open Values" value="$763,500" trend="14 leads in negotiation" trendType="up" icon={DollarSign} />
        <StatCard title="Average Deal Size" value="$68,200" trend="+3.2% vs last month" trendType="up" icon={TrendingUp} />
        <StatCard title="Top Conversion Rate" value="68.0%" trend="Held by Alice Vance" trendType="up" icon={Award} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-200 Outfit">Monthly Closed Won Revenue (6-Month Trend)</h3>
        <AreaChart data={mockRevenueDetails} height={250} color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Recent Pipeline Changes</h3>
          <Table columns={dealColumns} data={mockDeals} />
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Leaderboard: Top Sales Reps</h3>
          <Table columns={repColumns} data={mockSalesReps} />
        </div>
      </div>
    </div>
  );
};
export default RevenueCenter;
