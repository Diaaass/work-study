import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const studentNav: NavItem[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { to: '/search', label: t('nav.search'), icon: '🔍' },
    { to: '/my-applications', label: t('nav.myApplications'), icon: '📋' },
    { to: '/profile', label: t('nav.profile'), icon: '👤' },
  ];

  const hrNav: NavItem[] = [
    { to: '/hr/post', label: t('nav.postInternship'), icon: '➕' },
    { to: '/hr/internships', label: t('nav.myInternships'), icon: '📄' },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin/users', label: t('nav.users'), icon: '👥' },
    { to: '/admin/moderation', label: t('nav.moderation'), icon: '🛡️' },
  ];

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case UserRole.Student:
        return studentNav;
      case UserRole.HR:
        return hrNav;
      case UserRole.Admin:
        return adminNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </aside>
    </>
  );
}
