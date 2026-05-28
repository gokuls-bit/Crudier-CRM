import React from 'react';
import SearchBar from '../shared/SearchBar';
import NotificationBell from '../shared/NotificationBell';
import WorkspaceSwitcher from '../shared/WorkspaceSwitcher';
import UserMenu from '../shared/UserMenu';

export const Topbar = () => {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0f1422]/65 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left items: Searchbar */}
      <div className="flex-1 max-w-sm mr-4">
        <SearchBar />
      </div>

      {/* Right items: Swapper + Notifications + Profile menu */}
      <div className="flex items-center gap-4">
        <WorkspaceSwitcher />
        <NotificationBell />
        
        <div className="h-6 w-px bg-white/5" />
        
        <UserMenu />
      </div>
    </header>
  );
};
export default Topbar;
