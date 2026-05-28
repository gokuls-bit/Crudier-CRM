import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(({ className, label, error, type = 'text', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-slate-400 Outfit">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'w-full px-3 py-2 text-sm rounded-lg glass-input focus:ring-2 focus:ring-brand-500/30 outline-none transition-all placeholder-slate-500',
          error ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-500/60',
          className
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-rose-400 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
