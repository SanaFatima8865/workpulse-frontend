import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout }   from '@/components/layout/AppLayout';
import { PageLoader }  from '@/components/ui/Spinner';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated, selectIsAuthInitialized } from '@/store/authSlice';

const L = (C: React.LazyExoticComponent<React.ComponentType<object>>) =>
  <React.Suspense fallback={<PageLoader />}><C /></React.Suspense>;

const DashboardPage         = React.lazy(() => import('@/pages/Dashboard'));
const PlaceholderPage       = React.lazy(() => import('@/pages/Placeholder'));
const ProfilePage           = React.lazy(() => import('@/pages/Profile'));
const LoginPage             = React.lazy(() => import('@/pages/auth/Login'));
const RegisterPage          = React.lazy(() => import('@/pages/auth/Register'));
const WorkspaceSettingsPage = React.lazy(() => import('@/pages/workspace/Settings'));
const NewWorkspacePage      = React.lazy(() => import('@/pages/workspace/New'));
const TeamsPage             = React.lazy(() => import('@/pages/teams/index'));
const TeamDetailPage        = React.lazy(() => import('@/pages/teams/[id]'));
const MembersPage           = React.lazy(() => import('@/pages/members/index'));
const MemberProfilePage     = React.lazy(() => import('@/pages/members/[userId]'));
const ProjectsPage          = React.lazy(() => import('@/pages/projects/index'));
const ProjectDetailPage     = React.lazy(() => import('@/pages/projects/[id]'));
const ClientsPage           = React.lazy(() => import('@/pages/clients/index'));
const BoardsListPage        = React.lazy(() => import('@/pages/boards/index'));
const BoardPage             = React.lazy(() => import('@/pages/boards/[projectId]'));
const MyTasksPage           = React.lazy(() => import('@/pages/boards/MyTasks'));
const AnalyticsPage         = React.lazy(() => import('@/pages/analytics/index'));
const AIHubPage             = React.lazy(() => import('@/pages/ai/index'));
const ConstructionPage      = React.lazy(() => import('@/pages/construction/index'));
const ConstructionRFIs      = React.lazy(() => import('@/pages/construction/RFIs'));
const ConstructionCOs       = React.lazy(() => import('@/pages/construction/ChangeOrders'));
const ConstructionPunch     = React.lazy(() => import('@/pages/construction/PunchList'));
const InboxPage             = React.lazy(() => import('@/pages/inbox/index'));
const NotificationsPage     = React.lazy(() => import('@/pages/notifications/index'));
const NotFoundPage          = React.lazy(() => import('@/pages/errors/index'));

const AuthGuard: React.FC = () => {
  const ok   = useAppSelector(selectIsAuthenticated);
  const init = useAppSelector(selectIsAuthInitialized);
  if (!init) return <PageLoader message="Restoring your session..." />;
  if (!ok)   return <Navigate to="/auth/login" replace />;
  return <Outlet />;
};
const GuestGuard: React.FC = () => {
  const ok   = useAppSelector(selectIsAuthenticated);
  const init = useAppSelector(selectIsAuthInitialized);
  if (!init) return <PageLoader />;
  if (ok)    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  { element: <GuestGuard />, children: [
    { path: '/auth/login',    element: L(LoginPage) },
    { path: '/auth/register', element: L(RegisterPage) },
  ]},
  { element: <AuthGuard />, children: [
    { element: <AppLayout />, children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',     element: L(DashboardPage) },
      { path: 'inbox',         element: L(InboxPage) },
      { path: 'calendar',      element: L(PlaceholderPage) },
      { path: 'analytics',     element: L(AnalyticsPage) },
      { path: 'notifications', element: L(NotificationsPage) },
      // Module 9 — AI
      { path: 'ai',              element: L(AIHubPage) },
      // Module 10 — Construction
      { path: 'construction',              element: L(ConstructionPage) },
      { path: 'construction/:projectId',   element: L(ConstructionPage) },
      { path: 'construction/:projectId/rfis', element: L(ConstructionRFIs) },
      { path: 'construction/:projectId/cos',  element: L(ConstructionCOs) },
      { path: 'construction/:projectId/punch',element: L(ConstructionPunch) },
      { path: 'settings',      element: L(PlaceholderPage) },
      { path: 'profile',       element: L(ProfilePage) },
      // Module 3
      { path: 'workspaces/new',                   element: L(NewWorkspacePage) },
      { path: 'workspaces/:workspaceId/settings', element: L(WorkspaceSettingsPage) },
      // Module 4
      { path: 'teams',            element: L(TeamsPage) },
      { path: 'teams/:teamId',    element: L(TeamDetailPage) },
      { path: 'members',          element: L(MembersPage) },
      { path: 'members/:userId',  element: L(MemberProfilePage) },
      // Module 5
      { path: 'projects',         element: L(ProjectsPage) },
      { path: 'projects/:projectId', element: L(ProjectDetailPage) },
      { path: 'clients',          element: L(ClientsPage) },
      // Module 6
      { path: 'my-tasks',         element: L(MyTasksPage) },
      { path: 'boards',           element: L(BoardsListPage) },
      { path: 'boards/:projectId',element: L(BoardPage) },
    ]},
  ]},
  { path: '*', element: L(NotFoundPage) },
]);
