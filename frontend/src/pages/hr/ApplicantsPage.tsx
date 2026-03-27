import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import { internshipsApi } from '@/api/internships';
import { applicationsApi } from '@/api/applications';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge, getStatusVariant } from '@/components/ui/Badge/Badge';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { ApplicationStatus } from '@/types/enums';
import type { Internship, Application, ApiError } from '@/types/models';
import { formatDateShort, getInitials } from '@/utils/format';
import styles from './ApplicantsPage.module.css';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

export default function ApplicantsPage() {
  const { t } = useTranslation('hr');
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [internshipData, applicantsData] = await Promise.all([
        internshipsApi.getById(id),
        applicationsApi.getByInternship(id),
      ]);
      setInternship(internshipData);
      setApplicants(applicantsData);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || t('applicants.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (applicationId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
  };

  const handleStatusUpdate = async (
    applicationId: string,
    status: ApplicationStatus,
  ) => {
    setUpdatingId(applicationId);
    try {
      const feedback = feedbacks[applicationId]?.trim() || undefined;
      await applicationsApi.updateStatus(applicationId, status, feedback);
      showToast(
        status === ApplicationStatus.Accepted
          ? t('applicants.acceptedSuccess')
          : t('applicants.rejectedSuccess'),
        'success',
      );
      setFeedbacks((prev) => {
        const next = { ...prev };
        delete next[applicationId];
        return next;
      });
      await fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || t('applicants.updateError'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('applicants.tabAll') },
    { key: 'pending', label: t('applicants.tabPending') },
    { key: 'accepted', label: t('applicants.tabAccepted') },
    { key: 'rejected', label: t('applicants.tabRejected') },
  ];

  const filteredApplicants = applicants.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getTabCount = (tab: StatusFilter) => {
    if (tab === 'all') return applicants.length;
    return applicants.filter((app) => app.status === tab).length;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="text" width="120px" />
        <div className={styles.header}>
          <Skeleton variant="title" width="400px" />
          <Skeleton variant="text" width="200px" />
        </div>
        <Skeleton variant="rect" width="100%" height={44} />
        <div className={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonRow}>
                <Skeleton variant="circle" width={48} height={48} />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="title" width="40%" />
                  <Skeleton variant="text" width="30%" />
                </div>
                <Skeleton variant="rect" width={70} height={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Link to="/hr/internships" className={styles.backLink}>
          &larr; {t('applicants.backToInternships')}
        </Link>
        <div className={styles.errorState}>
          <p className={styles.errorText}>{error}</p>
          <Button onClick={fetchData}>{t('applicants.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/hr/internships" className={styles.backLink}>
        &larr; {t('applicants.backToInternships')}
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {t('applicants.title', { internship: internship?.title || '' })}
        </h1>
        <p className={styles.subtitle}>
          {t('applicants.totalCount', { count: applicants.length })}
        </p>
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

      {filteredApplicants.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>&#128100;</div>
          <h3 className={styles.emptyTitle}>{t('applicants.emptyTitle')}</h3>
          <p className={styles.emptyText}>{t('applicants.emptyText')}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredApplicants.map((application) => {
            const student = application.student;
            const isExpanded = expandedIds.has(application.id);
            const isUpdating = updatingId === application.id;
            const isPending = application.status === ApplicationStatus.Pending;

            return (
              <div key={application.id} className={styles.applicantCard}>
                {/* Main clickable area */}
                <div
                  className={styles.cardMain}
                  onClick={() => toggleExpand(application.id)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.studentInfo}>
                      <div className={styles.avatar}>
                        {student ? getInitials(student.name) : '??'}
                      </div>
                      <div>
                        <h3 className={styles.studentName}>
                          {student?.name || t('applicants.unknownStudent')}
                        </h3>
                        <p className={styles.studentUniversity}>
                          {student?.university || t('applicants.noUniversity')}
                        </p>
                      </div>
                    </div>
                    <div className={styles.cardMetaRight}>
                      <span className={styles.appliedDate}>
                        {formatDateShort(application.appliedAt)}
                      </span>
                      <Badge variant={getStatusVariant(application.status)}>
                        {t(`applicants.status.${application.status}`)}
                      </Badge>
                      <span
                        className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                      >
                        &#9660;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className={styles.expandable}>
                    {/* Cover Letter */}
                    <div className={styles.expandSection}>
                      <div className={styles.expandLabel}>
                        {t('applicants.coverLetter')}
                      </div>
                      <p className={styles.coverLetter}>
                        {application.coverLetter || t('applicants.noCoverLetter')}
                      </p>
                    </div>

                    {/* Resume */}
                    {application.resumeUrl && (
                      <div className={styles.expandSection}>
                        <div className={styles.expandLabel}>
                          {t('applicants.resume')}
                        </div>
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.resumeLink}
                        >
                          &#128196; {t('applicants.viewResume')}
                        </a>
                      </div>
                    )}

                    {/* Skills */}
                    {student?.skills && student.skills.length > 0 && (
                      <div className={styles.expandSection}>
                        <div className={styles.expandLabel}>
                          {t('applicants.skills')}
                        </div>
                        <div className={styles.skillsList}>
                          {student.skills.map((skill) => (
                            <Badge key={skill} variant="info" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Existing feedback */}
                    {application.feedback && (
                      <div className={styles.expandSection}>
                        <div className={styles.expandLabel}>
                          {t('applicants.feedback')}
                        </div>
                        <p className={styles.coverLetter}>
                          {application.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons - only for pending applications */}
                {isExpanded && isPending && (
                  <div className={styles.actionSection}>
                    <div className={styles.feedbackRow}>
                      <Input
                        as="textarea"
                        placeholder={t('applicants.feedbackPlaceholder')}
                        value={feedbacks[application.id] || ''}
                        onChange={(e) =>
                          setFeedbacks((prev) => ({
                            ...prev,
                            [application.id]: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className={styles.actionButtons}>
                      <Button
                        variant="success"
                        size="sm"
                        loading={isUpdating}
                        onClick={() =>
                          handleStatusUpdate(
                            application.id,
                            ApplicationStatus.Accepted,
                          )
                        }
                      >
                        {t('applicants.accept')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={isUpdating}
                        onClick={() =>
                          handleStatusUpdate(
                            application.id,
                            ApplicationStatus.Rejected,
                          )
                        }
                      >
                        {t('applicants.reject')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
