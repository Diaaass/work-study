import styles from './MatchScore.module.css';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

export function MatchScore({ score, size = 'sm' }: MatchScoreProps) {
  const isMagic = score >= 90;
  const color = score >= 80 ? 'purple' : score >= 60 ? 'cyan' : 'default';

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      {isMagic && (
        <span className={styles.magicBadge}>Magic Match</span>
      )}
      <div className={styles.bar}>
        <div
          className={`${styles.fill} ${styles[color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`${styles.label} ${styles[color + 'Text']}`}>{score}%</span>
    </div>
  );
}
