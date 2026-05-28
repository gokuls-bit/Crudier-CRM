import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Button from '../../components/ui/Button';

const mockInitialReviews = [
  { id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', author: 'Jane Doe', type: 'Dev Submission' },
  { id: '2', title: 'Design lead dashboard layout', priority: 'High', author: 'Alice Vance', type: 'Design Submission' },
];

export const TaskReview = () => {
  const [reviews, setReviews] = useState(mockInitialReviews);

  const handleAction = (id, action) => {
    alert(`Sprint task ${action}ed for ID: ${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const columns = [
    { key: 'title', label: 'Sprint Task Title' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />
    },
    { key: 'author', label: 'Submitted By' },
    { key: 'type', label: 'Category' },
    {
      key: 'actions',
      label: 'Verification Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleAction(row.id, 'Approve')} variant="primary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
            Sign Off
          </Button>
          <Button onClick={() => handleAction(row.id, 'Reject')} variant="danger" size="sm" className="px-2.5 py-1 text-[10px] rounded">
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Verify Sprint Submissions" 
        description="Verify submitted developer and designer sprint goals, write QA feedback, and approve completion statuses."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Submissions Pending Verification</h3>
        <Table columns={columns} data={reviews} emptyMessage="No sprint submissions pending review." />
      </div>
    </div>
  );
};
export default TaskReview;
