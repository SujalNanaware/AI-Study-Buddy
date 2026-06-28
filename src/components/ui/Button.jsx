import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    icon && !children ? styles.icon : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {icon}
      {children}
    </button>
  );
}
