import React from 'react';
import clsx from 'clsx';

export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={clsx(
        'animate-spin rounded-full border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent border-[rgba(255,255,255,0.06)]',
        sizes[size] || sizes.md,
        className
      )} />
    </div>
  );
};
export default Spinner;
