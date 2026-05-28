import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useWorkspaceStore } from '../../store/workspace.store';
import { ShieldCheck, Stack } from '@phosphor-icons/react';
import RoleBadge from '../shared/RoleBadge';

export const RoleBanner = () => {
  const user = useAuthStore(state => state.user);
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);

  if (!user) return null;

  return (
    <div className="bg-[#253659] border-b border-white/10 px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-300">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00A9CE]" />
          <span>Active Role Session:</span>
        </div>
        <RoleBadge role={user.role} />
      </div>

      {activeWorkspace && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-white">
            <Stack className="w-3.5 h-3.5 text-[#00A9CE]" />
            <span>Workspace context:</span>
          </div>
          <span className="bg-[#00A9CE]/20 text-[#00A9CE] px-2 py-0.5 border border-[#00A9CE]/30 rounded font-bold">
            {activeWorkspace.name}
          </span>
        </div>
      )}
    </div>
  );
};
export default RoleBanner;
