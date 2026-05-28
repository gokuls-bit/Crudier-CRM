import React, { useState, useEffect, useRef } from 'react';
import { Layers, ChevronDown, Check } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import clsx from 'clsx';

export const WorkspaceSwitcher = () => {
  const { activeWorkspace, workspaces, fetchWorkspaces, switchWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchWorkspaces();

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentWorkspaceName = activeWorkspace?.name || 'Snavior CRM Inc.';

  // Propose mock options if workspaces array is empty
  const options = workspaces.length > 0 ? workspaces : [
    { _id: '111111111111111111111111', name: 'Snavior CRM Inc.' },
    { _id: '222222222222222222222222', name: 'Acme Developer Corp' }
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-white/10 hover:bg-slate-800/40 text-xs font-semibold text-slate-300 transition-colors Outfit"
      >
        <Layers className="w-4 h-4 text-brand-400" />
        <span className="max-w-[120px] truncate">{currentWorkspaceName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[200px] glass-panel rounded-xl shadow-2xl py-1.5 z-40 overflow-hidden animate-fade-in">
          <div className="px-4 py-2 border-b border-white/5 bg-slate-900/20 text-[10px] font-bold tracking-widest text-slate-500 uppercase Outfit">
            Choose Workspace
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar mt-1">
            {options.map((ws) => {
              const isSelected = ws._id === activeWorkspace?._id;
              return (
                <button
                  key={ws._id}
                  onClick={() => {
                    switchWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between',
                    isSelected 
                      ? 'bg-brand-600/15 text-brand-400 font-bold' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="truncate">{ws.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkspaceSwitcher;
