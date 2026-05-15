import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';
import {
  Home,
  Search,
  ClipboardList,
  User,
  PlusCircle,
  FileText,
  Users,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Info,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const ICON_SIZE = 18;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const studentNav: NavItem[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { to: '/search', label: t('nav.search'), icon: Search },
    { to: '/my-applications', label: t('nav.myApplications'), icon: ClipboardList },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/faq', label: t('nav.faq'), icon: HelpCircle },
    { to: '/support', label: t('nav.support'), icon: MessageSquare },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const hrNav: NavItem[] = [
    { to: '/hr/post', label: t('nav.postInternship'), icon: PlusCircle },
    { to: '/hr/internships', label: t('nav.myInternships'), icon: FileText },
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/faq', label: t('nav.faq'), icon: HelpCircle },
    { to: '/support', label: t('nav.support'), icon: MessageSquare },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin/users', label: t('nav.users'), icon: Users },
    { to: '/admin/moderation', label: t('nav.moderation'), icon: ShieldCheck },
    { to: '/admin/support', label: t('nav.supportTickets'), icon: MessageSquare },
    { to: '/about', label: t('nav.about'), icon: Info },
  ];

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case UserRole.Student: return studentNav;
      case UserRole.HR: return hrNav;
      case UserRole.Admin: return adminNav;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className={styles.topRow}>
          <span className={styles.menuLabel}>Меню</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <span className={styles.navIcon}>
                      <Icon size={ICON_SIZE} strokeWidth={isActive ? 2.5 : 1.75} />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
