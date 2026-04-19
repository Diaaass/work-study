import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { internshipsApi } from '@/api/internships';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton/Skeleton';
import type { Internship } from '@/types/models';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { t } = useTranslation('student');
  const navigate = useNavigate();

  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await internshipsApi.getAll();
        setAllInternships(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const filtered = allInternships.filter((internship) => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchesSearch =
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.skills.some((s) => s.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    if (locationFilter !== 'all') {
      if (internship.city.toLowerCase() !== locationFilter.toLowerCase()) {
        return false;
      }
    }

    if (typeFilter !== 'all') {
      if (internship.workType !== typeFilter) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>&#128269;</span>
            <input className={styles.searchInput} disabled placeholder="..." />
          </div>
        </div>
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
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t('search.placeholder')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('search.location')}</label>
          <select
            className={styles.filterSelect}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">{t('search.allLocations')}</option>
            <option value="Алматы">{t('search.almaty')}</option>
            <option value="Астана">{t('search.astana')}</option>
            <option value="Удалённо">{t('search.remote')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('search.type')}</label>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t('search.allTypes')}</option>
            <option value="remote">{t('search.typeRemote')}</option>
            <option value="office">{t('search.typeOnsite')}</option>
            <option value="hybrid">{t('search.typeHybrid')}</option>
          </select>
        </div>
      </div>

      <p className={styles.resultsCount}>
        {t('search.results', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t('search.noResults')}</p>
          <p className={styles.emptyText}>{t('search.tryDifferent')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((internship) => (
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
                  <p className={styles.cardLocation}>{internship.city}</p>
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
                <Badge variant="info">{internship.workType}</Badge>
                {internship.salary && (
                  <span className={styles.salary}>{internship.salary}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
