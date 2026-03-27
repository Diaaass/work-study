import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import type { ApiError } from '@/types/models';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'student' | 'hr'>('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    major: '',
    company: '',
    telegramId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = t('register.passwordMismatch');
    if (role === 'student' && !form.university.trim()) errs.university = 'Required';
    if (role === 'hr' && !form.company.trim()) errs.company = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        university: role === 'student' ? form.university : undefined,
        major: role === 'student' ? form.major : undefined,
        company: role === 'hr' ? form.company : undefined,
      });
      navigate('/');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setErrors(apiErr.fieldErrors);
      }
      setServerError(apiErr.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoText}>Work&Study</div>
          <p className={styles.subtitle}>{t('register.subtitle')}</p>
        </div>

        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
          {t('register.selectRole')}
        </p>
        <div className={styles.roleSelector}>
          <div
            className={`${styles.roleCard} ${role === 'student' ? styles.roleCardActive : ''}`}
            onClick={() => setRole('student')}
          >
            <div className={styles.roleIcon}>🎓</div>
            <div className={styles.roleName}>{t('register.student')}</div>
            <div className={styles.roleDesc}>{t('register.studentDesc')}</div>
          </div>
          <div
            className={`${styles.roleCard} ${role === 'hr' ? styles.roleCardActive : ''}`}
            onClick={() => setRole('hr')}
          >
            <div className={styles.roleIcon}>💼</div>
            <div className={styles.roleName}>{t('register.hr')}</div>
            <div className={styles.roleDesc}>{t('register.hrDesc')}</div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Input
            label={t('register.name')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />

          <Input
            label={t('register.email')}
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
          />

          <div className={styles.row}>
            <Input
              label={t('register.password')}
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
            />
            <Input
              label={t('register.confirmPassword')}
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
            />
          </div>

          {role === 'student' && (
            <>
              <div className={styles.row}>
                <Input
                  label={t('register.university')}
                  value={form.university}
                  onChange={(e) => update('university', e.target.value)}
                  error={errors.university}
                />
                <Input
                  label={t('register.major')}
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                  error={errors.major}
                />
              </div>
            </>
          )}

          {role === 'hr' && (
            <Input
              label={t('register.company')}
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              error={errors.company}
            />
          )}

          <Input
            label={t('register.telegramId')}
            value={form.telegramId}
            onChange={(e) => update('telegramId', e.target.value)}
            placeholder="@username"
          />

          <Button type="submit" fullWidth loading={loading}>
            {t('register.submit')}
          </Button>
        </form>

        <div className={styles.footer}>
          {t('register.hasAccount')}{' '}
          <Link to="/login">{t('register.login')}</Link>
        </div>
      </div>
    </div>
  );
}
