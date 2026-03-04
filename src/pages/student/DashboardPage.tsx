import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { internshipsApi } from '@/api/internships';
import { applicationsApi } from '@/api/applications';
import { Card } from '@/components/ui/Card/Card';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Internship, Application } from '@/types/models';
import { ApplicationStatus } from '@/types/enums';
import { formatDateShort } from '@/utils/format';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { t } = useTranslation('student');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recData, appData] = await Promise.all([
          internshipsApi.getRecommended(),
          applicationsApi.getMy(),
        ]);
        setInternships(recData);
        setApplications(appData);
      } catch {
        // errors handled silently for dashboard
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = applications.filter(
    (a) => a.status === ApplicationStatus.Pending,
  ).length;
  const acceptedCount = applications.filter(
    (a) => a.status === ApplicationStatus.Accepted,
  ).length;
  const totalCount = applications.length;

  const sortedInternships = [...internships].sort(
    (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
  );

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="50%" />
        <div className={styles.statsRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="title" width="30%" />
            </Card>
          ))}
        </div>
        <Skeleton variant="title" width="40%" />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
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
      <h1 className={styles.welcome}>
        {t('dashboard.welcome', { name: user?.name })}
      </h1>

      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{pendingCount}</span>
          <span className={styles.statLabel}>{t('dashboard.pending')}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.statSuccess}`}>
            {acceptedCount}
          </span>
          <span className={styles.statLabel}>{t('dashboard.accepted')}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{totalCount}</span>
          <span className={styles.statLabel}>{t('dashboard.totalApps')}</span>
        </Card>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dashboard.recommendations')}</h2>
        {sortedInternships.length === 0 ? (
          <p className={styles.emptyText}>{t('dashboard.noRecommendations')}</p>
        ) : (
          <div className={styles.grid}>
            {sortedInternships.map((internship) => (
              <Card
                key={internship.id}
                hoverable
                className={styles.internshipCard}
                onClick={() => navigate(`/internships/${internship.id}`)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{internship.title}</h3>
                    <p className={styles.cardCompany}>{internship.company}</p>
                    <p className={styles.cardLocation}>{internship.location}</p>
                  </div>
                  {internship.matchScore != null && (
                    <div className={styles.matchCircle}>
                      <span className={styles.matchValue}>
                        {internship.matchScore}%
                      </span>
                      <span className={styles.matchLabel}>{t('dashboard.match')}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardFooter}>
                  <Badge variant="info">{internship.type}</Badge>
                  {internship.salary && (
                    <span className={styles.salary}>{internship.salary}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {recentApplications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('dashboard.recentApps')}</h2>
          <div className={styles.appsList}>
            {recentApplications.map((app) => (
              <Card
                key={app.id}
                hoverable
                className={styles.appCard}
                onClick={() => navigate(`/internships/${app.internshipId}`)}
              >
                <div className={styles.appInfo}>
                  <h4 className={styles.appTitle}>
                    {app.internship?.title ?? t('dashboard.internship')}
                  </h4>
                  <p className={styles.appCompany}>
                    {app.internship?.company}
                  </p>
                  <span className={styles.appDate}>
                    {formatDateShort(app.appliedAt)}
                  </span>
                </div>
                <Badge variant={getStatusVariant(app.status)}>
                  {t(`status.${app.status}`)}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
