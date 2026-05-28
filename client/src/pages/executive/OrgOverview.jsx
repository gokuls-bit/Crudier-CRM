import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Layers, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

const mockWorkspaces = [
  { id: '1', name: 'Snavior CRM Inc.', membersCount: 18, activeStaff: 15, deptHealth: 'Good', status: 'Active' },
  { id: '2', name: 'Acme Developer Corp', membersCount: 12, activeStaff: 10, deptHealth: 'Critical Tasks Alert', status: 'Active' },
  { id: '3', name: 'Infinite Labs', membersCount: 8, activeStaff: 6, deptHealth: 'Good', status: 'Pending Config' },
  { id: '4', name: 'Stardust Ventures', membersCount: 10, activeStaff: 9, deptHealth: 'Excellent', status: 'Active' },
];

export const OrgOverview = () => {
  const columns = [
    { key: 'name', label: 'Workspace Name', sortable: true },
    { key: 'membersCount', label: 'Member Count', sortable: true },
    { key: 'activeStaff', label: 'Active Staff', sortable: true },
    { 
      key: 'deptHealth', 
      label: 'Department Health',
      render: (val) => (
        <Badge variant={val.includes('Critical') ? 'rose' : (val.includes('Excellent') ? 'emerald' : 'indigo')}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge variant={val === 'Active' ? 'emerald' : 'slate'}>{val}</Badge>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Workspace & Org Overview" 
        description="Monitor multiple corporate workspace registers and per-workspace employee ratios."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Registered Workspaces" value="4 Active" icon={Layers} />
        <StatCard title="Healthy Departments" value="3 Workspaces" icon={CheckCircle2} />
        <StatCard title="Action Required Alert" value="1 Alert" icon={AlertTriangle} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Multi-Workspace Registry comparison</h3>
        <Table columns={columns} data={mockWorkspaces} />
      </div>
    </div>
  );
};
export default OrgOverview;
