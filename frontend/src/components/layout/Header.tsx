import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, User, LogOut, Zap, Search, PlusCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/format';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import { NotificationsBell } from '@/components/ui/NotificationsBell/NotificationsBell';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  hr: 'HR',
  admin: 'Админ',
};

type CtaConfig = { label: string; to: string; Icon: typeof Search };

const CTA_BY_ROLE: Record<string, CtaConfig> = {
  hr: { label: 'Опубликовать', to: '/hr/post', Icon: PlusCircle },
  admin: { label: 'Модерация', to: '/admin/moderation', Icon: ShieldCheck },
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = ['ru', 'en', 'kk'] as const;

  const cta = useMemo(() => (user ? CTA_BY_ROLE[user.role] : null), [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button className={styles.hamburger} onClick={onToggleSidebar} aria-label="Menu">
            <Menu size={20} />
          </button>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}><Zap size={17} /></span>
            <span className={styles.logoText}>Work&amp;Study</span>
          </Link>
        </div>

        <div className={styles.right}>
          {cta && (
            <Link to={cta.to} className={styles.ctaBtn}>
              <cta.Icon size={16} strokeWidth={2.25} />
              <span className={styles.ctaLabel}>{cta.label}</span>
            </Link>
          )}

          {user && <NotificationsBell />}

          <ThemeToggle />

          <div className={styles.langSwitcher}>
            {languages.map((lang) => (
              <button
                key={lang}
                className={`${styles.langBtn} ${i18n.language === lang ? styles.langBtnActive : ''}`}
                onClick={() => i18n.changeLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {user && (
            <div className={styles.userSection} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <div className={styles.avatarRing}>
                  <div className={styles.avatar}>
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
                      : getInitials(user.name)
                    }
                  </div>
                </div>
                <span className={styles.userName}>{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user.avatarUrl
                        ? <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
                        : getInitials(user.name)
                      }
                    </div>
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownName}>{user.name}</span>
                      <span className={styles.dropdownRole}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={14} className={styles.dropdownIcon} />
                    {t('nav.profile')}
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={14} className={styles.dropdownIcon} />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
