import React from 'react';
import { getPriorityColors } from '../../utils/statusHelpers';
import clsx from 'clsx';

export const PriorityBadge = ({ priority, className }) => {
  if (!priority) return null;

  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border transition-all Outfit',
      getPriorityColors(priority),
      className
    )}>
      {priority}
    </span>
  );
};
export default PriorityBadge;
