import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Button from '../../components/ui/Button';

const mockInitialTasks = [
  { _id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', status: 'In Progress' },
  { _id: '2', title: 'OAuth2 integration', priority: 'Critical', status: 'Pending' },
];

export const MyTasks = () => {
  const [tasks, setTasks] = useState(mockInitialTasks);
  const navigate = useNavigate();

  const handleStart = (id) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: 'In Progress' } : t));
    alert('Task started successfully.');
  };

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
      render: (val) => <Badge variant={val === 'In Progress' ? 'brand' : 'slate'}>{val}</Badge>
    },
    {
      key: 'actions',
      label: 'Task Controls',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'Pending' && (
            <Button onClick={() => handleStart(row._id)} variant="primary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
              Start
            </Button>
          )}
          <Button onClick={() => navigate(`/developer/tasks/${row._id}`)} variant="secondary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="My Sprint Goals" 
        description="Assigned tasks list dashboard. Update statuses and submit items for reviews."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Task Registry</h3>
        <Table columns={columns} data={tasks} />
      </div>
    </div>
  );
};
export default MyTasks;
