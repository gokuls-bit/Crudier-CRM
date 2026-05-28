import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { routePaths } from '../../routes/routePaths';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { 
  House, GitMerge, AppWindow, Alarm, CheckSquareOffset, Warning, 
  BookOpen, GitBranch, ShoppingBag, ChartBar, Shield, CaretLeft, CaretRight,
  MagnifyingGlass, FolderSimple, FolderSimplePlus, FileText,
  Users, Target, Tag, MapPin, Envelope, Lifebuoy, Briefcase
} from '@phosphor-icons/react';
import clsx from 'clsx';

export const Sidebar = () => {
  const user = useAuthStore(state => state.user);
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const [filterQuery, setFilterQuery] = useState('');
  
  // Collapse state for application navigator sections
  const [expandedSections, setExpandedSections] = useState({
    selfService: true,
    workspaces: true,
    serviceDesk: true,
    changes: true,
    reports: true,
    admin: true
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Founder';

  // ServiceNow Navigator tree structure
  const navigatorTree = [
    {
      id: 'selfService',
      label: 'Self-Service',
      icon: House,
      links: [
        { path: routePaths.DASHBOARD, label: 'Dashboard', icon: House },
        { path: '/catalog', label: 'Service Catalog', icon: ShoppingBag },
        { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
      ]
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: AppWindow,
      links: [
        { path: '/workspace/workflows', label: 'Workflow Editor', icon: GitMerge },
        { path: '/workspace/forms', label: 'Form Builder', icon: AppWindow },
      ]
    },
    {
      id: 'serviceDesk',
      label: 'Service Desk',
      icon: Warning,
      links: [
        { path: '/incidents', label: 'Incident Queue', icon: Warning },
        { path: '/sla', label: 'SLA Dashboard', icon: Alarm },
        { path: '/approvals', label: 'My Approvals', icon: CheckSquareOffset },
      ]
    },
    {
      id: 'changes',
      label: 'Change Management',
      icon: GitBranch,
      links: [
        { path: '/changes', label: 'Change Request Board', icon: GitBranch },
      ]
    },
    {
      id: 'reports',
      label: 'Analytics & Reporting',
      icon: ChartBar,
      links: [
        { path: '/reports', label: 'Report Builder', icon: ChartBar },
        { path: '/reports/dashboard', label: 'Custom Dashboard', icon: FolderSimplePlus },
      ]
    },
    {
      id: 'salesforce',
      label: 'Salesforce CRM',
      icon: Briefcase,
      links: [
        { path: '/sales/dashboard', label: 'Sales Dashboard', icon: ChartBar },
        { path: '/sales/accounts', label: 'Accounts', icon: House },
        { path: '/sales/contacts', label: 'Contacts', icon: Users },
        { path: '/sales/opportunities', label: 'Opportunities', icon: Target },
        { path: '/sales/forecasting', label: 'Forecasting', icon: Target },
        { path: '/sales/cases', label: 'Cases (Tickets)', icon: Warning },
        { path: '/sales/products', label: 'Products & Books', icon: Tag },
        { path: '/sales/territories', label: 'Territories', icon: MapPin },
        { path: '/sales/emails', label: 'Emails Center', icon: Envelope },
      ]
    },
    {
      id: 'admin',
      label: 'Auditing & Security',
      icon: Shield,
      links: [
        { path: '/audit', label: 'System Audit Log', icon: Shield, adminOnly: true },
      ]
    }
  ];

  return (
    <aside className={clsx(
      'fixed left-0 top-0 bottom-0 z-40 bg-[#1C2945] text-white border-r border-[#E0E3E8]/10 flex flex-col transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00A9CE] flex items-center justify-center font-bold text-white shadow-md text-xs">
              S
            </div>
            <span className="text-xs font-bold tracking-wider text-white">
              SERVICENOW WORKSPACE
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded bg-[#00A9CE] mx-auto flex items-center justify-center font-bold text-white shadow-md text-xs">
            S
          </div>
        )}
      </div>

      {/* Navigation Filter Search (ServiceNow App Navigator Filter) */}
      {!sidebarCollapsed && (
        <div className="p-3 border-b border-white/5 shrink-0">
          <div className="flex items-center bg-[#253659] border border-white/10 rounded-md px-2 py-1 gap-2">
            <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter navigator..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-transparent border-none text-[11px] placeholder-slate-400 text-white outline-none w-full py-0.5"
            />
          </div>
        </div>
      )}

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {navigatorTree.map((sec) => {
          // Filter links based on query
          const filteredLinks = sec.links.filter(l => {
            if (l.adminOnly && !isAdmin) return false;
            if (!filterQuery) return true;
            return l.label.toLowerCase().includes(filterQuery.toLowerCase()) || 
                   sec.label.toLowerCase().includes(filterQuery.toLowerCase());
          });

          if (filteredLinks.length === 0) return null;
          const SecIcon = sec.icon;

          if (sidebarCollapsed) {
            return (
              <div key={sec.id} className="flex flex-col gap-1.5 items-center">
                {filteredLinks.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => clsx(
                        'p-2.5 rounded-md text-slate-300 hover:bg-white/5 hover:text-white transition-all relative group',
                        isActive && 'bg-[#00A9CE]/20 text-[#00A9CE] font-bold'
                      )}
                    >
                      <LinkIcon className="w-5 h-5" />
                      <span className="absolute left-full ml-4 px-2 py-1 bg-[#1C2945] border border-white/10 rounded text-[10px] whitespace-nowrap font-medium text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-md z-50">
                        {link.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={sec.id} className="space-y-1">
              <button 
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between text-left px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <span>{sec.label}</span>
                <span className="text-[8px] text-slate-500">
                  {expandedSections[sec.id] ? 'COLLAPSE' : 'EXPAND'}
                </span>
              </button>

              {expandedSections[sec.id] && (
                <div className="flex flex-col gap-0.5 pl-1.5 border-l border-white/5 ml-2 mt-1">
                  {filteredLinks.map((link) => {
                    const LinkIcon = link.icon;
                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => clsx(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all border border-transparent',
                          isActive 
                            ? 'bg-[#00A9CE]/15 text-[#00A9CE] border-[#00A9CE]/25 font-semibold shadow-inner'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <LinkIcon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigator Collapse Switcher */}
      <div className="h-10 border-t border-white/10 flex items-center justify-center shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full h-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <CaretRight className="w-4 h-4" /> : <CaretLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
