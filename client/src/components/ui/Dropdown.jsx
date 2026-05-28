import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({ trigger, options = [], onSelect, className, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger || (
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700/80 hover:bg-slate-700 transition-colors">
            <span>Select Options</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={clsx(
          'absolute z-30 mt-2 min-w-[160px] glass-panel rounded-lg shadow-xl py-1 overflow-hidden animate-fade-in',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect?.(opt);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
            >
              {opt.icon && <span className="opacity-70">{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dropdown;
