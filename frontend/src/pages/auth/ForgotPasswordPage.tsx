import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import type { ApiError } from '@/types/models';
import styles from './ForgotPasswordPage.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Введите email'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError((err as ApiError).message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoText}>Work&Study</div>
          <p className={styles.subtitle}>Восстановление пароля</p>
        </div>

        <p className={styles.hint}>
          Введите ваш email — мы отправим код для сброса пароля.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.serverError}>{error}</div>}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />

          <Button type="submit" fullWidth loading={loading}>
            Отправить код
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/login">← Вернуться ко входу</Link>
        </div>
      </div>
    </div>
  );
}
