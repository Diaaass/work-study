import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/format';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = ['ru', 'en', 'kk'] as const;

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
            ☰
          </button>
          <Link to="/" className={styles.logo}>
            Work&Study
          </Link>
        </div>

        <div className={styles.right}>
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
              <span className={styles.userName}>{user.name}</span>
              <div
                className={styles.avatar}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className={styles.avatarImg} />
                  : getInitials(user.name)
                }
              </div>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
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
