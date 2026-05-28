import React, { useState } from 'react';
import clsx from 'clsx';

export const Tooltip = ({ children, content, position = 'top', className }) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div className={clsx(
          'absolute z-40 px-2 py-1 text-[10px] font-medium text-slate-100 bg-slate-900 border border-white/10 rounded shadow-md whitespace-nowrap pointer-events-none animate-fade-in',
          positions[position] || positions.top,
          className
        )}>
          {content}
        </div>
      )}
    </div>
  );
};
export default Tooltip;
