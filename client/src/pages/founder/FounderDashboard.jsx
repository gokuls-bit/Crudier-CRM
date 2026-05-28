import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/charts/StatCard';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { routePaths } from '../../routes/routePaths';
import { Terminal, Users, Landmark, Layers, Radio, Sparkles, FolderLock } from 'lucide-react';

const mockActivities = [
  { id: '1', action: 'User login success', details: 'Jane Doe logged in from active session', time: 'Just now' },
  { id: '2', action: 'Task Status change', details: 'Implement JWT refresh rotation updated to Submitted', time: '12 mins ago' },
  { id: '3', action: 'Workspace created', details: 'Snavior CRM Inc. configured branding files', time: '1 hr ago' },
];

export const FounderDashboard = () => {
  const navigate = useNavigate();

  const activityColumns = [
    { key: 'action', label: 'Action Event' },
    { key: 'details', label: 'Event Details' },
    { key: 'time', label: 'Timestamp' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Startup Command Center" 
        description="Full access startup administration cockpit. Control workspace brand profiles, configure roles, and view event logs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Startup Valuation" value="$4,500,000" trend="Series A Pre-Seed" trendType="up" icon={Sparkles} />
        <StatCard title="Members Registered" value="38 Staff" trend="+2 Q2 headcount" trendType="up" icon={Users} />
        <StatCard title="Corporate Workspaces" value="4 Active" trend="Snavior CRM active" trendType="up" icon={Layers} />
        <StatCard title="Won Deal Revenue" value="$485,000" trend="Sales pipeline healthy" trendType="up" icon={Landmark} />
      </div>

      {/* Quick shortcuts */}
      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Quick Action Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate(routePaths.FOUNDER_MEMBERS)}
            className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-white/5 hover:border-brand-500/30 text-left transition-all flex flex-col gap-2 group"
          >
            <Users className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200 Outfit">Invite Members</span>
            <span className="text-[10px] text-slate-500">Manage user invitations</span>
          </button>

          <button
            onClick={() => navigate(routePaths.FOUNDER_SETTINGS)}
            className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-white/5 hover:border-brand-500/30 text-left transition-all flex flex-col gap-2 group"
          >
            <FolderLock className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200 Outfit">Workspace Branding</span>
            <span className="text-[10px] text-slate-500">Config workspace logos</span>
          </button>

          <button
            onClick={() => navigate(routePaths.CHAT)}
            className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-white/5 hover:border-brand-500/30 text-left transition-all flex flex-col gap-2 group"
          >
            <Radio className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200 Outfit">Broadcasting Channel</span>
            <span className="text-[10px] text-slate-500">Stand-up live updates</span>
          </button>

          <button
            onClick={() => navigate(routePaths.FOUNDER_ACTIVITY)}
            className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-white/5 hover:border-brand-500/30 text-left transition-all flex flex-col gap-2 group"
          >
            <Terminal className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200 Outfit">System Audit Logs</span>
            <span className="text-[10px] text-slate-500">Review database queries</span>
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Recent Workspace Activity Feed</h3>
        <Table columns={activityColumns} data={mockActivities} />
      </div>
    </div>
  );
};
export default FounderDashboard;
