import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import RoleBadge from '../../components/shared/RoleBadge';

const mockInitialStaff = [
  { id: '1', name: 'Jane Doe', email: 'jane@crudier.com', role: 'Founder' },
  { id: '2', name: 'Alice Vance', email: 'alice@crudier.com', role: 'Developer' },
  { id: '3', name: 'Bob Ross', email: 'bob@crudier.com', role: 'Team Lead' },
  { id: '4', name: 'Charlie Cox', email: 'charlie@crudier.com', role: 'Sales' },
];

export const RoleAssignment = () => {
  const [staff, setStaff] = useState(mockInitialStaff);

  const handleRoleChange = (id, newRole) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, role: newRole } : s));
    alert(`Role updated to ${newRole} for employee.`);
  };

  const columns = [
    { key: 'name', label: 'Staff Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Current Active Role',
      render: (val) => <RoleBadge role={val} />
    },
    {
      key: 'actions',
      label: 'Change Security Clearance',
      render: (_, row) => (
        row.role !== 'Founder' ? (
          <select
            value={row.role}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            className="px-2 py-1 rounded border border-white/10 bg-slate-900 text-slate-350 text-xs outline-none focus:border-brand-500/50"
          >
            <option value="Admin">Admin</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Sales">Sales</option>
            <option value="Intern">Intern</option>
            <option value="CEO">CEO (Exec)</option>
            <option value="CTO">CTO (Tech)</option>
          </select>
        ) : <span className="text-slate-500 font-semibold italic">System Owner</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Role Assignment Console" 
        description="Modify database roles and assign workspace security levels."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Manage User Permissions</h3>
        <Table columns={columns} data={staff} />
      </div>
    </div>
  );
};
export default RoleAssignment;
