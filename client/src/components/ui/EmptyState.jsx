import React from 'react';
import { Inbox } from 'lucide-react';
import clsx from 'clsx';

export const EmptyState = ({ icon: Icon = Inbox, title = 'No items found', description = 'Try adjusting your filters or search query', className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl border border-white/5', className)}>
      <div className="p-3 bg-slate-800/40 rounded-full border border-slate-700/50 mb-3 text-slate-500">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 Outfit">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">{description}</p>
    </div>
  );
};
export default EmptyState;
