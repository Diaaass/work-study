import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles } from 'lucide-react';
import { internshipsApi } from '@/api/internships';
import { aiApi } from '@/api/ai';
import { useAuth } from '@/hooks/useAuth';
import { CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipCard } from '@/components/ui/InternshipCard/InternshipCard';
import type { Internship } from '@/types/models';
import styles from './SearchPage.module.css';

// Нечёткий поиск: если 4 буквы подряд из запроса есть в тексте — совпадение
function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  // Каждое слово запроса проверяем отдельно
  return q.split(/\s+/).every(word => {
    if (word.length < 4) return t.includes(word); // короткие слова — точное вхождение
    // Скользящее окно по 4 буквы
    for (let i = 0; i <= word.length - 4; i++) {
      if (t.includes(word.slice(i, i + 4))) return true;
    }
    return false;
  });
}

export default function SearchPage() {
  const { t } = useTranslation('student');
  const { user } = useAuth();

  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    internshipsApi.getAll()
      .then(setAllInternships)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // AI скоры профиля — фоново, автоматически
  useEffect(() => {
    if (loading || user?.role !== 'student') return;
    aiApi.getRecommendations()
      .then((scored) => {
        const scoreMap = new Map(scored.map(i => [i.id, { matchScore: i.matchScore, matchReason: i.matchReason }]));
        setAllInternships(prev =>
          prev.map(i => {
            const ai = scoreMap.get(i.id);
            return ai ? { ...i, ...ai } : i;
          })
        );
      })
      .catch(() => {});
  }, [loading, user?.role]);

  const filtered = allInternships.filter((i) => {
    const q = searchInput.trim();
    if (q) {
      const searchableText = [i.title, i.company, ...(i.skills ?? [])].join(' ');
      if (!fuzzyMatch(searchableText, q)) return false;
    }
    if (locationFilter !== 'all' && i.city?.toLowerCase() !== locationFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && i.workType !== typeFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  const topRecommended = allInternships
    .filter(i => (i.matchScore ?? 0) >= 70)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 3);

  const hasQuery = searchInput.trim().length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>
            <Search size={16} />
          </span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t('search.placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('search.location')}</label>
          <select className={styles.filterSelect} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="all">{t('search.allLocations')}</option>
            <option value="Алматы">{t('search.almaty')}</option>
            <option value="Астана">{t('search.astana')}</option>
            <option value="Удалённо">{t('search.remote')}</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('search.type')}</label>
          <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">{t('search.allTypes')}</option>
            <option value="remote">{t('search.typeRemote')}</option>
            <option value="office">{t('search.typeOnsite')}</option>
            <option value="hybrid">{t('search.typeHybrid')}</option>
          </select>
        </div>
      </div>

      {!hasQuery && !loading && topRecommended.length > 0 && locationFilter === 'all' && typeFilter === 'all' && (
        <div className={styles.recommendedSection}>
          <div className={styles.recommendedHeader}>
            <Sparkles size={15} />
            <span>Рекомендовано для вас</span>
          </div>
          <div className={styles.recommendedGrid}>
            {topRecommended.map((internship, i) => (
              <InternshipCard key={internship.id} internship={internship} index={i} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}><CardSkeleton /></div>
          ))}
        </div>
      ) : (
        <>
          <p className={styles.resultsCount}>{t('search.results', { count: sorted.length })}</p>
          {sorted.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{t('search.noResults')}</p>
              <p className={styles.emptyText}>{t('search.tryDifferent')}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {sorted.map((internship, i) => (
                <InternshipCard key={internship.id} internship={internship} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
