export const ROLES = {
  // System Roles (Standard)
  FOUNDER: 'Founder',
  ADMIN: 'Admin',
  TEAM_LEAD: 'Team Lead',
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  SALES: 'Sales',
  INTERN: 'Intern',

  // Executive Roles (Custom/Sub-roles)
  CEO: 'CEO',
  MD: 'MD',
  COO: 'COO',

  // Technical Leadership Roles (Custom/Sub-roles)
  CTO: 'CTO',
  VP_ENGINEERING: 'VP Engineering',
  TECH_HEAD: 'Tech Head',
};

// Maps any specific role to a page folder / role category for dashboard UI loading
export const ROLE_CATEGORIES = {
  [ROLES.FOUNDER]: 'founder',
  [ROLES.ADMIN]: 'admin',
  
  [ROLES.CEO]: 'executive',
  [ROLES.MD]: 'executive',
  [ROLES.COO]: 'executive',
  
  [ROLES.CTO]: 'technical',
  [ROLES.VP_ENGINEERING]: 'technical',
  [ROLES.TECH_HEAD]: 'technical',
  
  [ROLES.TEAM_LEAD]: 'teamlead',
  [ROLES.DEVELOPER]: 'developer',
  [ROLES.DESIGNER]: 'designer',
  [ROLES.SALES]: 'sales',
  [ROLES.INTERN]: 'intern',
};

export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole) return false;
  if (userRole === ROLES.FOUNDER) return true; // Founder bypasses all checks
  return allowedRoles.includes(userRole);
};
