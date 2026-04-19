import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button/Button';
import type { ApiError } from '@/types/models';
import styles from './VerifyEmailPage.module.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setServerError('');
    setLoading(true);
    try {
      await verifyEmail(email, code);
      navigate('/');
    } catch (err) {
      setServerError((err as ApiError).message || 'Ошибка подтверждения');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage('');
    setServerError('');
    setResendLoading(true);
    try {
      await authApi.resendCode(email);
      setResendMessage('Новый код отправлен на почту');
    } catch (err) {
      setServerError((err as ApiError).message || 'Ошибка');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoText}>Work&Study</div>
          <p className={styles.subtitle}>Подтверждение email</p>
        </div>

        <p className={styles.hint}>
          Мы отправили 6-значный код на<br />
          <strong>{email}</strong>
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError && <div className={styles.serverError}>{serverError}</div>}
          {resendMessage && <div className={styles.successMessage}>{resendMessage}</div>}

          <div className={styles.codeRow}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                className={styles.codeInput}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <Button type="submit" fullWidth loading={loading} disabled={code.length < 6}>
            Подтвердить
          </Button>
        </form>

        <div className={styles.footer}>
          Не пришёл код?{' '}
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? 'Отправка...' : 'Отправить снова'}
          </button>
        </div>

        <div className={styles.footer} style={{ marginTop: 8 }}>
          <Link to="/register">← Назад к регистрации</Link>
        </div>
      </div>
    </div>
  );
}
