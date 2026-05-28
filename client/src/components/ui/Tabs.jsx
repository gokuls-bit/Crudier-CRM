import React from 'react';
import clsx from 'clsx';

export const Tabs = ({ tabs = [], activeTab, onChange, className }) => {
  return (
    <div className={clsx('flex gap-1 border-b border-white/5 pb-px overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={clsx(
              'px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border-b-2 outline-none Outfit',
              isActive
                ? 'border-brand-500 text-brand-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
export default Tabs;
