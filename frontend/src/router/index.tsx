import { createBrowserRouter } from 'react-router-dom';
import { UserRole } from '@/types/enums';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

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
import EditInternshipPage from '@/pages/hr/EditInternshipPage';
import ApplicantsPage from '@/pages/hr/ApplicantsPage';

// Admin pages
import UsersPage from '@/pages/admin/UsersPage';
import ModerationPage from '@/pages/admin/ModerationPage';
import SupportTicketsPage from '@/pages/admin/SupportTicketsPage';

// Support pages
import FaqPage from '@/pages/support/FaqPage';
import SupportPage from '@/pages/support/SupportPage';

// Other
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { RoleBasedRedirect } from './RoleBasedRedirect';

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Role-based home redirect
          { path: '/', element: <RoleBasedRedirect /> },

          // Shared routes (all roles)
          { path: '/profile', element: <ProfilePage /> },
          { path: '/faq', element: <FaqPage /> },
          { path: '/support', element: <SupportPage /> },
          { path: '/about', element: <AboutPage /> },

          // Student routes
          {
            element: <RoleRoute allowedRoles={[UserRole.Student]} />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/search', element: <SearchPage /> },
              { path: '/internships/:id', element: <InternshipDetailPage /> },
              { path: '/internships/:id/apply', element: <ApplicationFormPage /> },
              { path: '/my-applications', element: <MyApplicationsPage /> },
            ],
          },

          // HR routes
          {
            element: <RoleRoute allowedRoles={[UserRole.HR]} />,
            children: [
              { path: '/hr/post', element: <PostInternshipPage /> },
              { path: '/hr/internships', element: <MyInternshipsPage /> },
              { path: '/hr/internships/:id/edit', element: <EditInternshipPage /> },
              { path: '/hr/internships/:id/applicants', element: <ApplicantsPage /> },
            ],
          },

          // Admin routes
          {
            element: <RoleRoute allowedRoles={[UserRole.Admin]} />,
            children: [
              { path: '/admin/users', element: <UsersPage /> },
              { path: '/admin/moderation', element: <ModerationPage /> },
              { path: '/admin/support', element: <SupportTicketsPage /> },
            ],
          },

          // 404
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
