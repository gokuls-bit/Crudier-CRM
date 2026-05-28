import React from 'react';
import { getRoleBadgeColors, getRoleLabel } from '../../utils/roleHelpers';
import clsx from 'clsx';

export const RoleBadge = ({ role, className }) => {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border transition-all Outfit',
      getRoleBadgeColors(role),
      className
    )}>
      {getRoleLabel(role)}
    </span>
  );
};
export default RoleBadge;
