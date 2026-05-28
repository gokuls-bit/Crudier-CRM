import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Button from '../../components/ui/Button';

const mockTasks = [
  { _id: '1', title: 'Design lead dashboard layout', priority: 'High', status: 'In Progress' },
  { _id: '2', title: 'Create marketing social media assets templates', priority: 'Medium', status: 'Pending' },
];

export const DesignTasks = () => {
  const [tasks, setTasks] = useState(mockTasks);

  const handleStart = (id) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: 'In Progress' } : t));
    alert('Creative design task status updated to In Progress.');
  };

  const columns = [
    { key: 'title', label: 'Design Task description' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <Badge variant={val === 'In Progress' ? 'brand' : 'slate'}>{val}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        row.status === 'Pending' ? (
          <Button onClick={() => handleStart(row._id)} variant="primary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
            Start
          </Button>
        ) : <span className="text-slate-500 font-semibold italic">Active in progress</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Creative Deliverables" 
        description="Assigned creative design deliverables board. Update design status and submit reviews."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Creative Queue Registry</h3>
        <Table columns={columns} data={tasks} />
      </div>
    </div>
  );
};
export default DesignTasks;
