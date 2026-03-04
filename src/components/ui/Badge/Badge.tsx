import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'info' | 'success' | 'error' | 'warning' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'info',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  const classes = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

// Helper to map ApplicationStatus to badge variant
export function getStatusVariant(
  status: string,
): BadgeVariant {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'reviewed':
      return 'warning';
    case 'pending':
      return 'info';
    case 'published':
      return 'success';
    case 'draft':
      return 'neutral';
    case 'closed':
      return 'neutral';
    default:
      return 'neutral';
  }
}
