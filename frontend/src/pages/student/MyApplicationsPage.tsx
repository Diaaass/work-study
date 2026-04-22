import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { applicationsApi } from '@/api/applications';
import { Card } from '@/components/ui/Card/Card';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Application } from '@/types/models';
import { ApplicationStatus } from '@/types/enums';
import { formatDateShort } from '@/utils/format';
import styles from './MyApplicationsPage.module.css';

type TabFilter = 'all' | ApplicationStatus;

export default function MyApplicationsPage() {
  const { t } = useTranslation('student');
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await applicationsApi.getMy();
        setApplications(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('applications.all') },
    { key: ApplicationStatus.Pending, label: t('applications.pending') },
    { key: ApplicationStatus.Accepted, label: t('applications.accepted') },
    { key: ApplicationStatus.Rejected, label: t('applications.rejected') },
  ];

  const filtered =
    activeTab === 'all'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{t('applications.title')}</h1>
        <div className={styles.appList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardSkeleton />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t('applications.title')}</h1>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className={styles.tabCount}>
                {applications.filter((a) =>
                  tab.key === 'all' ? true : a.status === tab.key,
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t('applications.noApplications')}</p>
          <p className={styles.emptyText}>{t('applications.startSearching')}</p>
        </div>
      ) : (
        <div className={styles.appList}>
          {sorted.map((app) => (
            <Card
              key={app.id}
              hoverable
              className={styles.appCard}
              onClick={() => navigate(`/internships/${app.internshipId}`)}
            >
              <div className={styles.appMain}>
                <div className={styles.appInfo}>
                  <h3 className={styles.appTitle}>
                    {app.internship?.title ?? t('applications.internship')}
                  </h3>
                  <p className={styles.appCompany}>
                    {app.internship?.company}
                  </p>
                  <span className={styles.appDate}>
                    {t('applications.appliedOn')} {formatDateShort(app.createdAt)}
                  </span>
                </div>
                <Badge variant={getStatusVariant(app.status)} size="md">
                  {t(`status.${app.status}`)}
                </Badge>
              </div>

              {app.feedback && (
                <div className={styles.feedback}>
                  <span className={styles.feedbackLabel}>
                    {t('applications.feedback')}:
                  </span>
                  <p className={styles.feedbackText}>{app.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
