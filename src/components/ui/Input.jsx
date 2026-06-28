import React from 'react';
import styles from './Input.module.css';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.inputError : ''} ${className}`} {...props} />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''} ${className}`} {...props} />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''} ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
