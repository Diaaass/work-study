import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { supportApi } from '@/api/support';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Badge/Badge';
import type { SupportTicket, ApiError } from '@/types/models';
import { formatDateShort } from '@/utils/format';
import styles from './SupportPage.module.css';

export default function SupportPage() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});

  useEffect(() => {
    supportApi.getMy()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!subject.trim()) e.subject = 'Укажите тему обращения';
    if (!message.trim()) e.message = 'Опишите проблему';
    else if (message.trim().length < 20) e.message = 'Минимум 20 символов';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const ticket = await supportApi.create({ subject: subject.trim(), message: message.trim() });
      setTickets(prev => [ticket, ...prev]);
      setSubject('');
      setMessage('');
      setErrors({});
      showToast('Обращение отправлено. Мы ответим вам на email.', 'success');
    } catch (err) {
      showToast((err as ApiError).message || 'Ошибка отправки', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Поддержка</h1>
          <p className={styles.subtitle}>Опишите проблему — мы ответим на ваш email</p>
        </div>
        <Link to="/faq" className={styles.faqLink}>Частые вопросы (FAQ)</Link>
      </div>

      {/* Форма */}
      <Card className={styles.formCard}>
        <h2 className={styles.formTitle}>Новое обращение</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              label="Тема"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Кратко опишите проблему"
              error={errors.subject}
            />
            <Input
              as="textarea"
              label="Сообщение"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Подробно опишите вашу проблему или вопрос..."
              rows={5}
              error={errors.message}
            />
          </div>
          <div className={styles.formFooter}>
            <span className={styles.charCount}>{message.length} символов</span>
            <Button type="submit" loading={submitting}>Отправить</Button>
          </div>
        </form>
      </Card>

      {/* История обращений */}
      <div className={styles.history}>
        <h2 className={styles.historyTitle}>Мои обращения</h2>

        {loadingTickets ? (
          <p className={styles.loading}>Загрузка...</p>
        ) : tickets.length === 0 ? (
          <p className={styles.empty}>Обращений пока нет</p>
        ) : (
          <div className={styles.ticketList}>
            {tickets.map(ticket => (
              <div key={ticket.id} className={styles.ticket}>
                <div className={styles.ticketHeader}>
                  <span className={styles.ticketSubject}>{ticket.subject}</span>
                  <div className={styles.ticketMeta}>
                    <Badge variant={ticket.status === 'resolved' ? 'success' : 'warning'}>
                      {ticket.status === 'resolved' ? 'Решено' : 'Открыто'}
                    </Badge>
                    <span className={styles.ticketDate}>{formatDateShort(ticket.createdAt)}</span>
                  </div>
                </div>
                <p className={styles.ticketMessage}>{ticket.message}</p>
                {ticket.adminReply && (
                  <div className={styles.reply}>
                    <span className={styles.replyLabel}>Ответ поддержки:</span>
                    <p className={styles.replyText}>{ticket.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
