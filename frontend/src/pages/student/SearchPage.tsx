import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { internshipsApi } from '@/api/internships';
import { CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import { InternshipCard } from '@/components/ui/InternshipCard/InternshipCard';
import type { Internship } from '@/types/models';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { t } = useTranslation('student');

  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    internshipsApi.getAll()
      .then(setAllInternships)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value), 300);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const filtered = allInternships.filter((internship) => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matches =
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.skills.some((s) => s.toLowerCase().includes(query));
      if (!matches) return false;
    }
    if (locationFilter !== 'all' && internship.city.toLowerCase() !== locationFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && internship.workType !== typeFilter) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}><Search size={16} /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t('search.placeholder')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Filters */}
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

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}><CardSkeleton /></div>
          ))}
        </div>
      ) : (
        <>
          <p className={styles.resultsCount}>{t('search.results', { count: filtered.length })}</p>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{t('search.noResults')}</p>
              <p className={styles.emptyText}>{t('search.tryDifferent')}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((internship, i) => (
                <InternshipCard key={internship.id} internship={internship} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
