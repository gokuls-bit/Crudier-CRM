import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Database, Terminal, ShieldAlert } from 'lucide-react';

const mockLogs = [
  { id: '101', user: 'Jane Doe (Founder)', action: 'PATCH /api/v1/workspaces/1', status: 200, ip: '192.168.1.10', time: 'May 28, 2026 23:12:04' },
  { id: '102', user: 'Bob Ross (Lead)', action: 'POST /api/v1/tasks', status: 201, ip: '192.168.1.18', time: 'May 28, 2026 23:00:15' },
  { id: '103', user: 'Guest User', action: 'POST /api/v1/auth/login (Failed)', status: 401, ip: '127.0.0.1', time: 'May 28, 2026 22:58:32' },
  { id: '104', user: 'Alice Vance (Dev)', action: 'GET /api/v1/tasks', status: 200, ip: '192.168.1.22', time: 'May 28, 2026 22:45:10' },
  { id: '105', user: 'Jane Doe (Founder)', action: 'POST /api/v1/workspaces/1/invite', status: 200, ip: '192.168.1.10', time: 'May 28, 2026 22:30:18' },
];

export const ActivityLog = () => {
  const columns = [
    { key: 'user', label: 'Operator / Member', sortable: true },
    { 
      key: 'action', 
      label: 'HTTP Request Action',
      render: (val) => <span className="font-mono text-slate-300 font-semibold">{val}</span>
    },
    { 
      key: 'status', 
      label: 'Status Code',
      render: (val) => (
        <Badge variant={val >= 400 ? 'rose' : (val >= 300 ? 'amber' : 'emerald')}>
          {val}
        </Badge>
      )
    },
    { key: 'ip', label: 'Client IP Address' },
    { key: 'time', label: 'Timestamp Date', sortable: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Workspace Audit Trail logs" 
        description="Full server audit registers. Monitor database inserts, status codes, and IP signatures."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Event records" value="1,240 Logs" icon={Database} />
        <StatCard title="API Invocations Today" value="382 Calls" icon={Terminal} />
        <StatCard title="Failed Auth Inbound" value="1 Attempt" icon={ShieldAlert} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">System Event Audit Register</h3>
        <Table columns={columns} data={mockLogs} />
      </div>
    </div>
  );
};
export default ActivityLog;
