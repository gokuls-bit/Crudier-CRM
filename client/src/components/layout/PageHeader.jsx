import React from 'react';
import clsx from 'clsx';

export const PageHeader = ({ title, description, actions, className }) => {
  return (
    <div className={clsx('flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-[#E0E3E8]', className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1C2945] Outfit">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 font-medium">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
