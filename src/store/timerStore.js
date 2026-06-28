import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTimerStore = create(
  persist(
    (set, get) => ({
      // Settings
      workDuration: 25 * 60,    // seconds
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      sessionsBeforeLongBreak: 4,

      // Session state (not persisted separately)
      sessions: [],       // completed study sessions
      dailyStreak: 0,
      lastStudyDate: null,
      totalStudyTime: 0,  // seconds

      setWorkDuration: (mins) => set({ workDuration: mins * 60 }),
      setShortBreak: (mins) => set({ shortBreak: mins * 60 }),
      setLongBreak: (mins) => set({ longBreak: mins * 60 }),

      logSession: (duration, type = 'work') => {
        const today = new Date().toISOString().split('T')[0];
        const session = {
          id: Date.now().toString(36),
          date: today,
          duration,
          type,
          completedAt: new Date().toISOString(),
        };

        set((s) => {
          const lastDate = s.lastStudyDate;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          let newStreak = s.dailyStreak;

          if (lastDate === today) {
            // Same day, keep streak
          } else if (lastDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          return {
            sessions: [...s.sessions, session],
            dailyStreak: newStreak,
            lastStudyDate: today,
            totalStudyTime: s.totalStudyTime + duration,
          };
        });
      },

      getSessionsByDate: (date) => {
        return get().sessions.filter((s) => s.date === date);
      },

      getStudyTimeByDate: (date) => {
        return get()
          .sessions.filter((s) => s.date === date && s.type === 'work')
          .reduce((sum, s) => sum + s.duration, 0);
      },

      getWeeklyStudyTime: () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return get()
          .sessions.filter(
            (s) => s.type === 'work' && new Date(s.completedAt) >= weekAgo
          )
          .reduce((sum, s) => sum + s.duration, 0);
      },

      getTodaySessionCount: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().sessions.filter((s) => s.date === today && s.type === 'work').length;
      },
    }),
    {
      name: 'studybuddy-timer',
    }
  )
);
