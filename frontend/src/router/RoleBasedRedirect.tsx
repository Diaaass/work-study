import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';

export function RoleBasedRedirect() {
  const { user } = useAuth();

  switch (user?.role) {
    case UserRole.Student:
      return <Navigate to="/dashboard" replace />;
    case UserRole.HR:
      return <Navigate to="/hr/internships" replace />;
    case UserRole.Admin:
      return <Navigate to="/admin/users" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
