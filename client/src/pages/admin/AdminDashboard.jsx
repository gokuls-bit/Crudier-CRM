import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Settings, Users, ClipboardCheck, Radio } from 'lucide-react';

const mockPendingRequests = [
  { id: '1', name: 'John Smith', email: 'john@crudier.com', requestType: 'Workspace Invite Access', date: 'May 28, 2026' },
  { id: '2', name: 'Sara Conner', email: 'sara@crudier.com', requestType: 'Role Escalation (Dev -> Lead)', date: 'May 28, 2026' },
];

export const AdminDashboard = () => {
  const columns = [
    { key: 'name', label: 'User Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'requestType', label: 'Action Requested' },
    { key: 'date', label: 'Request Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => alert('Approved')} className="text-[11px] text-brand-400 font-bold hover:underline">Approve</button>
          <button onClick={() => alert('Rejected')} className="text-[11px] text-rose-400 font-bold hover:underline">Deny</button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Admin Operations Center" 
        description="Workspace membership controls, pending role elevations, announcements, and team check-in audits."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Team Registrations" value="38 Members" icon={Users} />
        <StatCard title="Today's Attendance" value="94.2% present" icon={ClipboardCheck} />
        <StatCard title="Access Requests" value="2 Pending" icon={Settings} />
        <StatCard title="Public Broadcasts" value="6 Sent" icon={Radio} />
      </div>

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Pending Member Requests</h3>
        <Table columns={columns} data={mockPendingRequests} emptyMessage="No workspace requests pending." />
      </div>
    </div>
  );
};
export default AdminDashboard;
