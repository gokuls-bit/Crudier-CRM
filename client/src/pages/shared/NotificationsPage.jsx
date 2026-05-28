import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatDate';

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const columns = [
    { key: 'message', label: 'Notification Alert Description' },
    { 
      key: 'type', 
      label: 'Type Category',
      render: (val) => <Badge variant="slate">{val?.replace('_', ' ')}</Badge>
    },
    { 
      key: 'createdAt', 
      label: 'Time Logged',
      render: (val) => <span>{formatRelativeTime(val)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        !row.isRead ? (
          <button 
            onClick={() => markAsRead(row._id)}
            className="text-[11px] font-bold text-brand-400 hover:text-brand-350 transition-colors"
          >
            Mark Read
          </button>
        ) : <span className="text-slate-500 font-semibold italic">Read</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Notifications Center" 
        description="Comprehensive log tracking alerts, system broad messages, task reviews, and standup events."
        actions={
          <button 
            onClick={markAllAsRead}
            className="text-xs text-brand-400 hover:text-brand-300 font-bold"
          >
            Mark all read
          </button>
        }
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <Table columns={columns} data={notifications} emptyMessage="No alerts logged." />
      </div>
    </div>
  );
};
export default NotificationsPage;
// Make sure to export default as well!
