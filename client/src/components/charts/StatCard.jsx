import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, trend, trendType = 'up', icon: Icon, className }) => {
  return (
    <div className={clsx('bg-white p-5 rounded-xl border border-[#E0E3E8] flex items-center justify-between shadow-sm', className)}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider Outfit">{title}</span>
        <h3 className="text-2xl font-extrabold text-[#1C2945] tracking-tight Outfit">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1">
            {trendType === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className={clsx(
              'text-[10px] font-bold Outfit',
              trendType === 'up' ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>

      {Icon && (
        <div className="p-3 bg-[#00A9CE]/10 border border-[#00A9CE]/20 rounded-xl text-[#00A9CE]">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};
export default StatCard;
