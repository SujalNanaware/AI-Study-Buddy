import React from 'react';
import Sidebar from './Sidebar';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);

  return (
    <div className={`${styles.layout} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      {/* Animated background blobs */}
      <div className="particles-bg" />

      <Sidebar />

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
