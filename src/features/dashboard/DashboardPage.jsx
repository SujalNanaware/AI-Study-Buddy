import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Layers,
  Brain,
  Timer,
  FileText,
  Flame,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTimerStore } from '../../store/timerStore';
import { useFlashcardStore } from '../../store/flashcardStore';
import { useQuizStore } from '../../store/quizStore';
import { useChatStore } from '../../store/chatStore';
import { formatDuration, getLastNDays } from '../../utils/helpers';
import styles from './DashboardPage.module.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dailyStreak, totalStudyTime, sessions, getTodaySessionCount, getStudyTimeByDate } = useTimerStore();
  const { getTotalStats } = useFlashcardStore();
  const { getQuizStats, quizHistory } = useQuizStore();
  const { conversations } = useChatStore();

  const flashcardStats = getTotalStats();
  const quizStats = getQuizStats();
  const todaySessions = getTodaySessionCount();

  // Study time chart data (last 7 days)
  const last7Days = getLastNDays(7);
  const studyChartData = last7Days.map((date) => ({
    name: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
    minutes: Math.round(getStudyTimeByDate(date) / 60),
  }));

  // Flashcard mastery pie data
  const pieData = [
    { name: 'Mastered', value: flashcardStats.mastered, color: '#00e676' },
    { name: 'Learning', value: Math.max(0, flashcardStats.totalCards - flashcardStats.mastered), color: '#ffab00' },
  ].filter((d) => d.value > 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    {
      icon: <Flame size={22} />,
      value: dailyStreak,
      label: 'Day Streak',
      bg: 'linear-gradient(135deg, rgba(255,82,82,0.15), rgba(255,171,0,0.15))',
      color: '#ff5252',
    },
    {
      icon: <Clock size={22} />,
      value: formatDuration(totalStudyTime),
      label: 'Total Study Time',
      bg: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))',
      color: '#667eea',
    },
    {
      icon: <Layers size={22} />,
      value: flashcardStats.totalCards,
      label: 'Flashcards',
      bg: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(102,126,234,0.15))',
      color: '#00d2ff',
    },
    {
      icon: <Brain size={22} />,
      value: quizStats.totalQuizzes,
      label: 'Quizzes Taken',
      bg: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,191,165,0.15))',
      color: '#00e676',
    },
    {
      icon: <Target size={22} />,
      value: quizStats.avgScore ? `${quizStats.avgScore}%` : '—',
      label: 'Avg Quiz Score',
      bg: 'linear-gradient(135deg, rgba(240,147,251,0.15), rgba(245,87,108,0.15))',
      color: '#f093fb',
    },
    {
      icon: <MessageSquare size={22} />,
      value: conversations.length,
      label: 'AI Chats',
      bg: 'linear-gradient(135deg, rgba(255,171,0,0.15), rgba(255,82,82,0.15))',
      color: '#ffab00',
    },
  ];

  const quickActions = [
    {
      icon: <MessageSquare size={24} />,
      label: 'AI Chat',
      desc: 'Ask anything',
      path: '/chat',
      bg: 'var(--gradient-primary)',
    },
    {
      icon: <Layers size={24} />,
      label: 'Flashcards',
      desc: 'Study & review',
      path: '/flashcards',
      bg: 'var(--gradient-accent)',
    },
    {
      icon: <Brain size={24} />,
      label: 'Take Quiz',
      desc: 'Test knowledge',
      path: '/quiz',
      bg: 'var(--gradient-warm)',
    },
    {
      icon: <Timer size={24} />,
      label: 'Focus Timer',
      desc: 'Start session',
      path: '/timer',
      bg: 'var(--gradient-success)',
    },
    {
      icon: <FileText size={24} />,
      label: 'Documents',
      desc: 'Upload & learn',
      path: '/documents',
      bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    },
  ];

  // Heatmap data (last 30 days)
  const last30Days = getLastNDays(30);
  const heatmapData = last30Days.map((date) => ({
    date,
    minutes: Math.round(getStudyTimeByDate(date) / 60),
  }));

  const getHeatmapColor = (minutes) => {
    if (minutes === 0) return 'var(--bg-surface)';
    if (minutes < 15) return 'rgba(102, 126, 234, 0.2)';
    if (minutes < 30) return 'rgba(102, 126, 234, 0.4)';
    if (minutes < 60) return 'rgba(102, 126, 234, 0.6)';
    return 'rgba(102, 126, 234, 0.8)';
  };

  return (
    <motion.div className={styles.page} variants={container} initial="hidden" animate="show">
      {/* Welcome Banner */}
      <motion.div className={styles.welcomeBanner} variants={item}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.greeting}>{getGreeting()} 👋</h1>
          <p className={styles.greetingSub}>
            {todaySessions > 0
              ? `You've completed ${todaySessions} focus session${todaySessions > 1 ? 's' : ''} today. Keep it up!`
              : "Ready to start studying? Let's make today productive!"}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className={styles.statsGrid} variants={item}>
        {stats.map((stat, i) => (
          <motion.div key={i} className={styles.statCard} variants={item}>
            <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div className={styles.chartsGrid} variants={item}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>📈 Study Time (Last 7 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={studyChartData}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                itemStyle={{ color: '#667eea' }}
                formatter={(value) => [`${value} min`, 'Study Time']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#667eea"
                strokeWidth={2}
                fill="url(#studyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>🎯 Flashcard Mastery</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Create flashcards to see mastery data
            </div>
          )}
        </div>
      </motion.div>

      {/* Study Heatmap */}
      <motion.div className={styles.chartCard} variants={item} style={{ marginBottom: 'var(--space-xl)' }}>
        <div className={styles.chartTitle}>🔥 Study Heatmap (Last 30 Days)</div>
        <div className={styles.heatmapContainer}>
          {heatmapData.map((day, i) => (
            <div
              key={i}
              className={styles.heatmapDay}
              style={{ background: getHeatmapColor(day.minutes) }}
              title={`${day.date}: ${day.minutes} min`}
            />
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div className={styles.quickActions}>
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              className={styles.quickAction}
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={styles.quickActionIcon}
                style={{ background: action.bg, color: 'white' }}
              >
                {action.icon}
              </div>
              <span className={styles.quickActionLabel}>{action.label}</span>
              <span className={styles.quickActionDesc}>{action.desc}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
