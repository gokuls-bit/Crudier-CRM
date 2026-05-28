import React from 'react';
import { useUiStore } from '../../store/ui.store';
import SearchBar from '../shared/SearchBar';
import NotificationBell from '../shared/NotificationBell';
import WorkspaceSwitcher from '../shared/WorkspaceSwitcher';
import UserMenu from '../shared/UserMenu';
import { Columns, Layout, Table } from '@phosphor-icons/react';
import clsx from 'clsx';

export const Topbar = () => {
  const { density, setDensity } = useUiStore();

  return (
    <header className="h-14 border-b border-[#E0E3E8] bg-white px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-sm text-[#1C2945]">
      
      {/* Left items: Unified Global Searchbar */}
      <div className="flex-1 max-w-md mr-4">
        <SearchBar />
      </div>

      {/* Right items: Density controls + Switcher + Notifications + Profile */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        
        {/* Density Mode Selector Button Group */}
        <div className="flex items-center bg-[#F4F5F7] border border-[#E0E3E8] p-0.5 rounded-md gap-0.5">
          <button
            onClick={() => setDensity('comfortable')}
            title="Comfortable Spacing"
            className={clsx(
              'px-2 py-1 rounded text-[10px] font-bold uppercase transition-all',
              density === 'comfortable' 
                ? 'bg-white text-[#1C2945] shadow-sm' 
                : 'text-slate-500 hover:text-[#1C2945]'
            )}
          >
            Comfortable
          </button>
          <button
            onClick={() => setDensity('default')}
            title="Default Spacing"
            className={clsx(
              'px-2 py-1 rounded text-[10px] font-bold uppercase transition-all',
              density === 'default' 
                ? 'bg-white text-[#1C2945] shadow-sm' 
                : 'text-slate-500 hover:text-[#1C2945]'
            )}
          >
            Default
          </button>
          <button
            onClick={() => setDensity('compact')}
            title="Compact Spacing"
            className={clsx(
              'px-2 py-1 rounded text-[10px] font-bold uppercase transition-all',
              density === 'compact' 
                ? 'bg-white text-[#1C2945] shadow-sm' 
                : 'text-slate-500 hover:text-[#1C2945]'
            )}
          >
            Compact
          </button>
        </div>

        <div className="h-5 w-px bg-[#E0E3E8]" />

        <WorkspaceSwitcher />
        <NotificationBell />
        
        <div className="h-5 w-px bg-[#E0E3E8]" />
        
        <UserMenu />
      </div>
    </header>
  );
};

export default Topbar;
