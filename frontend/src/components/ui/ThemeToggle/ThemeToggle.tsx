import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className={`${styles.icon} ${isDark ? styles.moon : styles.sun}`}>
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
      <span className={`${styles.track} ${isDark ? styles.trackDark : styles.trackLight}`}>
        <span className={`${styles.thumb} ${isDark ? styles.thumbRight : styles.thumbLeft}`} />
      </span>
    </button>
  );
}
