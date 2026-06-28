import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Loader from './components/ui/Loader';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
const FlashcardsPage = lazy(() => import('./features/flashcards/FlashcardsPage'));
const QuizPage = lazy(() => import('./features/quiz/QuizPage'));
const TimerPage = lazy(() => import('./features/timer/TimerPage'));
const DocumentsPage = lazy(() => import('./features/documents/DocumentsPage'));

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<Loader fullPage />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
