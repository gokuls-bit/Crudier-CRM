import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';

const mockTasks = [
  { _id: '1', title: 'Verify attendance late triggers', priority: 'Medium', status: 'Pending' },
];

export const InternTasks = () => {
  const [tasks] = useState(mockTasks);

  const columns = [
    { key: 'title', label: 'Sprint Task Title' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="My Assigned Tickets (Read-Only)" 
        description="Assigned task list views. Update status using developer/designer workflows if escalation is approved."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Assigned Tasks</h3>
        <Table columns={columns} data={tasks} />
      </div>
    </div>
  );
};
export default InternTasks;
