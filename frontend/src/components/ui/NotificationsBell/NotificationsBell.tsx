import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import styles from './NotificationsBell.module.css';

type NotifItem = {
  id: string;
  title: string;
  meta: string;
  time: string;
};

const MOCKS: Record<string, NotifItem[]> = {
  student: [
    { id: 's1', title: 'Заявка одобрена', meta: 'Beeline Kazakhstan · ML Engineer Intern', time: '2 ч назад' },
    { id: 's2', title: 'Новая стажировка по вашим навыкам', meta: 'Freedom Finance · React Native', time: 'вчера' },
  ],
  hr: [
    { id: 'h1', title: 'Новый отклик', meta: 'Дильназ К. — UX/UI Designer Intern', time: '15 мин назад' },
    { id: 'h2', title: 'Стажировка одобрена админом', meta: 'DevOps Engineer Intern опубликован', time: '3 ч назад' },
  ],
  admin: [
    { id: 'a1', title: 'Новая стажировка на модерации', meta: 'Jusan Bank · UX/UI Designer Intern', time: '10 мин назад' },
    { id: 'a2', title: 'Новое обращение в поддержку', meta: 'Студент: проблема со входом', time: '1 ч назад' },
  ],
};

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const ref = useRef<HTMLDivElement>(null);

  const items = useMemo(() => MOCKS[user?.role ?? 'student'] ?? [], [user?.role]);
  const unreadCount = items.filter((i) => !readIds.has(i.id)).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setReadIds(new Set(items.map((i) => i.id)));

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.bellBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>Уведомления</span>
            {unreadCount > 0 && (
              <button className={styles.markRead} onClick={markAllRead}>
                <CheckCheck size={14} />
                Прочитать всё
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className={styles.empty}>Уведомлений пока нет</div>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => {
                const isUnread = !readIds.has(n.id);
                return (
                  <li
                    key={n.id}
                    className={`${styles.item} ${isUnread ? styles.unread : ''}`}
                    onClick={() => setReadIds((prev) => new Set(prev).add(n.id))}
                  >
                    <span className={styles.dot} />
                    <div className={styles.itemBody}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      <span className={styles.itemMeta}>{n.meta}</span>
                      <span className={styles.itemTime}>{n.time}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
