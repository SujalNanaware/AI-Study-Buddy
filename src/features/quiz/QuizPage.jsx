import React, { useState } from 'react';
import { Brain, Sparkles, ChevronRight, ChevronLeft, RotateCcw, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { useQuizStore } from '../../store/quizStore';
import { generateQuiz } from '../../services/gemini';
import { DIFFICULTY_LEVELS, QUIZ_QUESTION_COUNTS } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import styles from './QuizPage.module.css';

function QuizSetup({ onStart }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [topicError, setTopicError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTopicError('Quiz topic is required.');
      return;
    }
    if (topic.trim().length < 3) {
      setTopicError('Please specify a more descriptive topic (at least 3 characters).');
      return;
    }
    setTopicError('');
    setLoading(true);
    try {
      const questions = await generateQuiz(topic.trim(), count, difficulty);
      onStart(topic.trim(), questions, difficulty);
    } catch (err) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.generating}>
        <Loader />
        <p className={styles.generatingText}>Generating your quiz with AI...</p>
      </div>
    );
  }

  return (
    <div className={styles.setupCard}>
      <h2 className={styles.setupTitle}>🧠 Create a Quiz</h2>
      <p className={styles.setupSubtitle}>
        Enter a topic and let AI generate a personalized quiz for you
      </p>
      <div className={styles.setupForm}>
        <Input
          label="Topic"
          placeholder="e.g., JavaScript Promises, Cell Biology, World War II..."
          value={topic}
          error={topicError}
          onChange={(e) => {
            setTopic(e.target.value);
            if (e.target.value.trim().length >= 3) setTopicError('');
          }}
          autoFocus
        />

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Difficulty
          </label>
          <div className={styles.difficultyGrid}>
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                className={`${styles.difficultyOption} ${difficulty === level.value ? styles.selected : ''}`}
                onClick={() => setDifficulty(level.value)}
              >
                {level.value === 'easy' ? '🟢' : level.value === 'medium' ? '🟡' : '🔴'}{' '}
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Number of Questions
          </label>
          <div className={styles.countGrid}>
            {QUIZ_QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                className={`${styles.countOption} ${count === n ? styles.selected : ''}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleGenerate}
          icon={<Sparkles size={18} />}
        >
          Generate Quiz
        </Button>
      </div>
    </div>
  );
}

function QuizPlayer({ quiz, onAnswer, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const question = quiz.questions[currentQ];
  const selectedAnswer = quiz.answers[currentQ];

  const handleSelect = (option) => {
    onAnswer(currentQ, option);
  };

  const isLast = currentQ === quiz.questions.length - 1;

  return (
    <div className={styles.quizPlayer}>
      {/* Progress */}
      <div className={styles.quizProgress}>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {currentQ + 1} / {quiz.questions.length}
        </span>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQ}
        className={styles.questionCard}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.questionNumber}>Question {currentQ + 1}</div>
        <div className={styles.questionText}>{question.question}</div>
        <div className={styles.options}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`${styles.option} ${selectedAnswer === opt ? styles.selected : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <span className={styles.optionLetter}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className={styles.quizNav}>
        <Button
          variant="secondary"
          icon={<ChevronLeft size={16} />}
          onClick={() => setCurrentQ((q) => q - 1)}
          disabled={currentQ === 0}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            icon={<Trophy size={16} />}
            onClick={onComplete}
            disabled={quiz.answers.some((a) => a === null)}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setCurrentQ((q) => q + 1)}
            disabled={!selectedAnswer}
          >
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResults({ quiz, onRetry, onNewQuiz }) {
  const getMessage = (score) => {
    if (score >= 90) return '🏆 Outstanding! You nailed it!';
    if (score >= 70) return '🎉 Great job! Keep it up!';
    if (score >= 50) return '👍 Good effort! Room to improve.';
    return '💪 Keep studying, you\'ll get there!';
  };

  return (
    <>
      <motion.div
        className={styles.resultsCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.scoreCircle}>
          <span className={styles.scoreValue}>{quiz.score}%</span>
          <span className={styles.scoreLabel}>Score</span>
        </div>

        <h2 className={styles.resultsTitle}>{getMessage(quiz.score)}</h2>
        <p className={styles.resultsSubtitle}>
          {quiz.topic} • {quiz.difficulty} difficulty
        </p>

        <div className={styles.resultStats}>
          <div className={styles.resultStat}>
            <div className={styles.resultStatValue} style={{ color: 'var(--color-success)' }}>
              {quiz.correct}
            </div>
            <div className={styles.resultStatLabel}>Correct</div>
          </div>
          <div className={styles.resultStat}>
            <div className={styles.resultStatValue} style={{ color: 'var(--color-error)' }}>
              {quiz.total - quiz.correct}
            </div>
            <div className={styles.resultStatLabel}>Incorrect</div>
          </div>
          <div className={styles.resultStat}>
            <div className={styles.resultStatValue}>{quiz.total}</div>
            <div className={styles.resultStatLabel}>Total</div>
          </div>
        </div>

        <div className={styles.resultsActions}>
          <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onRetry}>
            Retry Quiz
          </Button>
          <Button icon={<Sparkles size={16} />} onClick={onNewQuiz}>
            New Quiz
          </Button>
        </div>
      </motion.div>

      {/* Review Section */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewTitle}>📝 Review Answers</h3>
        {quiz.questions.map((q, i) => {
          const userAnswer = quiz.answers[i];
          const isCorrect = userAnswer === q.answer;
          return (
            <div key={i} className={styles.reviewItem}>
              <div className={styles.reviewQuestion}>
                {i + 1}. {q.question}
              </div>
              {!isCorrect && (
                <div className={`${styles.reviewAnswer} ${styles.reviewWrong}`}>
                  ✗ Your answer: {userAnswer}
                </div>
              )}
              <div className={`${styles.reviewAnswer} ${styles.reviewCorrect}`}>
                ✓ Correct: {q.answer}
              </div>
              {q.explanation && (
                <div className={styles.reviewExplanation}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function QuizPage() {
  const { currentQuiz, quizHistory, startQuiz, answerQuestion, completeQuiz, clearCurrentQuiz } =
    useQuizStore();

  const [view, setView] = useState('setup'); // setup | playing | results

  const handleStart = (topic, questions, difficulty) => {
    startQuiz(topic, questions, difficulty);
    setView('playing');
  };

  const handleComplete = () => {
    completeQuiz();
    setView('results');
  };

  const handleNewQuiz = () => {
    clearCurrentQuiz();
    setView('setup');
  };

  const handleRetry = () => {
    if (currentQuiz) {
      startQuiz(
        currentQuiz.topic,
        currentQuiz.questions,
        currentQuiz.difficulty
      );
      setView('playing');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="🧠 Quiz Generator"
        subtitle="Test your knowledge with AI-generated quizzes"
        actions={
          view !== 'setup' && (
            <Button variant="secondary" size="sm" onClick={handleNewQuiz}>
              New Quiz
            </Button>
          )
        }
      />

      {view === 'setup' && <QuizSetup onStart={handleStart} />}

      {view === 'playing' && currentQuiz && (
        <QuizPlayer
          quiz={currentQuiz}
          onAnswer={answerQuestion}
          onComplete={handleComplete}
        />
      )}

      {view === 'results' && currentQuiz && (
        <QuizResults
          quiz={currentQuiz}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
        />
      )}

      {/* Quiz History */}
      {quizHistory.length > 0 && view === 'setup' && (
        <div className={styles.historySection}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            📊 Quiz History
          </h3>
          <div className={styles.historyGrid}>
            {quizHistory.slice(0, 8).map((q) => (
              <div key={q.id} className={styles.historyCard}>
                <div className={styles.historyTopic}>{q.topic}</div>
                <div className={styles.historyMeta}>
                  <span>{timeAgo(q.completedAt)}</span>
                  <span
                    className={styles.historyScore}
                    style={{
                      color: q.score >= 70 ? 'var(--color-success)' : q.score >= 50 ? 'var(--color-warning)' : 'var(--color-error)',
                    }}
                  >
                    {q.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
