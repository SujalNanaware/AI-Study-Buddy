import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuizStore = create(
  persist(
    (set, get) => ({
      quizHistory: [],
      currentQuiz: null,

      setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

      startQuiz: (topic, questions, difficulty) => {
        const quiz = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          topic,
          difficulty,
          questions,
          answers: new Array(questions.length).fill(null),
          startedAt: new Date().toISOString(),
          completedAt: null,
          score: null,
        };
        set({ currentQuiz: quiz });
        return quiz;
      },

      answerQuestion: (index, answer) => {
        set((s) => {
          if (!s.currentQuiz) return s;
          const answers = [...s.currentQuiz.answers];
          answers[index] = answer;
          return { currentQuiz: { ...s.currentQuiz, answers } };
        });
      },

      completeQuiz: () => {
        const quiz = get().currentQuiz;
        if (!quiz) return null;

        let correct = 0;
        quiz.questions.forEach((q, i) => {
          if (quiz.answers[i] === q.answer) correct++;
        });

        const score = Math.round((correct / quiz.questions.length) * 100);
        const completedQuiz = {
          ...quiz,
          completedAt: new Date().toISOString(),
          score,
          correct,
          total: quiz.questions.length,
        };

        set((s) => ({
          currentQuiz: completedQuiz,
          quizHistory: [completedQuiz, ...s.quizHistory],
        }));

        return completedQuiz;
      },

      clearCurrentQuiz: () => set({ currentQuiz: null }),

      getQuizStats: () => {
        const history = get().quizHistory;
        if (history.length === 0) {
          return { totalQuizzes: 0, avgScore: 0, bestScore: 0, totalQuestions: 0 };
        }
        return {
          totalQuizzes: history.length,
          avgScore: Math.round(history.reduce((sum, q) => sum + q.score, 0) / history.length),
          bestScore: Math.max(...history.map((q) => q.score)),
          totalQuestions: history.reduce((sum, q) => sum + q.total, 0),
        };
      },
    }),
    {
      name: 'studybuddy-quiz',
    }
  )
);
