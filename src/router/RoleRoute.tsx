import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@/types/enums';
import { useEffect } from 'react';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const hasAccess = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (user && !hasAccess) {
      showToast(t('toast.accessDenied'), 'error');
    }
  }, [user, hasAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
