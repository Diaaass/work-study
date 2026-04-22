import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { supportApi } from '@/api/support';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import type { SupportTicket, ApiError } from '@/types/models';
import { formatDateShort } from '@/utils/format';
import styles from './SupportTicketsPage.module.css';

const ROLE_LABEL: Record<string, string> = { student: 'Студент', hr: 'HR', admin: 'Админ' };

type TabFilter = 'all' | 'open' | 'resolved';

export default function SupportTicketsPage() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('open');

  // Modal state
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportApi.getAll();
      setTickets(data);
    } catch (err) {
      showToast((err as ApiError).message || 'Ошибка загрузки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelected(ticket);
    setReplyText(ticket.adminReply || '');
  };

  const handleReply = async (resolve: boolean) => {
    if (!selected) return;
    setReplying(true);
    try {
      const updated = await supportApi.reply(selected.id, {
        adminReply: replyText.trim() || undefined,
        status: resolve ? 'resolved' : 'open',
      });
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelected(null);
      showToast(resolve ? 'Тикет закрыт' : 'Ответ отправлен', 'success');
    } catch (err) {
      showToast((err as ApiError).message || 'Ошибка', 'error');
    } finally {
      setReplying(false);
    }
  };

  const filtered = tickets.filter(t => activeTab === 'all' || t.status === activeTab);
  const getCount = (tab: TabFilter) => tab === 'all' ? tickets.length : tickets.filter(t => t.status === tab).length;

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'open',     label: 'Открытые' },
    { key: 'resolved', label: 'Решённые' },
    { key: 'all',      label: 'Все' },
  ];

  if (loading) return (
    <div className={styles.page}>
      <Skeleton variant="title" width="30%" />
      <Skeleton variant="rect" height={44} />
      <Skeleton variant="card" count={3} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Тикеты поддержки</h1>
          <p className={styles.subtitle}>{getCount('open')} открытых обращений</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{getCount(tab.key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>Обращений нет</div>
      ) : (
        <div className={styles.list}>
          {filtered.map(ticket => (
            <div key={ticket.id} className={styles.card} onClick={() => openTicket(ticket)}>
              <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                  <span className={styles.ticketId}>#{ticket.id}</span>
                  <div>
                    <p className={styles.subject}>{ticket.subject}</p>
                    <p className={styles.meta}>
                      {ticket.user?.name} · {ROLE_LABEL[ticket.user?.role || ''] || ticket.user?.role} · {ticket.user?.email}
                    </p>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <Badge variant={ticket.status === 'resolved' ? 'success' : 'warning'}>
                    {ticket.status === 'resolved' ? 'Решено' : 'Открыто'}
                  </Badge>
                  <span className={styles.date}>{formatDateShort(ticket.createdAt)}</span>
                </div>
              </div>
              <p className={styles.preview}>{ticket.message.slice(0, 120)}{ticket.message.length > 120 ? '...' : ''}</p>
              {ticket.adminReply && (
                <p className={styles.hasReply}>Есть ответ</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `#${selected.id} — ${selected.subject}` : ''}
        size="md"
      >
        {selected && (
          <div className={styles.modal}>
            <div className={styles.modalMeta}>
              <span><strong>От:</strong> {selected.user?.name} ({ROLE_LABEL[selected.user?.role || '']})</span>
              <span><strong>Email:</strong> {selected.user?.email}</span>
              <span><strong>Дата:</strong> {formatDateShort(selected.createdAt)}</span>
            </div>

            <div className={styles.modalMessage}>
              <p className={styles.modalLabel}>Сообщение:</p>
              <p className={styles.modalText}>{selected.message}</p>
            </div>

            <div className={styles.modalReply}>
              <p className={styles.modalLabel}>Ответ пользователю:</p>
              <Input
                as="textarea"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Напишите ответ — он придёт на email пользователя..."
                rows={4}
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                loading={replying}
                onClick={() => handleReply(false)}
                disabled={!replyText.trim()}
              >
                Отправить ответ
              </Button>
              <Button
                variant="success"
                loading={replying}
                onClick={() => handleReply(true)}
              >
                {replyText.trim() ? 'Ответить и закрыть' : 'Закрыть тикет'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
