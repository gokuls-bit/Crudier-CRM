import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { routePaths } from '../../routes/routePaths';
import Avatar from '../ui/Avatar';
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import clsx from 'clsx';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(routePaths.LOGIN);
  };

  const displayName = user?.name || 'Jane Doe';
  const displayRole = user?.role || 'Founder';

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group text-left focus:outline-none"
      >
        <Avatar src={user?.avatar} name={displayName} size="sm" />
        <div className="hidden md:flex flex-col text-xs">
          <span className="font-semibold text-[#1C2945] group-hover:text-[#00A9CE] transition-colors">{displayName}</span>
          <span className="text-[10px] text-slate-500 font-medium">{displayRole}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
      </button>
 
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E0E3E8] rounded-xl shadow-2xl py-1.5 z-40 overflow-hidden animate-fade-in">
          {/* Label info */}
          <div className="px-4 py-2 border-b border-[#E0E3E8] bg-[#F4F5F7] md:hidden flex flex-col text-xs mb-1">
            <span className="font-bold text-[#1C2945]">{displayName}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{displayRole}</span>
          </div>
 
          <button
            onClick={() => {
              navigate(routePaths.PROFILE);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1C2945] transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>My Profile</span>
          </button>
 
          <button
            onClick={() => {
              navigate(routePaths.SETTINGS);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1C2945] transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Preferences</span>
          </button>
 
          <button
            onClick={() => {
              navigate(routePaths.SECURITY_SETTINGS);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1C2945] transition-colors flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-slate-500" />
            <span>Security Settings</span>
          </button>
 
          <div className="h-px bg-[#E0E3E8] my-1" />
 
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default UserMenu;
