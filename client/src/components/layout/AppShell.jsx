import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RoleBanner from './RoleBanner';
import { useUiStore } from '../../store/ui.store';
import { X, Calendar, Chats, Note, Clock, Pulse } from '@phosphor-icons/react';
import clsx from 'clsx';

export const AppShell = () => {
  const { sidebarCollapsed, contextPanelOpen, contextRecord, closeContextPanel } = useUiStore();

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-[#1C2945]">
      
      {/* Left Pane: Collapsible Application Navigator */}
      <Sidebar />

      {/* Center Viewport container */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'pl-16' : 'pl-64'
      )}>
        {/* Top notification role banner */}
        <RoleBanner />

        {/* Global search + top panel actions */}
        <Topbar />

        {/* Dynamic content view & Right Context Pane wrapper */}
        <div className="flex-1 flex relative overflow-hidden">
          
          {/* Main workspace container */}
          <main className="flex-1 p-6 overflow-y-auto custom-scrollbar animate-fade-in">
            <Outlet />
          </main>

          {/* Right Pane: Slide-in Context Panel */}
          <aside className={clsx(
            'w-80 bg-white border-l border-[#E0E3E8] flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0 shadow-lg',
            contextPanelOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'
          )}
          style={{ height: 'calc(100vh - 56px)' }} // Subtract topbar height
          >
            {/* Context Panel Header */}
            <div className="p-4 border-b border-[#E0E3E8] flex items-center justify-between bg-[#F4F5F7]">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#00A9CE]" />
                <span className="text-xs font-bold uppercase tracking-wider">Record Details</span>
              </div>
              <button 
                onClick={closeContextPanel}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context Panel Content */}
            {contextRecord ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                
                {/* Title & Type */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    {contextRecord.type || 'Record'}
                  </span>
                  <h4 className="text-sm font-bold text-[#1C2945] font-Outfit">
                    {contextRecord.title || contextRecord.name || 'Untitled Record'}
                  </h4>
                </div>

                <div className="h-px bg-[#E0E3E8]" />

                {/* Metadata properties */}
                <div className="space-y-2.5">
                  {contextRecord.status && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Status:</span>
                      <span className="bg-[#00A9CE]/10 text-[#00A9CE] border border-[#00A9CE]/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        {contextRecord.status}
                      </span>
                    </div>
                  )}

                  {contextRecord.priority && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Priority:</span>
                      <span className={clsx(
                        'px-2 py-0.5 rounded font-bold uppercase text-[9px] border',
                        contextRecord.priority === 'Critical' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : 'bg-slate-100 text-slate-600 border-[#E0E3E8]'
                      )}>
                        {contextRecord.priority}
                      </span>
                    </div>
                  )}

                  {contextRecord.assignedTo && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Assignee:</span>
                      <span className="text-[#1C2945] font-medium">{contextRecord.assignedTo}</span>
                    </div>
                  )}

                  {contextRecord.slaDuration && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> SLA Clock:
                      </span>
                      <span className="text-rose-600 font-bold font-mono">{contextRecord.slaDuration}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#E0E3E8]" />

                {/* Activity Feed logs */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Feed</h5>
                  {contextRecord.activities && contextRecord.activities.length > 0 ? (
                    <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-3 py-1">
                      {contextRecord.activities.map((act, i) => (
                        <div key={i} className="relative text-[11px] text-left">
                          {/* Dot indicator */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00A9CE] border border-white" />
                          <span className="font-semibold text-[#1C2945] block">{act.action}</span>
                          <span className="text-[9px] text-slate-400">{new Date(act.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic block text-center py-2">No activity recorded.</span>
                  )}
                </div>

                {contextRecord.description && (
                  <>
                    <div className="h-px bg-[#E0E3E8]" />
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</h5>
                      <p className="text-slate-600 leading-relaxed bg-[#F4F5F7] p-2.5 rounded border border-[#E0E3E8]">
                        {contextRecord.description}
                      </p>
                    </div>
                  </>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
                <FileText className="w-8 h-8" />
                <span className="text-xs">No active record selected.</span>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
};

export default AppShell;
