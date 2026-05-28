import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={clsx(
        'w-full max-w-lg glass-panel rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-slate-100 Outfit">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
