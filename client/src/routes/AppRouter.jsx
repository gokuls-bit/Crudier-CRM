import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routePaths } from './routePaths';
import { ROLES, ROLE_CATEGORIES } from '../config/roles.config';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layout
import AppShell from '../components/layout/AppShell';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import EmailVerificationPage from '../pages/auth/EmailVerificationPage';
import TwoFactorSetupPage from '../pages/auth/TwoFactorSetupPage';

// Shared Pages
import ProfilePage from '../pages/shared/ProfilePage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import MeetingsPage from '../pages/shared/MeetingsPage';
import NotesPage from '../pages/shared/NotesPage';
import ChatPage from '../pages/shared/ChatPage';
import SettingsPage from '../pages/shared/SettingsPage';
import SecuritySettingsPage from '../pages/shared/SecuritySettingsPage';
import SearchResultsPage from '../pages/shared/SearchResultsPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

// ServiceNow Pages
import WorkflowBuilder from '../pages/servicenow/WorkflowBuilder';
import FormBuilder from '../pages/servicenow/FormBuilder';
import SLADashboard from '../pages/servicenow/SLADashboard';
import ApprovalsInbox from '../pages/servicenow/ApprovalsInbox';
import IncidentsQueue from '../pages/servicenow/IncidentsQueue';
import IncidentDetail from '../pages/servicenow/IncidentDetail';
import KnowledgeBase from '../pages/servicenow/KnowledgeBase';
import ArticleReader from '../pages/servicenow/ArticleReader';
import ChangeBoard from '../pages/servicenow/ChangeBoard';
import ServiceCatalog from '../pages/servicenow/ServiceCatalog';
import ReportsBuilder from '../pages/servicenow/ReportsBuilder';
import ReportsDashboard from '../pages/servicenow/ReportsDashboard';
import AuditLogPage from '../pages/servicenow/AuditLogPage';

// Executive Pages
import ExecutiveDashboard from '../pages/executive/ExecutiveDashboard';
import OrgOverview from '../pages/executive/OrgOverview';
import RevenueCenter from '../pages/executive/RevenueCenter';
import WorkforceReport from '../pages/executive/WorkforceReport';
import StrategicMeetings from '../pages/executive/StrategicMeetings';

// Technical Pages
import TechDashboard from '../pages/technical/TechDashboard';
import EngineeringOverview from '../pages/technical/EngineeringOverview';
import SprintBoard from '../pages/technical/SprintBoard';
import TechAttendance from '../pages/technical/TechAttendance';
import CodeReviewQueue from '../pages/technical/CodeReviewQueue';
import TechMeetings from '../pages/technical/TechMeetings';

// Founder Pages
import FounderDashboard from '../pages/founder/FounderDashboard';
import WorkspaceSettings from '../pages/founder/WorkspaceSettings';
import MemberControl from '../pages/founder/MemberControl';
import ActivityLog from '../pages/founder/ActivityLog';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoleAssignment from '../pages/admin/RoleAssignment';
import DepartmentView from '../pages/admin/DepartmentView';
import AnnouncementSend from '../pages/admin/AnnouncementSend';

// Team Lead Pages
import TeamLeadDashboard from '../pages/teamlead/TeamLeadDashboard';
import TaskReview from '../pages/teamlead/TaskReview';
import TeamAttendance from '../pages/teamlead/TeamAttendance';
import AssignTask from '../pages/teamlead/AssignTask';
import TeamNotes from '../pages/teamlead/TeamNotes';

// Developer Pages
import DevDashboard from '../pages/developer/DevDashboard';
import MyTasks from '../pages/developer/MyTasks';
import TaskDetail from '../pages/developer/TaskDetail';
import SubmitTask from '../pages/developer/SubmitTask';
import MyAttendance from '../pages/developer/MyAttendance';
import DevNotes from '../pages/developer/DevNotes';

// Designer Pages
import DesignerDashboard from '../pages/designer/DesignerDashboard';
import DesignTasks from '../pages/designer/DesignTasks';
import AssetNotes from '../pages/designer/AssetNotes';
import DesignerAttendance from '../pages/designer/DesignerAttendance';

// Sales Pages
import SalesDashboard from '../pages/sales/SalesDashboard';
import LeadBoard from '../pages/sales/LeadBoard';
import LeadDetail from '../pages/sales/LeadDetail';
import PipelineKanban from '../pages/sales/PipelineKanban';
import SalesAnalytics from '../pages/sales/SalesAnalytics';
import FollowUps from '../pages/sales/FollowUps';

// Intern Pages
import InternDashboard from '../pages/intern/InternDashboard';
import InternTasks from '../pages/intern/InternTasks';
import InternAttendance from '../pages/intern/InternAttendance';

// Redirect helper component to land user on their proper dashboard
const DashboardRedirect = () => {
  const userString = localStorage.getItem('crudier_user');
  if (!userString) return <Navigate to={routePaths.LOGIN} replace />;

  const user = JSON.parse(userString);
  const category = ROLE_CATEGORIES[user.role] || 'intern';

  switch (category) {
    case 'founder':
      return <Navigate to={routePaths.FOUNDER_DASHBOARD} replace />;
    case 'admin':
      return <Navigate to={routePaths.ADMIN_DASHBOARD} replace />;
    case 'executive':
      return <Navigate to={routePaths.EXECUTIVE_DASHBOARD} replace />;
    case 'technical':
      return <Navigate to={routePaths.TECH_DASHBOARD} replace />;
    case 'teamlead':
      return <Navigate to={routePaths.LEAD_DASHBOARD} replace />;
    case 'developer':
      return <Navigate to={routePaths.DEV_DASHBOARD} replace />;
    case 'designer':
      return <Navigate to={routePaths.DESIGNER_DASHBOARD} replace />;
    case 'sales':
      return <Navigate to={routePaths.SALES_DASHBOARD} replace />;
    case 'intern':
    default:
      return <Navigate to={routePaths.INTERN_DASHBOARD} replace />;
  }
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={routePaths.LOGIN} element={<LoginPage />} />
        <Route path={routePaths.REGISTER} element={<RegisterPage />} />
        <Route path={routePaths.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={routePaths.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
        <Route path={routePaths.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={routePaths.EMAIL_VERIFICATION} element={<EmailVerificationPage />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            {/* Index redirection */}
            <Route path={routePaths.DASHBOARD} element={<DashboardRedirect />} />
            <Route path="/" element={<Navigate to={routePaths.DASHBOARD} replace />} />

            {/* Shared Pages */}
            <Route path={routePaths.PROFILE} element={<ProfilePage />} />
            <Route path={routePaths.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path={routePaths.MEETINGS} element={<MeetingsPage />} />
            <Route path={routePaths.NOTES} element={<NotesPage />} />
            <Route path={routePaths.CHAT} element={<ChatPage />} />
            <Route path={routePaths.SETTINGS} element={<SettingsPage />} />
            <Route path={routePaths.SECURITY_SETTINGS} element={<SecuritySettingsPage />} />
            <Route path={routePaths.TWO_FACTOR_SETUP} element={<TwoFactorSetupPage />} />

            {/* Executive Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.CEO, ROLES.MD, ROLES.COO, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.EXECUTIVE_DASHBOARD} element={<ExecutiveDashboard />} />
              <Route path={routePaths.EXECUTIVE_ORG_OVERVIEW} element={<OrgOverview />} />
              <Route path={routePaths.EXECUTIVE_REVENUE} element={<RevenueCenter />} />
              <Route path={routePaths.EXECUTIVE_WORKFORCE} element={<WorkforceReport />} />
              <Route path={routePaths.EXECUTIVE_MEETINGS} element={<StrategicMeetings />} />
            </Route>

            {/* Technical Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.CTO, ROLES.VP_ENGINEERING, ROLES.TECH_HEAD, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.TECH_DASHBOARD} element={<TechDashboard />} />
              <Route path={routePaths.TECH_ENGINEERING_OVERVIEW} element={<EngineeringOverview />} />
              <Route path={routePaths.TECH_SPRINT_BOARD} element={<SprintBoard />} />
              <Route path={routePaths.TECH_ATTENDANCE} element={<TechAttendance />} />
              <Route path={routePaths.TECH_CODE_REVIEW} element={<CodeReviewQueue />} />
              <Route path={routePaths.TECH_MEETINGS} element={<TechMeetings />} />
            </Route>

            {/* Founder Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.FOUNDER]} />}>
              <Route path={routePaths.FOUNDER_DASHBOARD} element={<FounderDashboard />} />
              <Route path={routePaths.FOUNDER_SETTINGS} element={<WorkspaceSettings />} />
              <Route path={routePaths.FOUNDER_MEMBERS} element={<MemberControl />} />
              <Route path={routePaths.FOUNDER_ACTIVITY} element={<ActivityLog />} />
            </Route>

            {/* Admin Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.FOUNDER]} />}>
              <Route path={routePaths.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={routePaths.ADMIN_USERS} element={<UserManagement />} />
              <Route path={routePaths.ADMIN_ROLES} element={<RoleAssignment />} />
              <Route path={routePaths.ADMIN_DEPARTMENTS} element={<DepartmentView />} />
              <Route path={routePaths.ADMIN_ANNOUNCEMENTS} element={<AnnouncementSend />} />
            </Route>

            {/* Team Lead Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.TEAM_LEAD, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.LEAD_DASHBOARD} element={<TeamLeadDashboard />} />
              <Route path={routePaths.LEAD_REVIEWS} element={<TaskReview />} />
              <Route path={routePaths.LEAD_ATTENDANCE} element={<TeamAttendance />} />
              <Route path={routePaths.LEAD_ASSIGN_TASK} element={<AssignTask />} />
              <Route path={routePaths.LEAD_NOTES} element={<TeamNotes />} />
            </Route>

            {/* Developer Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.DEVELOPER, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.DEV_DASHBOARD} element={<DevDashboard />} />
              <Route path={routePaths.DEV_TASKS} element={<MyTasks />} />
              <Route path={routePaths.DEV_TASK_DETAIL} element={<TaskDetail />} />
              <Route path={routePaths.DEV_SUBMIT_TASK} element={<SubmitTask />} />
              <Route path={routePaths.DEV_ATTENDANCE} element={<MyAttendance />} />
              <Route path={routePaths.DEV_NOTES} element={<DevNotes />} />
            </Route>

            {/* Designer Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.DESIGNER, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.DESIGNER_DASHBOARD} element={<DesignerDashboard />} />
              <Route path={routePaths.DESIGNER_TASKS} element={<DesignTasks />} />
              <Route path={routePaths.DESIGNER_NOTES} element={<AssetNotes />} />
              <Route path={routePaths.DESIGNER_ATTENDANCE} element={<DesignerAttendance />} />
            </Route>

            {/* Sales Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.SALES, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.SALES_DASHBOARD} element={<SalesDashboard />} />
              <Route path={routePaths.SALES_LEADS} element={<LeadBoard />} />
              <Route path={routePaths.SALES_LEAD_DETAIL} element={<LeadDetail />} />
              <Route path={routePaths.SALES_PIPELINE} element={<PipelineKanban />} />
              <Route path={routePaths.SALES_ANALYTICS} element={<SalesAnalytics />} />
              <Route path={routePaths.SALES_FOLLOWUPS} element={<FollowUps />} />
            </Route>

            {/* Intern Dashboard Guard */}
            <Route element={<RoleRoute allowedRoles={[ROLES.INTERN, ROLES.FOUNDER, ROLES.ADMIN]} />}>
              <Route path={routePaths.INTERN_DASHBOARD} element={<InternDashboard />} />
              <Route path={routePaths.INTERN_TASKS} element={<InternTasks />} />
              <Route path={routePaths.INTERN_ATTENDANCE} element={<InternAttendance />} />
            </Route>

          </Route>
        </Route>

        {/* Fallback to 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
