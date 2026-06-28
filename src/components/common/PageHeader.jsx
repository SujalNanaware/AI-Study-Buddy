import React from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
