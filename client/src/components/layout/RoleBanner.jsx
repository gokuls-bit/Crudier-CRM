import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useWorkspaceStore } from '../../store/workspace.store';
import { ShieldCheck, Layers } from 'lucide-react';
import RoleBadge from '../shared/RoleBadge';

export const RoleBanner = () => {
  const user = useAuthStore(state => state.user);
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);

  if (!user) return null;

  return (
    <div className="bg-[#101726] border-b border-white/5 px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>Active Role Session:</span>
        </div>
        <RoleBadge role={user.role} />
      </div>

      {activeWorkspace && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Workspace context:</span>
          </div>
          <span className="bg-brand-500/10 text-brand-300 px-2 py-0.5 border border-brand-500/20 rounded font-bold Outfit">
            {activeWorkspace.name}
          </span>
        </div>
      )}
    </div>
  );
};
export default RoleBanner;
