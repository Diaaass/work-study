import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark } from 'lucide-react';
import { bookmarksApi } from '@/api/bookmarks';
import { InternshipCard } from '@/components/ui/InternshipCard/InternshipCard';
import { CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Internship } from '@/types/models';
import styles from './SavedPage.module.css';

export default function SavedPage() {
  const { t } = useTranslation('student');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi.getAll()
      .then(setInternships)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Bookmark size={22} className={styles.icon} />
        <h1 className={styles.title}>{t('saved.title')}</h1>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}><CardSkeleton /></div>
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className={styles.empty}>
          <Bookmark size={48} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('saved.empty')}</p>
          <p className={styles.emptyHint}>{t('saved.emptyHint')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {internships.map((internship, i) => (
            <InternshipCard key={internship.id} internship={internship} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
