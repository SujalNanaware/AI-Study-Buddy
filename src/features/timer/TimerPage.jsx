import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTimerStore } from '../../store/timerStore';
import { formatTime, formatDuration } from '../../utils/helpers';
import styles from './TimerPage.module.css';

const MODES = [
  { key: 'work', label: 'Focus' },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak', label: 'Long Break' },
];

export default function TimerPage() {
  const {
    workDuration,
    shortBreak,
    longBreak,
    setWorkDuration,
    setShortBreak,
    setLongBreak,
    logSession,
    dailyStreak,
    getTodaySessionCount,
    totalStudyTime,
  } = useTimerStore();

  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);

  const getDuration = useCallback(
    (m) => {
      switch (m) {
        case 'work': return workDuration;
        case 'shortBreak': return shortBreak;
        case 'longBreak': return longBreak;
        default: return workDuration;
      }
    },
    [workDuration, shortBreak, longBreak]
  );

  const totalDuration = getDuration(mode);
  const progress = (totalDuration - timeLeft) / totalDuration;
  const circumference = 2 * Math.PI * 140;
  const dashOffset = circumference * (1 - progress);
  const todaySessions = getTodaySessionCount();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      setIsRunning(false);

      // Log session
      if (mode === 'work') {
        logSession(totalDuration, 'work');
      }

      // Notify
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          mode === 'work' ? '⏰ Focus session complete!' : '☕ Break is over!',
          { body: mode === 'work' ? 'Great work! Time for a break.' : 'Ready to get back to studying?' }
        );
      }

      // Auto switch mode
      if (mode === 'work') {
        const nextMode = (todaySessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(getDuration(nextMode));
      } else {
        setMode('work');
        setTimeLeft(workDuration);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(getDuration(mode));
  };

  const skipToNext = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (mode === 'work') {
      const nextMode = (todaySessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(getDuration(nextMode));
    } else {
      setMode('work');
      setTimeLeft(workDuration);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="⏱️ Pomodoro Timer"
        subtitle="Stay focused with timed study sessions"
        actions={
          <button
            className={styles.secondaryBtn}
            onClick={() => setShowSettings(!showSettings)}
            style={{ width: 40, height: 40, borderRadius: 10 }}
          >
            <Settings size={18} />
          </button>
        }
      />

      <div className={styles.timerContainer}>
        {/* Mode Tabs */}
        <div className={styles.modeTabs}>
          {MODES.map((m) => (
            <button
              key={m.key}
              className={`${styles.modeTab} ${mode === m.key ? styles.active : ''}`}
              onClick={() => handleModeChange(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className={styles.timerCircle}>
          <svg className={styles.timerSvg} viewBox="0 0 300 300">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <circle
              className={styles.timerTrack}
              cx="150"
              cy="150"
              r="140"
            />
            <circle
              className={styles.timerProgress}
              cx="150"
              cy="150"
              r="140"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className={styles.timerContent}>
            <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
            <div className={styles.timerLabel}>
              {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button className={`${styles.controlBtn} ${styles.secondaryBtn}`} onClick={resetTimer}>
            <RotateCcw size={20} />
          </button>
          <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={toggleTimer}>
            {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
          </button>
          <button className={`${styles.controlBtn} ${styles.secondaryBtn}`} onClick={skipToNext}>
            <SkipForward size={20} />
          </button>
        </div>

        {/* Session Stats */}
        <div className={styles.sessionStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{todaySessions}</span>
            <span className={styles.statLabel}>Sessions Today</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{dailyStreak}</span>
            <span className={styles.statLabel}>Day Streak 🔥</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatDuration(totalStudyTime)}</span>
            <span className={styles.statLabel}>Total Study Time</span>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className={styles.settings}>
            <div className={styles.settingsTitle}>Timer Settings (minutes)</div>
            <div className={styles.settingsGrid}>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>Focus</div>
                <input
                  type="number"
                  className={styles.settingInput}
                  value={workDuration / 60}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(120, Number(e.target.value)));
                    setWorkDuration(v);
                    if (mode === 'work' && !isRunning) setTimeLeft(v * 60);
                  }}
                  min={1}
                  max={120}
                />
              </div>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>Short Break</div>
                <input
                  type="number"
                  className={styles.settingInput}
                  value={shortBreak / 60}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(30, Number(e.target.value)));
                    setShortBreak(v);
                    if (mode === 'shortBreak' && !isRunning) setTimeLeft(v * 60);
                  }}
                  min={1}
                  max={30}
                />
              </div>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>Long Break</div>
                <input
                  type="number"
                  className={styles.settingInput}
                  value={longBreak / 60}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(60, Number(e.target.value)));
                    setLongBreak(v);
                    if (mode === 'longBreak' && !isRunning) setTimeLeft(v * 60);
                  }}
                  min={1}
                  max={60}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
