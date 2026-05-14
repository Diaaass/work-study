import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, LayoutList, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { internshipsApi } from '@/api/internships';
import { applicationsApi } from '@/api/applications';
import { aiApi } from '@/api/ai';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipCard } from '@/components/ui/InternshipCard/InternshipCard';
import { StatCard } from '@/components/ui/StatCard/StatCard';
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

        // Фоново подгружаем AI-скоры и вливаем в список
        aiApi.getRecommendations()
          .then((scored) => {
            const scoreMap = new Map(scored.map(i => [i.id, { matchScore: i.matchScore, matchReason: i.matchReason }]));
            setInternships(prev =>
              prev.map(i => {
                const ai = scoreMap.get(i.id);
                return ai ? { ...i, ...ai } : i;
              })
            );
          })
          .catch(() => {});
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount  = applications.filter(a => a.status === ApplicationStatus.Pending).length;
  const acceptedCount = applications.filter(a => a.status === ApplicationStatus.Accepted).length;
  const totalCount    = applications.length;

  const sortedInternships = [...internships]
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="50%" />
        <div className={styles.statsRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="title" width="30%" />
            </div>
          ))}
        </div>
        <Skeleton variant="title" width="40%" />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton variant="text" count={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const profileComplete = !!(user?.skills?.length && user?.major && user?.university);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Zap size={12} />
            <span>{t('dashboard.heroBadge')}</span>
          </div>
          <h1 className={styles.heroTitle}>
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] })}
          </h1>
          <p className={styles.heroSubtitle}>
            {t('dashboard.heroSubtitle')}
          </p>
          {!profileComplete && (
            <button className={styles.heroCta} onClick={() => navigate('/profile')}>
              <Sparkles size={14} />
              {t('dashboard.heroCta')}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>
      </div>

      <div className={styles.statsRow}>
        <StatCard value={pendingCount}  label={t('dashboard.pending')}   icon={<Clock size={20} />}        color="cyan"   max={totalCount || 1} />
        <StatCard value={acceptedCount} label={t('dashboard.accepted')}  icon={<CheckCircle size={20} />}  color="green"  max={totalCount || 1} />
        <StatCard value={totalCount}    label={t('dashboard.totalApps')} icon={<LayoutList size={20} />}   color="purple" />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Sparkles size={16} className={styles.sparklesIcon} />
          {t('dashboard.recommendations')}
        </h2>
        {sortedInternships.length === 0 ? (
          <p className={styles.emptyText}>{t('dashboard.noRecommendations')}</p>
        ) : (
          <div className={styles.grid}>
            {sortedInternships.slice(0, 3).map((internship, i) => (
              <InternshipCard key={internship.id} internship={internship} index={i} />
            ))}
          </div>
        )}
      </section>

      {recentApplications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('dashboard.recentApps')}</h2>
          <div className={styles.appsList}>
            {recentApplications.map((app, i) => (
              <div
                key={app.id}
                className={styles.appCard}
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate(`/internships/${app.internshipId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/internships/${app.internshipId}`)}
              >
                <div className={styles.appInfo}>
                  <h4 className={styles.appTitle}>
                    {app.internship?.title ?? t('dashboard.internship')}
                  </h4>
                  <p className={styles.appCompany}>{app.internship?.company}</p>
                  <span className={styles.appDate}>{formatDateShort(app.createdAt)}</span>
                </div>
                <Badge variant={getStatusVariant(app.status)}>
                  {t(`status.${app.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
