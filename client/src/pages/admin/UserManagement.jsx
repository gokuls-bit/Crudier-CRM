import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import RoleBadge from '../../components/shared/RoleBadge';

const mockUsers = [
  { id: '1', name: 'Jane Doe', email: 'jane@crudier.com', role: 'Founder', status: 'Active' },
  { id: '2', name: 'Alice Vance', email: 'alice@crudier.com', role: 'Developer', status: 'Active' },
  { id: '3', name: 'Bob Ross', email: 'bob@crudier.com', role: 'Team Lead', status: 'Active' },
  { id: '4', name: 'Charlie Cox', email: 'charlie@crudier.com', role: 'Sales', status: 'Inactive' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: 'name', 
      label: 'Staff Member Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} size="sm" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200">{val}</span>
            <span className="text-[10px] text-slate-500">{row.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Clearance Role',
      render: (val) => <RoleBadge role={val} />
    },
    { 
      key: 'status', 
      label: 'Security Status',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'emerald' : 'slate'}>
          {val}
        </Badge>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Staff Directory" 
        description="Comprehensive team directory. Search database records, filter clearance levels and view profile details."
        actions={
          <Input
            type="text"
            placeholder="Search directory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[200px]"
          />
        }
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <Table columns={columns} data={filteredUsers} />
      </div>
    </div>
  );
};
export default UserManagement;
