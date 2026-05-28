import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Layers, Terminal, AlertTriangle } from 'lucide-react';

const mockEngineers = [
  { name: 'Alice Vance', activeTasks: 3, doneTasks: 18, overdueTasks: 0, workload: 'Moderate (68%)' },
  { name: 'Bob Ross', activeTasks: 5, doneTasks: 12, overdueTasks: 2, workload: 'High load (92%)' },
  { name: 'Charlie Cox', activeTasks: 2, doneTasks: 15, overdueTasks: 0, workload: 'Low load (45%)' },
  { name: 'David Smith', activeTasks: 4, doneTasks: 8, overdueTasks: 1, workload: 'Moderate (75%)' },
];

const mockOverdueTasks = [
  { id: '1', title: 'Refactor DB triggers mapping', engineer: 'Bob Ross', daysOverdue: 4, priority: 'High' },
  { id: '2', title: 'Clean unused AWS S3 assets bucket', engineer: 'David Smith', daysOverdue: 2, priority: 'Low' },
];

export const EngineeringOverview = () => {
  const engineerColumns = [
    { key: 'name', label: 'Engineer Name', sortable: true },
    { key: 'activeTasks', label: 'Active Sprint Tasks', sortable: true },
    { key: 'doneTasks', label: 'Completed Sprint Tasks', sortable: true },
    { 
      key: 'overdueTasks', 
      label: 'Overdue Sprint Tasks',
      render: (val) => <span className={val > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{val}</span>
    },
    { key: 'workload', label: 'Current Workload Ratio' },
  ];

  const overdueColumns = [
    { key: 'title', label: 'Overdue Task description' },
    { key: 'engineer', label: 'Assigned Engineer' },
    { 
      key: 'daysOverdue', 
      label: 'Days Overdue',
      render: (val) => <Badge variant="rose">{val} Days</Badge>
    },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <Badge variant={val === 'High' ? 'rose' : 'slate'}>{val}</Badge>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Engineering Operations Overview" 
        description="Monitor engineer active workloads, workload ratios, overdue tasks and team health status."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Team Load" value="14 active tasks" icon={Layers} />
        <StatCard title="Overdue Sprint tasks" value="2 Tasks" icon={AlertTriangle} />
        <StatCard title="Average Task Velocity" value="3.8 Days" icon={Terminal} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Developer Workload Heatmap</h3>
        <Table columns={engineerColumns} data={mockEngineers} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-rose-400 mb-4 Outfit">Overdue Tasks aging list</h3>
        <Table columns={overdueColumns} data={mockOverdueTasks} />
      </div>
    </div>
  );
};
export default EngineeringOverview;
