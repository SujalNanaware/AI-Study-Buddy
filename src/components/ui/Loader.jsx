import React from 'react';
import styles from './Loader.module.css';

export default function Loader({ fullPage = false, variant = 'spinner', small = false }) {
  return (
    <div className={`${styles.loader} ${fullPage ? styles.fullPage : ''}`}>
      {variant === 'spinner' ? (
        <div className={`${styles.spinner} ${small ? styles.small : ''}`} />
      ) : (
        <div className={styles.dots}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      )}
    </div>
  );
}
