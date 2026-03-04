import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/users';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { UserRole } from '@/types/enums';
import type { User, ApiError } from '@/types/models';
import { formatDateShort, getInitials } from '@/utils/format';
import styles from './UsersPage.module.css';

const roleLabelMap: Record<string, string> = {
  student: 'Student',
  hr: 'HR',
  admin: 'Admin',
};

export default function UsersPage() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      showToast((err as ApiError).message || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user: User) => {
    try {
      const updated = await usersApi.update(user.id, { isBlocked: !user.isBlocked });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(
        updated.isBlocked ? 'User blocked' : 'User unblocked',
        'success',
      );
    } catch (err) {
      showToast((err as ApiError).message || 'Error', 'error');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { key: 'all', label: t('users.filterAll') },
    { key: UserRole.Student, label: t('users.filterStudents') },
    { key: UserRole.HR, label: t('users.filterHR') },
    { key: UserRole.Admin, label: t('users.filterAdmins') },
  ];

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="30%" />
        <Skeleton variant="rect" height={48} />
        <Skeleton variant="rect" height={400} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('users.title')}</h1>
          <p className={styles.totalCount}>
            {t('users.totalUsers', { count: filtered.length })}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <Input
          className={styles.searchInput}
          placeholder={t('users.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${roleFilter === tab.key ? styles.tabActive : ''}`}
              onClick={() => setRoleFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No users found</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={styles.desktopTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('users.name')}</th>
                  <th>{t('users.email')}</th>
                  <th>{t('users.role')}</th>
                  <th>{t('users.registered')}</th>
                  <th>{t('users.status')}</th>
                  <th>{t('users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{getInitials(user.name)}</div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge
                        variant={
                          user.role === UserRole.Admin
                            ? 'warning'
                            : user.role === UserRole.HR
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {roleLabelMap[user.role] || user.role}
                      </Badge>
                    </td>
                    <td>{formatDateShort(user.createdAt)}</td>
                    <td>
                      <Badge variant={user.isBlocked ? 'error' : 'success'}>
                        {user.isBlocked ? t('users.blocked') : t('users.active')}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedUser(user)}
                        >
                          {t('users.viewDetails')}
                        </Button>
                        {user.role !== UserRole.Admin && (
                          <Button
                            size="sm"
                            variant={user.isBlocked ? 'success' : 'danger'}
                            onClick={() => handleToggleBlock(user)}
                          >
                            {user.isBlocked ? t('users.unblock') : t('users.block')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={styles.mobileCards}>
            {filtered.map((user) => (
              <div key={user.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.avatar}>{getInitials(user.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className={styles.mobileCardInfo}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Badge
                      variant={
                        user.role === UserRole.Admin
                          ? 'warning'
                          : user.role === UserRole.HR
                            ? 'info'
                            : 'neutral'
                      }
                    >
                      {roleLabelMap[user.role] || user.role}
                    </Badge>
                    <Badge variant={user.isBlocked ? 'error' : 'success'}>
                      {user.isBlocked ? t('users.blocked') : t('users.active')}
                    </Badge>
                  </div>
                  <span>{formatDateShort(user.createdAt)}</span>
                </div>
                <div className={styles.mobileCardActions}>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                    {t('users.viewDetails')}
                  </Button>
                  {user.role !== UserRole.Admin && (
                    <Button
                      size="sm"
                      variant={user.isBlocked ? 'success' : 'danger'}
                      onClick={() => handleToggleBlock(user)}
                    >
                      {user.isBlocked ? t('users.unblock') : t('users.block')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name}
        size="md"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--font-size-sm)' }}>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Role:</strong> {roleLabelMap[selectedUser.role]}</div>
            {selectedUser.phone && <div><strong>Phone:</strong> {selectedUser.phone}</div>}
            {selectedUser.telegramId && <div><strong>Telegram:</strong> {selectedUser.telegramId}</div>}
            {selectedUser.university && <div><strong>University:</strong> {selectedUser.university}</div>}
            {selectedUser.major && <div><strong>Major:</strong> {selectedUser.major}</div>}
            {selectedUser.company && <div><strong>Company:</strong> {selectedUser.company}</div>}
            {selectedUser.bio && <div><strong>Bio:</strong> {selectedUser.bio}</div>}
            {selectedUser.skills && selectedUser.skills.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {selectedUser.skills.map((s) => (
                    <Badge key={s} variant="info">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div><strong>Registered:</strong> {formatDateShort(selectedUser.createdAt)}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
