import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wifi, Building2, Shuffle, MapPin, Users, Bookmark } from 'lucide-react';
import type { Internship } from '@/types/models';
import { SkillBadge } from '../SkillBadge/SkillBadge';
import { MatchScore } from '../MatchScore/MatchScore';
import { useBookmarksContext } from '@/context/BookmarksContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './InternshipCard.module.css';

const COMPANY_COLORS = [
  '#c47a24', '#b5621e', '#9c5a18', '#a8582c',
  '#d4922e', '#8b6420', '#c49038', '#7a4a18',
];

function getCompanyColor(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

const WORK_TYPE_CONFIG = {
  remote: { icon: <Wifi size={12} />, label: 'Remote', cls: 'remote' },
  office: { icon: <Building2 size={12} />, label: 'Office', cls: 'office' },
  hybrid: { icon: <Shuffle size={12} />, label: 'Hybrid', cls: 'hybrid' },
};

interface InternshipCardProps {
  internship: Internship;
  index?: number;
}

export function InternshipCard({ internship, index = 0 }: InternshipCardProps) {
  const { t } = useTranslation('student');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarksContext();

  const color = getCompanyColor(internship.company);
  const workType = WORK_TYPE_CONFIG[internship.workType as keyof typeof WORK_TYPE_CONFIG]
    ?? { icon: <Building2 size={12} />, label: internship.workType, cls: 'office' };

  const isHot = internship.applicantsCount != null && internship.applicantsCount > 10;
  const isHighPay = (internship.salary ?? 0) > 200000;
  const deadlineSoon = internship.deadline
    ? (new Date(internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 7
    : false;

  const delay = Math.min(index * 0.08, 0.5);

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => navigate(`/internships/${internship.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/internships/${internship.id}`)}
      aria-label={`${internship.title} at ${internship.company}`}
    >
      {/* Top badges */}
      <div className={styles.topBadges}>
        {isHot && <span className={styles.hotBadge}>Hot</span>}
        {deadlineSoon && <span className={styles.urgentBadge}>Срочно</span>}
        {user?.role === 'student' && (
          <button
            className={`${styles.bookmarkBtn} ${isBookmarked(internship.id) ? styles.bookmarkActive : ''}`}
            onClick={(e) => { e.stopPropagation(); toggle(internship.id); }}
            aria-label="Bookmark"
          >
            <Bookmark size={14} />
          </button>
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar} style={{ background: color }}>
          {internship.companyLogo
            ? <img src={internship.companyLogo} alt={internship.company} />
            : internship.company.charAt(0).toUpperCase()
          }
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>{internship.title}</h3>
          <p className={styles.company}>{internship.company}</p>
        </div>
      </div>

      {/* Meta */}
      <div className={styles.meta}>
        <span className={`${styles.workType} ${styles[workType.cls]}`}>
          {workType.icon} {workType.label}
        </span>
        <span className={styles.city}><MapPin size={12} /> {internship.city}</span>
        {internship.salary != null && internship.salary > 0 && (
          <span className={`${styles.salary} ${isHighPay ? styles.salaryHigh : ''}`}>
            {(internship.salary / 1000).toFixed(0)}K ₸
          </span>
        )}
      </div>

      {/* Skills */}
      {internship.skills?.length > 0 && (
        <div className={styles.skills}>
          {internship.skills.slice(0, 4).map((s) => (
            <SkillBadge key={s} skill={s} />
          ))}
          {internship.skills.length > 4 && (
            <span className={styles.moreSkills}>+{internship.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        {internship.matchScore != null && (
          <MatchScore score={internship.matchScore} />
        )}
        <span className={styles.applicants}>
          <Users size={13} /> {internship.applicantsCount ?? 0}
        </span>
      </div>

      {/* Hover apply button */}
      <div className={styles.applyOverlay}>
        <button className={styles.applyBtn} onClick={(e) => { e.stopPropagation(); navigate(`/internships/${internship.id}/apply`); }}>
          {t('apply.submit')}
        </button>
      </div>
    </article>
  );
}
