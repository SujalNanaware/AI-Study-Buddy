import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Layers,
  Brain,
  Timer,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/flashcards', label: 'Flashcards', icon: Layers },
  { path: '/quiz', label: 'Quiz', icon: Brain },
  { path: '/timer', label: 'Pomodoro', icon: Timer },
  { path: '/documents', label: 'Documents', icon: FileText },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useSettingsStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.visible : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar */}
      <aside
        data-mobile-open={mobileOpen}
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}
      >
        {/* Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Sparkles size={22} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>StudyBuddy</span>
            <span className={styles.logoSubtitle}>AI Powered</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>
                <item.icon size={20} />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={styles.bottomSection}>
          <button className={styles.collapseBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className={styles.btnLabel}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          <button
            className={`${styles.collapseBtn} ${styles.desktopOnly}`}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className={styles.btnLabel}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
