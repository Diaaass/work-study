import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { internshipsApi } from '@/api/internships';
import { applicationsApi } from '@/api/applications';
import { Card } from '@/components/ui/Card/Card';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Internship, Application } from '@/types/models';
import { formatDate, timeAgo } from '@/utils/format';
import styles from './InternshipDetailPage.module.css';

export default function InternshipDetailPage() {
  const { t } = useTranslation('student');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [internshipData, myApps] = await Promise.all([
          internshipsApi.getById(id),
          applicationsApi.getMy(),
        ]);
        setInternship(internshipData);
        const applied = myApps.find((a) => String(a.internshipId) === id);
        if (applied) {
          setExistingApp(applied);
        }
      } catch {
        setError(t('detail.notFound'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <Skeleton variant="title" width="70%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" count={3} />
          <div style={{ marginTop: '16px' }}>
            <Skeleton variant="text" count={5} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Skeleton variant="rect" width={60} height={24} />
            <Skeleton variant="rect" width={80} height={24} />
            <Skeleton variant="rect" width={70} height={24} />
          </div>
        </div>
        <div className={styles.sidebar}>
          <Card>
            <Skeleton variant="text" count={4} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>{t('detail.error')}</h2>
          <p>{error || t('detail.notFound')}</p>
          <Button onClick={() => navigate('/search')}>{t('detail.backToSearch')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <button className={styles.backLink} onClick={() => navigate(-1)}>
          &larr; {t('detail.back')}
        </button>

        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{internship.title}</h1>
            <p className={styles.company}>{internship.company}</p>
            <div className={styles.meta}>
              <Badge variant="info">{internship.city}</Badge>
              <Badge variant="neutral">{internship.workType}</Badge>
              <span className={styles.posted}>
                {timeAgo(internship.createdAt)}
              </span>
            </div>
          </div>
          {internship.matchScore != null && (
            <div className={styles.matchCircleLarge}>
              <span className={styles.matchValue}>{internship.matchScore}%</span>
              <span className={styles.matchLabel}>{t('dashboard.match')}</span>
            </div>
          )}
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('detail.description')}</h2>
          <p className={styles.descriptionText}>{internship.description}</p>
        </section>

        {internship.requirements.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('detail.requirements')}</h2>
            <ul className={styles.requirementsList}>
              {internship.requirements.map((req, idx) => (
                <li key={idx} className={styles.requirementItem}>
                  {req}
                </li>
              ))}
            </ul>
          </section>
        )}

        {internship.skills.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('detail.skills')}</h2>
            <div className={styles.skillsRow}>
              {internship.skills.map((skill) => (
                <Badge key={skill} variant="info" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={styles.sidebar}>
        <Card className={styles.sidebarCard}>
          <div className={styles.sidebarRow}>
            <span className={styles.sidebarLabel}>{t('detail.salary')}</span>
            <span className={styles.sidebarValue}>
              {internship.salary || t('detail.negotiable')}
            </span>
          </div>
          <div className={styles.sidebarRow}>
            <span className={styles.sidebarLabel}>{t('detail.duration')}</span>
            <span className={styles.sidebarValue}>{internship.duration}</span>
          </div>
          <div className={styles.sidebarRow}>
            <span className={styles.sidebarLabel}>{t('detail.deadline')}</span>
            <span className={styles.sidebarValue}>
              {internship.deadline ? formatDate(internship.deadline) : '—'}
            </span>
          </div>
          <div className={styles.sidebarRow}>
            <span className={styles.sidebarLabel}>{t('detail.applicantsLabel')}</span>
            <span className={styles.sidebarValue}>{internship.applicantsCount ?? 0}</span>
          </div>

          <div className={styles.sidebarActions}>
            {existingApp ? (
              <div className={styles.appliedState}>
                <Badge variant={getStatusVariant(existingApp.status)} size="md">
                  {t('detail.alreadyApplied')}
                </Badge>
                <span className={styles.appliedStatus}>
                  {t(`status.${existingApp.status}`)}
                </span>
              </div>
            ) : (
              <Button
                fullWidth
                onClick={() => navigate(`/internships/${internship.id}/apply`)}
              >
                {t('detail.applyNow')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
