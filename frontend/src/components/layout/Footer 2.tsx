import { Link } from 'react-router-dom';
import { Zap, Send, Github, Mail, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import styles from './Footer.module.css';

export function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  const role = user?.role;
  const showStudent = !role || role === 'student';
  const showCompany = !role || role === 'hr';

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}><Zap size={18} /></span>
            <span className={styles.brandText}>Work&amp;Study</span>
          </div>
          <p className={styles.tagline}>
            Платформа стажировок для студентов Казахстана.
            Находите практику в IT, финансах и маркетинге.
          </p>
          <div className={styles.locationChip}>
            <MapPin size={12} />
            <span>Астана, Казахстан</span>
          </div>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Платформа</h4>
          <Link to="/faq" className={styles.link}>FAQ</Link>
          <Link to="/support" className={styles.link}>Поддержка</Link>
          <Link to="/about" className={styles.link}>О проекте</Link>
        </div>

        {showStudent && (
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Студентам</h4>
            <Link to="/search" className={styles.link}>Найти стажировку</Link>
            <Link to="/my-applications" className={styles.link}>Мои заявки</Link>
            <Link to="/profile" className={styles.link}>Профиль</Link>
          </div>
        )}

        {showCompany && (
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Компаниям</h4>
            <Link to="/hr/post" className={styles.link}>Опубликовать стажировку</Link>
            <Link to="/hr/internships" className={styles.link}>Мои стажировки</Link>
            <a href="#" className={styles.link}>Стать партнёром</a>
          </div>
        )}

        <div className={styles.contactsCol}>
          <h4 className={styles.colTitle}>Связаться</h4>
          <a href="mailto:hello@workstudy.kz" className={styles.contactLink}>
            <Mail size={14} />
            hello@workstudy.kz
          </a>
          <div className={styles.socials}>
            <a href="#" className={styles.socialBtn} aria-label="Telegram">
              <Send size={16} />
            </a>
            <a href="#" className={styles.socialBtn} aria-label="GitHub">
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <span className={styles.copy}>
          © {year} Work&amp;Study. Дипломный проект, AITU.
        </span>
        <div className={styles.bottomLinks}>
          <a href="#" className={styles.bottomLink}>Условия использования</a>
          <span className={styles.dotSep}>·</span>
          <a href="#" className={styles.bottomLink}>Конфиденциальность</a>
          {user && (
            <>
              <span className={styles.dotSep}>·</span>
              <span className={styles.bottomLink}>v0.1 · alpha</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
