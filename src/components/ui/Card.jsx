import React from 'react';
import styles from './Card.module.css';

export default function Card({
  children,
  hoverable = false,
  gradient = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : '',
    gradient ? styles.gradient : '',
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

export function CardHeader({ title, description, action }) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
