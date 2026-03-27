import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import { internshipsApi } from '@/api/internships';
import { Button } from '@/components/ui/Button/Button';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipStatus } from '@/types/enums';
import type { Internship, ApiError } from '@/types/models';
import { formatDateShort } from '@/utils/format';
import styles from './MyInternshipsPage.module.css';

type TabFilter = 'all' | 'published' | 'draft' | 'closed';

export default function MyInternshipsPage() {
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    internshipsApi
      .getMy()
      .then((data) => setInternships(data))
      .catch((err) => {
        const apiErr = err as ApiError;
        showToast(apiErr.message || t('internships.fetchError'), 'error');
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = async (id: string) => {
    setClosingId(id);
    try {
      await internshipsApi.update(id, { status: InternshipStatus.Closed });
      setInternships((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: InternshipStatus.Closed } : item,
        ),
      );
      showToast(t('internships.closedSuccess'), 'success');
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || t('internships.closeError'), 'error');
    } finally {
      setClosingId(null);
    }
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('internships.tabAll') },
    { key: 'published', label: t('internships.tabPublished') },
    { key: 'draft', label: t('internships.tabDraft') },
    { key: 'closed', label: t('internships.tabClosed') },
  ];

  const filteredInternships = internships.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const getTabCount = (tab: TabFilter) => {
    if (tab === 'all') return internships.length;
    return internships.filter((item) => item.status === tab).length;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="250px" />
        <Skeleton variant="rect" height={44} />
        <Skeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('internships.title')}</h1>
        <Button onClick={() => navigate('/hr/post')}>
          + {t('internships.createNew')}
        </Button>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{getTabCount(tab.key)}</span>
          </button>
        ))}
      </div>

      {filteredInternships.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>{t('internships.emptyTitle')}</h3>
          <p className={styles.emptyText}>{t('internships.emptyText')}</p>
          <Button onClick={() => navigate('/hr/post')}>
            {t('internships.createFirst')}
          </Button>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredInternships.map((internship) => (
            <div key={internship.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTitle}>{internship.title}</h3>
                  <Badge variant={getStatusVariant(internship.status)}>
                    {t(`internships.status.${internship.status}`)}
                  </Badge>
                  {!internship.isApproved && (
                    <span className={styles.warningBadge}>
                      ⚠ {t('internships.pendingApproval')}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>📍 {internship.location}</span>
                <span className={styles.metaItem}>💼 {t(`internships.type.${internship.type}`)}</span>
                <span className={styles.metaItem}>📅 {t('internships.deadline')}: {formatDateShort(internship.deadline)}</span>
                <Link
                  to={`/hr/internships/${internship.id}/applicants`}
                  className={styles.applicantsLink}
                >
                  👥 {internship.applicantsCount} {t('internships.applicants')}
                </Link>
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/hr/internships/${internship.id}/applicants`)}
                >
                  {t('internships.viewApplicants')}
                </Button>
                {internship.status !== InternshipStatus.Closed && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={closingId === internship.id}
                    onClick={() => handleClose(internship.id)}
                  >
                    {t('internships.close')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
