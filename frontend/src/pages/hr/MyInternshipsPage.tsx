import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import { internshipsApi } from '@/api/internships';
import { Button } from '@/components/ui/Button/Button';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipStatus } from '@/types/enums';
import type { Internship, InternshipStats, ApiError } from '@/types/models';
import { formatDateShort } from '@/utils/format';
import styles from './MyInternshipsPage.module.css';

type TabFilter = 'all' | 'published' | 'pending' | 'closed' | 'rejected';

export default function MyInternshipsPage() {
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Stats modal state
  const [statsId, setStatsId] = useState<string | null>(null);
  const [stats, setStats] = useState<InternshipStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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

  const handleOpenStats = async (id: string) => {
    if (statsId === id) {
      setStatsId(null);
      setStats(null);
      return;
    }
    setStatsId(id);
    setStats(null);
    setStatsLoading(true);
    try {
      const data = await internshipsApi.getStats(id);
      setStats(data);
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || 'Ошибка загрузки статистики', 'error');
      setStatsId(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all',       label: t('internships.tabAll') },
    { key: 'published', label: t('internships.tabPublished') },
    { key: 'pending',   label: t('internships.tabDraft') },
    { key: 'closed',    label: t('internships.tabClosed') },
    { key: 'rejected',  label: t('internships.tabRejected') },
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
          {filteredInternships.map((internship) => {
            const applicantsCount = internship._count?.applications ?? 0;
            const isStatsOpen = statsId === internship.id;

            return (
              <div key={internship.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>{internship.title}</h3>
                    <Badge variant={getStatusVariant(internship.status)}>
                      {t(`internships.status.${internship.status}`)}
                    </Badge>
                  </div>
                </div>

                {/* Причина отклонения */}
                {internship.status === InternshipStatus.Rejected && (
                  <div className={styles.rejectionReason}>
                    <div>
                      <strong>{t('internships.rejectionReasonLabel')}</strong>
                      <p>{internship.rejectionReason || t('internships.rejectionReasonNone')}</p>
                    </div>
                  </div>
                )}

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>{internship.city}</span>
                  <span className={styles.metaItem}>{internship.workType}</span>
                  {internship.deadline && (
                    <span className={styles.metaItem}>
                      {t('internships.deadline')}: {formatDateShort(internship.deadline)}
                    </span>
                  )}
                </div>

                {/* Блок статистики */}
                {isStatsOpen && (
                  <div className={styles.statsBlock}>
                    {statsLoading ? (
                      <div className={styles.statsLoading}>{t('internships.statsLoading')}</div>
                    ) : stats ? (
                      <>
                        <div className={styles.statsGrid}>
                          <div className={styles.statCard}>
                            <span className={styles.statValue}>{stats.viewsCount}</span>
                            <span className={styles.statLabel}>{t('internships.statsViews')}</span>
                          </div>
                          <div className={styles.statCard}>
                            <span className={styles.statValue}>{stats.totalApplications}</span>
                            <span className={styles.statLabel}>{t('internships.statsTotalApps')}</span>
                          </div>
                          <div className={styles.statCard}>
                            <span className={styles.statValue} style={{ color: 'var(--color-warning)' }}>
                              {stats.byStatus.pending}
                            </span>
                            <span className={styles.statLabel}>{t('internships.statsPending')}</span>
                          </div>
                          <div className={styles.statCard}>
                            <span className={styles.statValue} style={{ color: 'var(--color-success)' }}>
                              {stats.byStatus.accepted}
                            </span>
                            <span className={styles.statLabel}>{t('internships.statsAccepted')}</span>
                          </div>
                          <div className={styles.statCard}>
                            <span className={styles.statValue} style={{ color: 'var(--color-error)' }}>
                              {stats.byStatus.rejected}
                            </span>
                            <span className={styles.statLabel}>{t('internships.statsRejected')}</span>
                          </div>
                        </div>

                        {stats.applicationsByDay.length > 0 && (
                          <div className={styles.chartSection}>
                            <p className={styles.chartTitle}>{t('internships.statsChartTitle')}</p>
                            <MiniBarChart data={stats.applicationsByDay} />
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}

                <div className={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/hr/internships/${internship.id}/applicants`)}
                  >
                    {t('internships.viewApplicants')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenStats(internship.id)}
                  >
                    {isStatsOpen ? t('internships.hideStats') : t('internships.stats')}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Мини бар-чарт без библиотек ──────────────────────────────────────────────
interface BarChartProps {
  data: { date: string; count: number }[];
}

function MiniBarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', overflowX: 'auto', paddingBottom: '4px' }}>
      {data.map(({ date, count }) => {
        const heightPct = Math.round((count / max) * 100);
        const label = date.slice(5); // MM-DD
        return (
          <div
            key={date}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px', flex: '1 0 28px' }}
            title={`${date}: ${count} заявок`}
          >
            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{count}</span>
            <div
              style={{
                width: '100%',
                height: `${heightPct}%`,
                minHeight: '4px',
                background: 'var(--color-primary)',
                borderRadius: '3px 3px 0 0',
                opacity: 0.85,
              }}
            />
            <span style={{ fontSize: '9px', color: 'var(--color-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
