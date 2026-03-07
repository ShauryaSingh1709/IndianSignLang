import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Common/Navbar';
import './Leaderboard.css';

const TIMEFRAMES = ['Daily', 'Weekly', 'Monthly', 'All Time'];
const CATEGORIES = [
  { id: 'xp',       label: 'XP',       getValue: (u) => `${u.xp.toLocaleString()} XP` },
  { id: 'streak',   label: 'Streak',   getValue: (u) => `${u.streak} days` },
  { id: 'lessons',  label: 'Lessons',  getValue: (u) => `${u.lessons} lessons` },
  { id: 'accuracy', label: 'Accuracy', getValue: (u) => `${u.accuracy}%` },
];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #A855F7, #7C3AED)',
  'linear-gradient(135deg, #EC4899, #BE185D)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  'linear-gradient(135deg, #EF4444, #B91C1C)',
];

const Leaderboard = () => {
  const { user } = useSelector(state => state.auth);
  const [timeframe, setTimeframe] = useState('Weekly');
  const [category, setCategory] = useState('xp');

  const activeCat = CATEGORIES.find(c => c.id === category);

  // Real leaderboard data would come from the backend.
  // Show only the current user if no other data is available.
  const leaderboardData = [];

  const currentUser = {
    rank: '—',
    username: user?.username || 'You',
    xp: user?.xp_points || 0,
    streak: user?.streak_days || 0,
    lessons: 0,
    accuracy: 0,
  };

  return (
    <div className="lb-page">
      {/* Background */}
      <div className="lb-bg">
        <div className="lb-bg-main" />
        <div className="lb-bg-c1" />
        <div className="lb-bg-c2" />
        <div className="lb-bg-pattern" />
      </div>

      <Navbar />

      <main className="lb-main">
        {/* Header */}
        <motion.div
          className="lb-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="lb-title">Leaderboard</h1>
            <p className="lb-subtitle">See how you rank among ISL learners worldwide</p>
          </div>
          <Link to="/practice" className="lb-cta-btn">Practice to Climb</Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="lb-filters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="filter-row">
            <span className="filter-label">Timeframe</span>
            <div className="filter-tabs">
              {TIMEFRAMES.map(t => (
                <button
                  key={t}
                  className={`filter-tab ${timeframe === t ? 'active' : ''}`}
                  onClick={() => setTimeframe(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">Rank by</span>
            <div className="filter-tabs">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`filter-tab ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          className="lb-table-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="lb-table-header">
            <span className="th-rank">Rank</span>
            <span className="th-user">User</span>
            <span className="th-value">{activeCat.label}</span>
            <span className="th-streak">Streak</span>
          </div>

          <div className="lb-table-body">
            {leaderboardData.length === 0 ? (
              <div className="lb-empty">
                <span className="lb-empty-icon">🏆</span>
                <p className="lb-empty-title">No rankings yet</p>
                <p className="lb-empty-sub">
                  Complete lessons and practice sessions to appear on the leaderboard.
                </p>
                <div className="lb-empty-actions">
                  <Link to="/learn" className="lb-empty-btn">Start Learning</Link>
                  <Link to="/quiz" className="lb-empty-btn lb-empty-btn-outline">Take a Quiz</Link>
                </div>
              </div>
            ) : (
              leaderboardData.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  className="lb-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ x: 4, background: 'rgba(168,85,247,0.04)' }}
                >
                  <span className="td-rank">{entry.rank}</span>
                  <div className="td-user">
                    <div className="lb-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {entry.username.charAt(0)}
                    </div>
                    <span className="lb-username">{entry.username}</span>
                  </div>
                  <span className="td-value">{activeCat.getValue(entry)}</span>
                  <span className="td-streak">{entry.streak}d</span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Your Rank */}
        <motion.div
          className="your-rank-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="your-rank-left">
            <span className="your-rank-label">Your Rank</span>
            <span className="your-rank-num">#{currentUser.rank}</span>
            <span className="your-rank-sub">Keep learning to earn a rank</span>
          </div>
          <div className="your-rank-stats">
            <div className="yr-stat">
              <span className="yr-val purple">{currentUser.xp.toLocaleString()}</span>
              <span className="yr-lbl">XP</span>
            </div>
            <div className="yr-stat">
              <span className="yr-val">{currentUser.streak}</span>
              <span className="yr-lbl">Streak</span>
            </div>
            <div className="yr-stat">
              <span className="yr-val green">{currentUser.accuracy}%</span>
              <span className="yr-lbl">Accuracy</span>
            </div>
          </div>
          <Link to="/practice" className="yr-cta">Keep Practicing</Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Leaderboard;
