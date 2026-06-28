import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        set({ theme: newTheme });
      },

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      initTheme: () => {
        const theme = get().theme;
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'studybuddy-settings',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useSettingsStore.getState().theme;
  document.documentElement.setAttribute('data-theme', theme);
}
