import React from 'react';
import { NavLink } from 'react-router-dom';
import { routePaths } from '../../routes/routePaths';
import { ROLE_CATEGORIES } from '../../config/roles.config';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import {
  LayoutDashboard, User, Bell, Calendar, FileText, MessageSquare, Settings,
  FolderLock, Users, ShieldAlert, Database, Radio,
  FolderGit2, CheckSquare, ClipboardCheck, Clock, CheckSquare2,
  Users2, Landmark, LineChart, BarChart3, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const user = useAuthStore(state => state.user);
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const roleCategory = user ? ROLE_CATEGORIES[user.role] : 'intern';

  // Define navigation categories
  const getNavLinks = () => {
    switch (roleCategory) {
      case 'founder':
        return [
          { path: routePaths.FOUNDER_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.FOUNDER_MEMBERS, label: 'Member Control', icon: Users },
          { path: routePaths.FOUNDER_SETTINGS, label: 'Branding Settings', icon: FolderLock },
          { path: routePaths.FOUNDER_ACTIVITY, label: 'Activity Log', icon: Database },
        ];
      case 'admin':
        return [
          { path: routePaths.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.ADMIN_USERS, label: 'User Management', icon: Users },
          { path: routePaths.ADMIN_ROLES, label: 'Role Assignment', icon: ShieldAlert },
          { path: routePaths.ADMIN_DEPARTMENTS, label: 'Departments', icon: FolderGit2 },
          { path: routePaths.ADMIN_ANNOUNCEMENTS, label: 'Broadcasts', icon: Radio },
        ];
      case 'executive':
        return [
          { path: routePaths.EXECUTIVE_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.EXECUTIVE_ORG_OVERVIEW, label: 'Org Health', icon: Users2 },
          { path: routePaths.EXECUTIVE_REVENUE, label: 'Revenue Center', icon: Landmark },
          { path: routePaths.EXECUTIVE_WORKFORCE, label: 'Workforce Report', icon: BarChart3 },
          { path: routePaths.EXECUTIVE_MEETINGS, label: 'Board Meetings', icon: Calendar },
        ];
      case 'technical':
        return [
          { path: routePaths.TECH_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.TECH_ENGINEERING_OVERVIEW, label: 'Team Workload', icon: FolderGit2 },
          { path: routePaths.TECH_SPRINT_BOARD, label: 'Sprint Board', icon: CheckSquare2 },
          { path: routePaths.TECH_ATTENDANCE, label: 'Team Attendance', icon: Clock },
          { path: routePaths.TECH_CODE_REVIEW, label: 'Code Review Queue', icon: ClipboardCheck },
          { path: routePaths.TECH_MEETINGS, label: 'Sprint Stand-ups', icon: Calendar },
        ];
      case 'teamlead':
        return [
          { path: routePaths.LEAD_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.LEAD_REVIEWS, label: 'Submissions Review', icon: ClipboardCheck },
          { path: routePaths.LEAD_ATTENDANCE, label: 'Team Attendance', icon: Clock },
          { path: routePaths.LEAD_ASSIGN_TASK, label: 'Assign Sprint Task', icon: CheckSquare2 },
          { path: routePaths.LEAD_NOTES, label: 'Team Notes', icon: FileText },
        ];
      case 'developer':
        return [
          { path: routePaths.DEV_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.DEV_TASKS, label: 'Sprint Tasks', icon: CheckSquare },
          { path: routePaths.DEV_ATTENDANCE, label: 'Check-In Logs', icon: Clock },
          { path: routePaths.DEV_NOTES, label: 'Dev Notes', icon: FileText },
        ];
      case 'designer':
        return [
          { path: routePaths.DESIGNER_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.DESIGNER_TASKS, label: 'Design Tasks', icon: CheckSquare },
          { path: routePaths.DESIGNER_ATTENDANCE, label: 'My Attendance', icon: Clock },
          { path: routePaths.DESIGNER_NOTES, label: 'Asset Documentation', icon: FileText },
        ];
      case 'sales':
        return [
          { path: routePaths.SALES_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.SALES_LEADS, label: 'Leads Directory', icon: Users },
          { path: routePaths.SALES_PIPELINE, label: 'Deals Kanban', icon: CheckSquare2 },
          { path: routePaths.SALES_ANALYTICS, label: 'Revenue Trends', icon: LineChart },
          { path: routePaths.SALES_FOLLOWUPS, label: 'Follow-ups List', icon: Calendar },
        ];
      case 'intern':
      default:
        return [
          { path: routePaths.INTERN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
          { path: routePaths.INTERN_TASKS, label: 'Assigned Tasks', icon: CheckSquare },
          { path: routePaths.INTERN_ATTENDANCE, label: 'My Check-In', icon: Clock },
        ];
    }
  };

  const commonLinks = [
    { path: routePaths.CHAT, label: 'Team Chat', icon: MessageSquare },
    { path: routePaths.MEETINGS, label: 'Global Calendar', icon: Calendar },
    { path: routePaths.NOTES, label: 'Personal Notes', icon: FileText },
    { path: routePaths.PROFILE, label: 'My Profile', icon: User },
    { path: routePaths.SETTINGS, label: 'Settings', icon: Settings },
  ];

  const roleLinks = getNavLinks();

  return (
    <aside className={clsx(
      'fixed left-0 top-0 bottom-0 z-40 bg-[#0f1422] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg Outfit">
              C
            </div>
            <span className="text-sm font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 Outfit">
              CRUDIER CRM
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors',
            sidebarCollapsed && 'mx-auto'
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scroll container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        {/* Role module Navigation */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2 Outfit">
              {roleCategory} module
            </p>
          )}
          {roleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group relative',
                  isActive 
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/25 shadow-lg shadow-brand-500/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!sidebarCollapsed && <span>{link.label}</span>}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-md">
                    {link.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Global/Common Navigation */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-2 Outfit">
              Collab center
            </p>
          )}
          {commonLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group relative',
                  isActive 
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/25 shadow-lg shadow-brand-500/5'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!sidebarCollapsed && <span>{link.label}</span>}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-md">
                    {link.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
