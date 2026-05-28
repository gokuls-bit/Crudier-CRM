import React from 'react';
import clsx from 'clsx';

export const Avatar = ({ src, name = '', size = 'md', className }) => {
  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-[13px] font-semibold',
    lg: 'w-12 h-12 text-sm font-semibold',
    xl: 'w-16 h-16 text-base font-bold',
  };

  const colors = [
    'bg-brand-600/35 border-brand-500/30 text-brand-300',
    'bg-emerald-600/35 border-emerald-500/30 text-emerald-300',
    'bg-purple-600/35 border-purple-500/30 text-purple-300',
    'bg-cyan-600/35 border-cyan-500/30 text-cyan-300',
    'bg-rose-600/35 border-rose-500/30 text-rose-300',
  ];

  // Pick stable avatar color index from initials sum
  const colorIndex = name ? (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length : 0;

  return (
    <div className={clsx(
      'rounded-full overflow-hidden flex items-center justify-center border shrink-0',
      sizes[size] || sizes.md,
      !src && colors[colorIndex],
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
export default Avatar;
