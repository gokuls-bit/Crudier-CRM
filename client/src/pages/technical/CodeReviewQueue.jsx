import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Button from '../../components/ui/Button';

const mockInitialReviews = [
  { id: '1', title: 'Implement JWT refresh rotation', priority: 'Critical', author: 'Jane Doe', repo: 'github.com/crudier/server', branch: 'feat/jwt-rotation' },
  { id: '2', title: 'OAuth2 integration', priority: 'Critical', author: 'Charlie Cox', repo: 'github.com/crudier/server', branch: 'feat/oauth-auth' },
  { id: '3', title: 'Create automated CRM test suites', priority: 'Low', author: 'John Smith', repo: 'github.com/crudier/client', branch: 'test/auth-suites' },
];

export const CodeReviewQueue = () => {
  const [reviews, setReviews] = useState(mockInitialReviews);

  const handleAction = (id, action) => {
    alert(`Code proposal request ${action}ed for ID: ${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const columns = [
    { key: 'title', label: 'Feature Description' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />
    },
    { key: 'author', label: 'Author / Submitter' },
    { 
      key: 'branch', 
      label: 'Repository / Branch Link',
      render: (val, row) => <span className="font-mono text-[11px] text-slate-400">{row.repo} ({val})</span>
    },
    {
      key: 'actions',
      label: 'Actions Support',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleAction(row.id, 'Approve')} variant="primary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
            Approve
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
        title="Code Review Queue" 
        description="Tasks currently pending tech reviewer approvals. Verify branch commits and run automated tests before signing off."
      />

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Submissions Pending Engineering Review</h3>
        <Table columns={columns} data={reviews} emptyMessage="No code submissions pending reviews currently." />
      </div>
    </div>
  );
};
export default CodeReviewQueue;
