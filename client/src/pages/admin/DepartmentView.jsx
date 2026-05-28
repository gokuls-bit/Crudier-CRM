import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Landmark, Users, Hammer, ShoppingBag } from 'lucide-react';

const mockDepts = [
  { name: 'Engineering', code: 'ENG', lead: 'CTO / Bob Ross', members: 14, status: 'Healthy' },
  { name: 'Sales & Pipeline', code: 'SALES', lead: 'Charlie Cox', members: 10, status: 'Excellent' },
  { name: 'Product UI/UX Design', code: 'DESIGN', lead: 'Jane Doe', members: 6, status: 'Healthy' },
  { name: 'HR & Administration', code: 'ADMIN', lead: 'Jane Doe', members: 8, status: 'Pending Review' },
];

export const DepartmentView = () => {
  const columns = [
    { key: 'name', label: 'Department Name', sortable: true },
    { key: 'code', label: 'Code key' },
    { key: 'lead', label: 'Department Lead Name' },
    { key: 'members', label: 'Member Count', sortable: true },
    { 
      key: 'status', 
      label: 'Department Status',
      render: (val) => (
        <Badge variant={val.includes('Pending') ? 'amber' : 'emerald'}>
          {val}
        </Badge>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Department Control Center" 
        description="Monitor department registrations, assign department leads and audit headcounts."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Engineering team" value="14 Devs" icon={Hammer} />
        <StatCard title="Sales department" value="10 Reps" icon={ShoppingBag} />
        <StatCard title="Branding design" value="6 Designers" icon={Users} />
        <StatCard title="Corporate finance" value="8 Staff" icon={Landmark} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Registered Corporate Departments</h3>
        <Table columns={columns} data={mockDepts} />
      </div>
    </div>
  );
};
export default DepartmentView;
