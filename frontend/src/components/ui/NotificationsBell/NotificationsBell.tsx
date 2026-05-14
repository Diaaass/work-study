import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Megaphone, Briefcase, FileText, MessageSquare, Star } from 'lucide-react';
import { notificationsApi, type Notification } from '@/api/notifications';
import styles from './NotificationsBell.module.css';

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_application:    <Briefcase size={14} />,
  application_status: <Star size={14} />,
  moderation_result:  <CheckCheck size={14} />,
  support_reply:      <MessageSquare size={14} />,
  new_ticket:         <FileText size={14} />,
  new_internship:     <Megaphone size={14} />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState<Notification[]>([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const dropRef               = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch {
      // silent — don't break UI
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationsApi.markRead(n.id);
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrap} ref={dropRef}>
      <button
        className={styles.bellBtn}
        onClick={() => setOpen(v => !v)}
        aria-label="Уведомления"
        aria-expanded={open}
      >
        <Bell size={18} strokeWidth={2} />
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>Уведомления</span>
            {unread > 0 && (
              <button
                className={styles.markRead}
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                <CheckCheck size={14} />
                Прочитать всё
              </button>
            )}
          </div>

          <div className={styles.list}>
            {items.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={28} className={styles.emptyIcon} />
                <p>Уведомлений нет</p>
              </div>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  className={`${styles.item} ${n.isRead ? '' : styles.unread}`}
                  onClick={() => handleClick(n)}
                >
                  <span className={styles.itemIcon}>{TYPE_ICON[n.type] ?? <Bell size={14} />}</span>
                  <span className={styles.itemContent}>
                    <span className={styles.itemTitle}>{n.title}</span>
                    <span className={styles.itemBody}>{n.body}</span>
                    <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.isRead && <span className={styles.dot} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
