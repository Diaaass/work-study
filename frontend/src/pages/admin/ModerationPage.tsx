import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/users';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipStatus } from '@/types/enums';
import type { Internship, ApiError } from '@/types/models';
import { formatDateShort } from '@/utils/format';
import styles from './ModerationPage.module.css';

export default function ModerationPage() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const data = await usersApi.getPendingInternships();
      setInternships(data);
    } catch (err) {
      showToast((err as ApiError).message || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await usersApi.moderateInternship(id, true, InternshipStatus.Published);
      setInternships((prev) => prev.filter((i) => i.id !== id));
      showToast(t('moderation.approve') + ' ✓', 'success');
    } catch (err) {
      showToast((err as ApiError).message || 'Error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await usersApi.moderateInternship(id, false, InternshipStatus.Draft);
      setInternships((prev) => prev.filter((i) => i.id !== id));
      showToast(t('moderation.reject') + ' ✓', 'info');
    } catch (err) {
      showToast((err as ApiError).message || 'Error', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="30%" />
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('moderation.title')}</h1>
          <p className={styles.pendingCount}>
            {t('moderation.pendingCount', { count: internships.length })}
          </p>
        </div>
      </div>

      {internships.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛡️</div>
          <p>{t('moderation.empty')}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {internships.map((internship) => (
            <div key={internship.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{internship.title}</h2>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMetaItem}>
                    🏢 {internship.company}
                  </span>
                  <span className={styles.cardMetaItem}>
                    📍 {internship.location}
                  </span>
                  <span className={styles.cardMetaItem}>
                    📅 {formatDateShort(internship.createdAt)}
                  </span>
                  {internship.salary && (
                    <span className={styles.cardMetaItem}>
                      💰 {internship.salary}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.description}>{internship.description}</p>
                <div className={styles.skillsRow}>
                  {internship.skills.map((skill) => (
                    <Badge key={skill} variant="info">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {internship.requirements.length > 0 && (
                  <ul style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', paddingLeft: '20px' }}>
                    {internship.requirements.slice(0, 3).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                    {internship.requirements.length > 3 && (
                      <li>+{internship.requirements.length - 3} more...</li>
                    )}
                  </ul>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.rejectInput}>
                  <Input
                    placeholder={t('moderation.rejectPlaceholder')}
                    value={rejectReasons[internship.id] || ''}
                    onChange={(e) =>
                      setRejectReasons((prev) => ({
                        ...prev,
                        [internship.id]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.actionButtons}>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={actionLoading === internship.id}
                    onClick={() => handleReject(internship.id)}
                  >
                    {t('moderation.reject')}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    loading={actionLoading === internship.id}
                    onClick={() => handleApprove(internship.id)}
                  >
                    {t('moderation.approve')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
