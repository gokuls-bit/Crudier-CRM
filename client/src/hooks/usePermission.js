import { useAuthStore } from '../store/auth.store';
import { hasPermission, ROLES } from '../config/roles.config';

export const usePermission = () => {
  const user = useAuthStore(state => state.user);

  const checkPermission = (allowedRoles) => {
    if (!user) return false;
    return hasPermission(user.role, allowedRoles);
  };

  const isFounder = () => user?.role === ROLES.FOUNDER;
  const isAdmin = () => user?.role === ROLES.ADMIN;
  const isTeamLead = () => user?.role === ROLES.TEAM_LEAD;

  return {
    userRole: user?.role,
    checkPermission,
    isFounder,
    isAdmin,
    isTeamLead,
  };
};
export default usePermission;
