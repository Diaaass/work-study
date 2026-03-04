import { createBrowserRouter } from 'react-router-dom';
import { UserRole } from '@/types/enums';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Student pages
import DashboardPage from '@/pages/student/DashboardPage';
import SearchPage from '@/pages/student/SearchPage';
import InternshipDetailPage from '@/pages/student/InternshipDetailPage';
import ApplicationFormPage from '@/pages/student/ApplicationFormPage';
import MyApplicationsPage from '@/pages/student/MyApplicationsPage';
import ProfilePage from '@/pages/student/ProfilePage';

// HR pages
import PostInternshipPage from '@/pages/hr/PostInternshipPage';
import MyInternshipsPage from '@/pages/hr/MyInternshipsPage';
import ApplicantsPage from '@/pages/hr/ApplicantsPage';

// Admin pages
import UsersPage from '@/pages/admin/UsersPage';
import ModerationPage from '@/pages/admin/ModerationPage';

// Other
import NotFoundPage from '@/pages/NotFoundPage';
import { RoleBasedRedirect } from './RoleBasedRedirect';

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Role-based home redirect
          { path: '/', element: <RoleBasedRedirect /> },

          // Student routes
          {
            element: <RoleRoute allowedRoles={[UserRole.Student]} />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/search', element: <SearchPage /> },
              { path: '/internships/:id', element: <InternshipDetailPage /> },
              { path: '/internships/:id/apply', element: <ApplicationFormPage /> },
              { path: '/my-applications', element: <MyApplicationsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },

          // HR routes
          {
            element: <RoleRoute allowedRoles={[UserRole.HR]} />,
            children: [
              { path: '/hr/post', element: <PostInternshipPage /> },
              { path: '/hr/internships', element: <MyInternshipsPage /> },
              { path: '/hr/internships/:id/applicants', element: <ApplicantsPage /> },
            ],
          },

          // Admin routes
          {
            element: <RoleRoute allowedRoles={[UserRole.Admin]} />,
            children: [
              { path: '/admin/users', element: <UsersPage /> },
              { path: '/admin/moderation', element: <ModerationPage /> },
            ],
          },

          // 404
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
