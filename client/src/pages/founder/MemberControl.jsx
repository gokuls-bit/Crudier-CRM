import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import RoleBadge from '../../components/shared/RoleBadge';
import { Mail, Plus } from 'lucide-react';

const mockInitialMembers = [
  { _id: '1', name: 'Jane Doe', email: 'jane@crudier.com', role: 'Founder', joinedAt: 'May 01, 2026' },
  { _id: '2', name: 'Alice Vance', email: 'alice@crudier.com', role: 'Developer', joinedAt: 'May 12, 2026' },
  { _id: '3', name: 'Bob Ross', email: 'bob@crudier.com', role: 'Team Lead', joinedAt: 'May 18, 2026' },
  { _id: '4', name: 'Charlie Cox', email: 'charlie@crudier.com', role: 'Sales', joinedAt: 'May 20, 2026' },
];

export const MemberControl = () => {
  const [members, setMembers] = useState(mockInitialMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    
    // Add to list as pending mock user
    const newMember = {
      _id: String(members.length + 1),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: 'Pending Accept',
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Team Member',
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
      label: 'Active Workspace Role',
      render: (val) => <RoleBadge role={val} />
    },
    { key: 'joinedAt', label: 'Joined At Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        row.role !== 'Founder' ? (
          <button 
            onClick={() => setMembers(prev => prev.filter(m => m._id !== row._id))}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-350 transition-colors"
          >
            Remove Member
          </button>
        ) : null
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Member Control & Permissions" 
        description="Invite new employees to your workspace registers, assign user security clearance roles and remove active profiles."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Active Workspace Members</h3>
          <Table columns={columns} data={members} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Invite New Member</h3>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="invitee@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Assign Initial Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Sales">Sales</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-1.5 mt-2">
              <Plus className="w-4 h-4" />
              <span>Send Invitation</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default MemberControl;
