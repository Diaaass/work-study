import styles from './Skeleton.module.css';

type SkeletonVariant = 'text' | 'title' | 'circle' | 'rect' | 'card';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const classes = [styles.skeleton, styles[variant], className].filter(Boolean).join(' ');

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={classes} style={style} />
      ))}
    </>
  );
}

// Pre-built skeleton compositions
export function CardSkeleton() {
  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <Skeleton variant="title" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Skeleton variant="rect" width={60} height={24} />
        <Skeleton variant="rect" width={80} height={24} />
        <Skeleton variant="rect" width={70} height={24} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className={styles.page}>
      <Skeleton variant="title" width="40%" />
      <Skeleton variant="text" count={3} />
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        <Skeleton variant="card" width="33%" />
        <Skeleton variant="card" width="33%" />
        <Skeleton variant="card" width="33%" />
      </div>
    </div>
  );
}
