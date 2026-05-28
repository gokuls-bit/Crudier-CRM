import { ROLES } from '../config/roles.config';

export const getRoleLabel = (role) => {
  if (!role) return 'Member';
  return role;
};

export const getRoleBadgeColors = (role) => {
  switch (role) {
    case ROLES.FOUNDER:
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case ROLES.ADMIN:
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case ROLES.CEO:
    case ROLES.MD:
    case ROLES.COO:
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case ROLES.CTO:
    case ROLES.VP_ENGINEERING:
    case ROLES.TECH_HEAD:
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    case ROLES.TEAM_LEAD:
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    case ROLES.DEVELOPER:
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case ROLES.DESIGNER:
      return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
    case ROLES.SALES:
      return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    case ROLES.INTERN:
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};
