import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RoleBanner from './RoleBanner';
import { useUiStore } from '../../store/ui.store';
import clsx from 'clsx';

export const AppShell = () => {
  const sidebarCollapsed = useUiStore(state => state.sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-[#f3f4f6]">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main app viewport */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'pl-16' : 'pl-64'
      )}>
        {/* Banner highlighting active roles and workspace */}
        <RoleBanner />

        {/* Global search + alert menus */}
        <Topbar />

        {/* Dynamic page container */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AppShell;
