import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, className, variant = 'slate' }) => {
  const variants = {
    slate: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    brand: 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-all',
      variants[variant] || variants.slate,
      className
    )}>
      {children}
    </span>
  );
};
export default Badge;
