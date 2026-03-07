import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAward, FiCalendar, FiUsers } from 'react-icons/fi';
import Navbar from '../components/Common/Navbar';
import './Leaderboard.css';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'alltime'
  const [category, setCategory] = useState('xp'); // 'xp', 'streak', 'lessons', 'accuracy'
  const [loading, setLoading] = useState(false);

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, username: 'SignMaster', avatar: null, xp: 15420, streak: 45, lessons: 89, accuracy: 96 },
    { rank: 2, username: 'ISLPro', avatar: null, xp: 14850, streak: 38, lessons: 76, accuracy: 94 },
    { rank: 3, username: 'HandTalker', avatar: null, xp: 13200, streak: 30, lessons: 68, accuracy: 91 },
    { rank: 4, username: 'SignLearner', avatar: null, xp: 11500, streak: 25, lessons: 55, accuracy: 89 },
    { rank: 5, username: 'GestureGuru', avatar: null, xp: 10800, streak: 22, lessons: 52, accuracy: 88 },
    { rank: 6, username: 'QuietSpeaker', avatar: null, xp: 9500, streak: 18, lessons: 45, accuracy: 85 },
    { rank: 7, username: 'SignNewbie', avatar: null, xp: 8200, streak: 15, lessons: 38, accuracy: 82 },
    { rank: 8, username: 'LearningSigns', avatar: null, xp: 7400, streak: 12, lessons: 32, accuracy: 80 },
    { rank: 9, username: 'ISLFan', avatar: null, xp: 6800, streak: 10, lessons: 28, accuracy: 78 },
    { rank: 10, username: 'NewLearner', avatar: null, xp: 5500, streak: 7, lessons: 22, accuracy: 75 },
  ];

  // Current user (mock)
  const currentUser = {
    rank: 24,
    username: 'You',
    avatar: null,
    xp: 2500,
    streak: 15,
    lessons: 24,
    accuracy: 85,
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  const getCategoryValue = (user) => {
    switch (category) {
      case 'xp': return `${user.xp.toLocaleString()} XP`;
      case 'streak': return `${user.streak} days`;
      case 'lessons': return `${user.lessons} lessons`;
      case 'accuracy': return `${user.accuracy}%`;
      default: return user.xp;
    }
  };

  return (
    <div className="leaderboard-page">
      <Navbar />
      
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1><FiAward /> Leaderboard</h1>
          <p>See how you rank against other learners</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Timeframe:</label>
            <div className="filter-buttons">
              {['daily', 'weekly', 'monthly', 'alltime'].map((t) => (
                <button
                  key={t}
                  className={`filter-btn ${timeframe === t ? 'active' : ''}`}
                  onClick={() => setTimeframe(t)}
                >
                  {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${category === 'xp' ? 'active' : ''}`}
                onClick={() => setCategory('xp')}
              >
                <FiTrendingUp /> XP
              </button>
              <button
                className={`filter-btn ${category === 'streak' ? 'active' : ''}`}
                onClick={() => setCategory('streak')}
              >
                🔥 Streak
              </button>
              <button
                className={`filter-btn ${category === 'lessons' ? 'active' : ''}`}
                onClick={() => setCategory('lessons')}
              >
                📚 Lessons
              </button>
              <button
                className={`filter-btn ${category === 'accuracy' ? 'active' : ''}`}
                onClick={() => setCategory('accuracy')}
              >
                🎯 Accuracy
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="podium-section">
          {/* 2nd Place */}
          <div className="podium-item silver">
            <div className="podium-avatar">
              <span>{leaderboardData[1].username.charAt(0)}</span>
            </div>
            <div className="podium-rank">🥈</div>
            <h3>{leaderboardData[1].username}</h3>
            <p>{getCategoryValue(leaderboardData[1])}</p>
            <div className="podium-bar"></div>
          </div>

          {/* 1st Place */}
          <div className="podium-item gold">
            <div className="crown">👑</div>
            <div className="podium-avatar">
              <span>{leaderboardData[0].username.charAt(0)}</span>
            </div>
            <div className="podium-rank">🥇</div>
            <h3>{leaderboardData[0].username}</h3>
            <p>{getCategoryValue(leaderboardData[0])}</p>
            <div className="podium-bar"></div>
          </div>

          {/* 3rd Place */}
          <div className="podium-item bronze">
            <div className="podium-avatar">
              <span>{leaderboardData[2].username.charAt(0)}</span>
            </div>
            <div className="podium-rank">🥉</div>
            <h3>{leaderboardData[2].username}</h3>
            <p>{getCategoryValue(leaderboardData[2])}</p>
            <div className="podium-bar"></div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table">
          <div className="table-header">
            <span className="col-rank">Rank</span>
            <span className="col-user">User</span>
            <span className="col-value">{category.toUpperCase()}</span>
          </div>

          <div className="table-body">
            {leaderboardData.slice(3).map((user) => (
              <div key={user.rank} className={`table-row ${getRankClass(user.rank)}`}>
                <span className="col-rank">{user.rank}</span>
                <div className="col-user">
                  <div className="user-avatar small">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <span>{user.username.charAt(0)}</span>
                    )}
                  </div>
                  <span className="username">{user.username}</span>
                </div>
                <span className="col-value">{getCategoryValue(user)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Ranking */}
        <div className="your-ranking">
          <h3>Your Ranking</h3>
          <div className="your-rank-card">
            <div className="rank-position">
              <span className="rank-number">#{currentUser.rank}</span>
              <span className="rank-label">out of 1,245 learners</span>
            </div>
            <div className="rank-stats">
              <div className="rank-stat">
                <FiTrendingUp />
                <span>{currentUser.xp.toLocaleString()} XP</span>
              </div>
              <div className="rank-stat">
                <span>🔥</span>
                <span>{currentUser.streak} days</span>
              </div>
              <div className="rank-stat">
                <span>🎯</span>
                <span>{currentUser.accuracy}%</span>
              </div>
            </div>
            <button className="btn-improve">Keep Learning to Climb! 🚀</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;