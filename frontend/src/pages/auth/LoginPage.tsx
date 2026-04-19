import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import type { ApiError } from '@/types/models';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { t, i18n } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passwordResetSuccess = searchParams.get('reset') === '1';
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const languages = ['ru', 'en', 'kk'] as const;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = t('login.email') + ' required';
    if (!password) errs.password = t('login.password') + ' required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const apiErr = err as ApiError & { code?: string; email?: string };
      if (apiErr.code === 'EMAIL_NOT_VERIFIED' && apiErr.email) {
        navigate(`/verify-email?email=${encodeURIComponent(apiErr.email)}`);
        return;
      }
      if (apiErr.status === 401) {
        setServerError(t('login.invalidCredentials'));
      } else {
        setServerError(apiErr.message || 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.langRow}>
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

        <div className={styles.logo}>
          <div className={styles.logoText}>Work&Study</div>
          <p className={styles.subtitle}>{t('login.subtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {justRegistered && (
            <div className={styles.successMessage}>✅ Аккаунт создан! Войдите в систему.</div>
          )}
          {passwordResetSuccess && (
            <div className={styles.successMessage}>Пароль изменён — войдите с новым паролем</div>
          )}
          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Input
            label={t('login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="student@test.com"
            autoComplete="email"
          />

          <Input
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="password123"
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth loading={loading}>
            {t('login.submit')}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </div>

        <div className={styles.footer}>
          {t('login.noAccount')}{' '}
          <Link to="/register">{t('login.register')}</Link>
        </div>
      </div>
    </div>
  );
}
