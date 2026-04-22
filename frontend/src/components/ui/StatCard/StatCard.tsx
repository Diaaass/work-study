import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  value: number;
  label: string;
  icon: ReactNode;
  color?: 'purple' | 'cyan' | 'green' | 'orange';
  max?: number;
}

export function StatCard({ value, label, icon, color = 'purple', max }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(value * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const percent = max ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.value}>{displayed}</span>
      </div>
      <p className={styles.label}>{label}</p>
      {max !== undefined && (
        <div className={styles.barTrack}>
          <div className={`${styles.barFill} ${styles[color + 'Bar']}`} style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}
