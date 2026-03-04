import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
  hoverable?: boolean;
  bordered?: boolean;
  children: ReactNode;
}

export function Card({
  padding = 'md',
  hoverable = false,
  bordered = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    padding === 'md' ? styles.padded : padding === 'sm' ? styles.paddedSm : '',
    hoverable ? styles.hoverable : '',
    bordered ? styles.bordered : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
