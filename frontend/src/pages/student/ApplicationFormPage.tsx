import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { internshipsApi } from '@/api/internships';
import { applicationsApi } from '@/api/applications';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Internship, ApiError } from '@/types/models';
import styles from './ApplicationFormPage.module.css';

const MAX_COVER_LETTER = 1000;

export default function ApplicationFormPage() {
  const { t } = useTranslation('student');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resumeUrl = user?.resumeUrl ?? '';

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await internshipsApi.getById(id);
        setInternship(data);
      } catch {
        showToast(t('apply.loadError'), 'error');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t, showToast, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!coverLetter.trim()) {
      errs.coverLetter = t('apply.coverLetterRequired');
    }
    if (coverLetter.length > MAX_COVER_LETTER) {
      errs.coverLetter = t('apply.coverLetterTooLong');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitClick = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!id) return;
    setShowConfirm(false);
    setSubmitting(true);

    try {
      await applicationsApi.create({
        internshipId: id,
        coverLetter: coverLetter.trim(),
        resumeUrl: resumeUrl.trim(),
      });
      showToast(t('apply.success'), 'success');
      navigate('/my-applications');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        showToast(t('apply.alreadyApplied'), 'error');
      } else {
        showToast(apiErr.message || t('apply.error'), 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" width="60%" />
        <Skeleton variant="text" width="40%" />
        <div style={{ marginTop: '24px' }}>
          <Skeleton variant="text" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backLink} onClick={() => navigate(-1)}>
        &larr; {t('detail.back')}
      </button>

      {internship && (
        <Card className={styles.contextCard}>
          <h3 className={styles.contextTitle}>{internship.title}</h3>
          <p className={styles.contextCompany}>{internship.company}</p>
        </Card>
      )}

      <h1 className={styles.pageTitle}>{t('apply.title', { title: internship?.title })}</h1>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitClick();
        }}
        noValidate
      >
        <div className={styles.fieldGroup}>
          <Input
            as="textarea"
            label={t('apply.coverLetter')}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            error={errors.coverLetter}
            placeholder={t('apply.coverLetterPlaceholder')}
            rows={8}
          />
          <span
            className={`${styles.charCount} ${
              coverLetter.length > MAX_COVER_LETTER ? styles.charCountError : ''
            }`}
          >
            {coverLetter.length}/{MAX_COVER_LETTER}
          </span>
        </div>

        {/* Resume block */}
        <div>
          <p className={styles.resumeLabel}>{t('apply.resume')}</p>
          {resumeUrl ? (
            <div className={styles.resumeReady}>
              <FileText size={18} className={styles.resumeIcon} />
              <span className={styles.resumeReadyText}>{t('apply.resumeFromProfile')}</span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>
                <ExternalLink size={14} /> {t('apply.resumeView')}
              </a>
            </div>
          ) : (
            <div className={styles.resumeWarning}>
              <AlertCircle size={18} className={styles.resumeWarningIcon} />
              <div>
                <p className={styles.resumeWarningText}>{t('apply.resumeNotFound')}</p>
                <Link to="/profile" className={styles.resumeLink}>
                  {t('apply.resumeGoProfile')}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            {t('apply.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('apply.submit')}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t('apply.confirmTitle')}
        size="sm"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              {t('apply.cancel')}
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              {t('apply.confirm')}
            </Button>
          </div>
        }
      >
        <p className={styles.confirmText}>{t('apply.confirmMessage')}</p>
      </Modal>
    </div>
  );
}
