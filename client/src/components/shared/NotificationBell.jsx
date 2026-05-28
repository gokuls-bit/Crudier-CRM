import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatDate';
import clsx from 'clsx';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
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
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center border border-[#0f1422]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl py-1 z-40 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/40">
            <span className="text-xs font-bold text-slate-200 Outfit">Recent Alerts</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-brand-400 hover:text-brand-300 font-bold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={clsx(
                    'p-3.5 text-left cursor-pointer transition-colors hover:bg-white/5 flex flex-col gap-1',
                    !n.isRead && 'bg-brand-500/5'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold tracking-wide uppercase text-slate-400 Outfit">
                      {n.type?.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-slate-500">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                You have no notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
