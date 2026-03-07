import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchLessons } from '../store/slices/lessonSlice';
import Navbar from '../components/Common/Navbar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { lessons, loading } = useSelector(state => state.lesson);
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchLessons());
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const stats = [
    { 
      label: 'Total XP', 
      value: user?.xp_points || 2450, 
      icon: '⚡', 
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: '+125',
      changeType: 'up'
    },
    { 
      label: 'Current Level', 
      value: user?.level || 7, 
      icon: '👑', 
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      change: '75%',
      changeType: 'progress'
    },
    { 
      label: 'Day Streak', 
      value: user?.streak_days || 12, 
      icon: '🔥', 
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      change: 'Best!',
      changeType: 'badge'
    },
    { 
      label: 'Signs Learned', 
      value: user?.total_signs_learned || 86, 
      icon: '✋', 
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '+8',
      changeType: 'up'
    },
  ];

  const lessonTabs = [
    { id: 'all', label: 'All Lessons', icon: '📚' },
    { id: 'progress', label: 'In Progress', icon: '📝' },
    { id: 'completed', label: 'Completed', icon: '✅' },
  ];

  const filteredLessons = lessons?.filter(lesson => {
    if (activeTab === 'all') return true;
    if (activeTab === 'progress') return lesson.progress > 0 && lesson.progress < 100;
    if (activeTab === 'completed') return lesson.progress === 100;
    return true;
  }) || [];

  const currentLevelXP = (user?.xp_points || 2450) % 1000;
  const xpProgress = (currentLevelXP / 1000) * 100;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div style={styles.pageWrapper}>
      {/* Beautiful Lavender Background */}
      <div style={styles.backgroundContainer}>
        {/* Main gradient background */}
        <div style={styles.mainBackground} />
        
        {/* Decorative elements */}
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.bgCircle3} />
        <div style={styles.bgCircle4} />
        
        {/* Floating shapes */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={styles.floatingShape1}
        />
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={styles.floatingShape2}
        />
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={styles.floatingShape3}
        />
        
        {/* Subtle pattern overlay */}
        <div style={styles.patternOverlay} />
      </div>

      <Navbar />
      
      <main style={styles.mainContent}>
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.header}
        >
          <div style={styles.headerLeft}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p style={styles.greetingSmall}>{greeting} ✨</p>
              <h1 style={styles.welcomeHeading}>
                Welcome back, <span style={styles.userName}>{user?.full_name?.split(' ')[0] || 'Learner'}</span>!
              </h1>
              <p style={styles.subHeading}>Ready to continue your ISL learning journey?</p>
            </motion.div>
            
            {/* Badges Row */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={styles.badgesRow}
            >
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>🔥</span>
                <span style={styles.badgeText}>{user?.streak_days || 12} Day Streak</span>
              </div>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>💎</span>
                <span style={styles.badgeText}>Level {user?.level || 7}</span>
              </div>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>⭐</span>
                <span style={styles.badgeText}>Pro Learner</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.headerRight}
          >
            {/* Time Card */}
            <div style={styles.timeCard}>
              <div style={styles.timeDisplay}>
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div style={styles.dateDisplay}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric'
                })}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <Link to="/practice" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.primaryBtn}
                >
                  <span>🎯</span>
                  <span>Start Practice</span>
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.secondaryBtn}
              >
                🎲
              </motion.button>
            </div>
          </motion.div>
        </motion.header>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.statsSection}
        >
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)'
                }}
                style={styles.statCard}
              >
                <div style={styles.statCardInner}>
                  <div style={styles.statTop}>
                    <div style={{
                      ...styles.statIconWrapper,
                      backgroundColor: stat.bgColor,
                    }}>
                      <span style={styles.statIcon}>{stat.icon}</span>
                    </div>
                    <div style={{
                      ...styles.statChange,
                      backgroundColor: stat.changeType === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                                       stat.changeType === 'badge' ? 'rgba(236, 72, 153, 0.1)' : 
                                       'rgba(139, 92, 246, 0.1)',
                      color: stat.changeType === 'up' ? '#10B981' : 
                             stat.changeType === 'badge' ? '#EC4899' : 
                             '#8B5CF6'
                    }}>
                      {stat.changeType === 'up' && '↑'} {stat.change}
                    </div>
                  </div>
                  <div style={styles.statValue}>{stat.value.toLocaleString()}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                  
                  {/* Decorative accent */}
                  <div style={{
                    ...styles.statAccent,
                    backgroundColor: stat.color
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Grid */}
        <div style={styles.mainGrid}>
          {/* Left Column - Lessons */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={styles.lessonsSection}
          >
            {/* Section Header */}
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleWrapper}>
                <div style={styles.sectionIconWrapper}>
                  <span>📚</span>
                </div>
                <div>
                  <h2 style={styles.sectionTitle}>Continue Learning</h2>
                  <p style={styles.sectionSubtitle}>{filteredLessons.length} lessons available</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div style={styles.tabsWrapper}>
                {lessonTabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === tab.id ? styles.tabButtonActive : {})
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span style={styles.tabLabel}>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Lessons List */}
            <div style={styles.lessonsList}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <div style={styles.loadingContainer}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={styles.skeletonCard}>
                        <div style={styles.skeletonIcon} />
                        <div style={styles.skeletonContent}>
                          <div style={styles.skeletonLine1} />
                          <div style={styles.skeletonLine2} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredLessons.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.emptyState}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={styles.emptyIcon}
                    >
                      {activeTab === 'completed' ? '🎯' : '📖'}
                    </motion.div>
                    <h3 style={styles.emptyTitle}>
                      {activeTab === 'completed' ? 'No completed lessons yet' : 'No lessons in progress'}
                    </h3>
                    <p style={styles.emptyText}>Start learning to see your progress here!</p>
                    <Link to="/lessons" style={{ textDecoration: 'none' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.emptyButton}
                      >
                        Browse Lessons
                      </motion.button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredLessons.slice(0, 5).map((lesson, index) => (
                      <LessonCard key={lesson.id} lesson={lesson} index={index} />
                    ))}
                    
                    {filteredLessons.length > 5 && (
                      <Link to="/lessons" style={{ textDecoration: 'none' }}>
                        <motion.div
                          whileHover={{ scale: 1.01, y: -2 }}
                          style={styles.viewAllCard}
                        >
                          <span>View All {filteredLessons.length} Lessons</span>
                          <span style={styles.viewAllArrow}>→</span>
                        </motion.div>
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Right Column - Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            style={styles.sidebar}
          >
            {/* Level Progress */}
            <div style={styles.sidebarCard}>
              <div style={styles.cardHeaderRow}>
                <div style={styles.cardTitleRow}>
                  <span style={styles.cardIcon}>⚡</span>
                  <h3 style={styles.cardTitle}>Level Progress</h3>
                </div>
                <div style={styles.levelBadge}>Lvl {user?.level || 7}</div>
              </div>
              
              <div style={styles.progressSection}>
                <div style={styles.progressBarContainer}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={styles.progressBarFill}
                  >
                    <div style={styles.progressShine} />
                  </motion.div>
                </div>
                <div style={styles.progressInfo}>
                  <span style={styles.progressCurrent}>{currentLevelXP} XP</span>
                  <span style={styles.progressTotal}>1,000 XP</span>
                </div>
              </div>
              
              <div style={styles.xpNeededBox}>
                <span style={styles.xpNeededIcon}>🎯</span>
                <span style={styles.xpNeededText}>
                  {1000 - currentLevelXP} XP needed for Level {(user?.level || 7) + 1}
                </span>
              </div>
            </div>

            {/* Daily Goals */}
            <div style={styles.sidebarCard}>
              <div style={styles.cardHeaderRow}>
                <div style={styles.cardTitleRow}>
                  <span style={styles.cardIcon}>🎯</span>
                  <h3 style={styles.cardTitle}>Daily Goals</h3>
                </div>
                <div style={styles.goalProgress}>2/3</div>
              </div>
              
              <div style={styles.goalsGrid}>
                <GoalItem 
                  icon="⏱️" 
                  label="Practice Time" 
                  current={15} 
                  target={30} 
                  unit="min"
                  color="#8B5CF6"
                />
                <GoalItem 
                  icon="✋" 
                  label="Signs Learned" 
                  current={8} 
                  target={10}
                  color="#EC4899"
                />
                <GoalItem 
                  icon="📚" 
                  label="Lessons Done" 
                  current={3} 
                  target={3}
                  color="#10B981"
                  completed
                />
              </div>
            </div>

            {/* Weekly Streak */}
            <div style={styles.sidebarCard}>
              <div style={styles.cardHeaderRow}>
                <div style={styles.cardTitleRow}>
                  <span style={styles.cardIcon}>🔥</span>
                  <h3 style={styles.cardTitle}>Weekly Streak</h3>
                </div>
                <div style={styles.streakBadge}>{user?.streak_days || 12} days</div>
              </div>
              
              <div style={styles.weekGrid}>
                {weekDays.map((day, index) => {
                  const isCompleted = index <= todayIndex && index < 5;
                  const isToday = index === todayIndex;
                  
                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      style={{
                        ...styles.dayItem,
                        ...(isCompleted ? styles.dayCompleted : {}),
                        ...(isToday ? styles.dayToday : {})
                      }}
                    >
                      <span style={styles.dayName}>{day}</span>
                      {isCompleted && <span style={styles.dayCheck}>✓</span>}
                    </motion.div>
                  );
                })}
              </div>
              
              <div style={styles.streakMessage}>
                <span>🌟</span>
                <span>Keep going! You're on fire!</span>
              </div>
            </div>

            {/* Quick Practice */}
            <Link to="/practice" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                style={styles.practiceButton}
              >
                <div style={styles.practiceButtonContent}>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={styles.practiceButtonIcon}
                  >
                    📷
                  </motion.span>
                  <div style={styles.practiceButtonText}>
                    <span style={styles.practiceButtonTitle}>Practice with Webcam</span>
                    <span style={styles.practiceButtonSubtitle}>Real-time sign recognition</span>
                  </div>
                </div>
                <span style={styles.practiceButtonArrow}>→</span>
              </motion.button>
            </Link>

            {/* Achievements */}
            <div style={styles.sidebarCard}>
              <div style={styles.cardHeaderRow}>
                <div style={styles.cardTitleRow}>
                  <span style={styles.cardIcon}>🏆</span>
                  <h3 style={styles.cardTitle}>Achievements</h3>
                </div>
                <Link to="/achievements" style={styles.viewAllLink}>View All</Link>
              </div>
              
              <div style={styles.achievementsGrid}>
                {[
                  { emoji: '🎯', name: 'First Sign', unlocked: true },
                  { emoji: '🔥', name: 'Week Streak', unlocked: true },
                  { emoji: '⭐', name: 'Perfect Score', unlocked: true },
                  { emoji: '💎', name: 'Level 10', unlocked: false },
                  { emoji: '🚀', name: 'Speed Demon', unlocked: false },
                  { emoji: '🎓', name: 'Graduate', unlocked: false },
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{
                      ...styles.achievementItem,
                      ...(achievement.unlocked ? {} : styles.achievementLocked)
                    }}
                    title={achievement.name}
                  >
                    <span>{achievement.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </main>

      {/* Styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr 400px !important;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .header-content {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .tabs-wrapper {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({ lesson, index }) => {
  const progress = lesson.progress || Math.floor(Math.random() * 100);
  const isCompleted = progress === 100;
  
  const difficultyConfig = {
    beginner: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Beginner' },
    intermediate: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'Intermediate' },
    advanced: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Advanced' },
  };
  
  const config = difficultyConfig[lesson.difficulty] || difficultyConfig.beginner;

  return (
    <Link to={`/lesson/${lesson.id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ x: 8, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1)' }}
        style={lessonStyles.card}
      >
        <div style={lessonStyles.cardContent}>
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              ...lessonStyles.iconWrapper,
              background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
              borderColor: `${config.color}30`
            }}
          >
            <span style={lessonStyles.icon}>{lesson.icon || '📖'}</span>
          </motion.div>

          {/* Info */}
          <div style={lessonStyles.info}>
            <div style={lessonStyles.titleRow}>
              <h3 style={lessonStyles.title}>{lesson.title || 'Basic Greetings'}</h3>
              {isCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={lessonStyles.completedIcon}
                >
                  ✓
                </motion.span>
              )}
            </div>
            <p style={lessonStyles.description}>
              {lesson.description || 'Learn essential greeting signs in ISL'}
            </p>
            <div style={lessonStyles.metaRow}>
              <span style={lessonStyles.metaItem}>
                <span>⏱️</span> {lesson.duration || '10 min'}
              </span>
              <span style={lessonStyles.metaItem}>
                <span>✋</span> {lesson.signs_count || 12} signs
              </span>
              <span style={{
                ...lessonStyles.difficultyBadge,
                backgroundColor: config.bg,
                color: config.color
              }}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div style={lessonStyles.progressWrapper}>
            <div style={lessonStyles.progressCircle}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#E9D5FF"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="151"
                  initial={{ strokeDashoffset: 151 }}
                  animate={{ strokeDashoffset: 151 - (progress * 1.51) }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={lessonStyles.progressText}>{progress}%</span>
            </div>
          </div>

          {/* Arrow */}
          <motion.span
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, x: 5 }}
            style={lessonStyles.arrow}
          >
            →
          </motion.span>
        </div>

        {/* Bottom progress bar */}
        <div style={lessonStyles.progressBar}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            style={{
              ...lessonStyles.progressBarFill,
              background: isCompleted 
                ? 'linear-gradient(90deg, #10B981, #34D399)'
                : 'linear-gradient(90deg, #A855F7, #7C3AED)'
            }}
          />
        </div>
      </motion.div>
    </Link>
  );
};

// Goal Item Component
const GoalItem = ({ icon, label, current, target, unit = '', color, completed }) => {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div style={goalStyles.item}>
      <div style={goalStyles.header}>
        <div style={goalStyles.labelWrapper}>
          <span style={goalStyles.icon}>{icon}</span>
          <span style={goalStyles.label}>{label}</span>
        </div>
        <span style={{
          ...goalStyles.value,
          color: completed ? '#10B981' : '#6B7280'
        }}>
          {current}/{target}{unit && ` ${unit}`}
          {completed && ' ✓'}
        </span>
      </div>
      <div style={goalStyles.progressBar}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            ...goalStyles.progressFill,
            background: completed 
              ? 'linear-gradient(90deg, #10B981, #34D399)'
              : `linear-gradient(90deg, ${color}, ${color}CC)`
          }}
        />
      </div>
    </div>
  );
};

// Main Styles
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    position: 'relative',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  // Background Styles
  backgroundContainer: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  
  mainBackground: {
    position: 'absolute',
    inset: 0,
    background: `
      linear-gradient(135deg, 
        #FAF5FF 0%, 
        #F3E8FF 25%, 
        #E9D5FF 50%, 
        #F3E8FF 75%, 
        #FAF5FF 100%
      )
    `,
  },
  
  bgCircle1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  
  bgCircle2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
    filter: 'blur(40px)',
  },
  
  bgCircle3: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  
  bgCircle4: {
    position: 'absolute',
    top: '20%',
    right: '20%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 0%, transparent 70%)',
    filter: 'blur(50px)',
  },
  
  floatingShape1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.1))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
  },
  
  floatingShape2: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(236, 72, 153, 0.2)',
  },
  
  floatingShape3: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  
  patternOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  },

  // Main Content
  mainContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '24px',
  },

  // Header
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '32px',
    padding: '32px',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(168, 85, 247, 0.1)',
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)',
  },
  
  headerLeft: {
    flex: '1 1 400px',
  },
  
  greetingSmall: {
    fontSize: '14px',
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  
  welcomeHeading: {
    fontSize: 'clamp(24px, 4vw, 36px)',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  
  userName: {
    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  
  subHeading: {
    fontSize: '16px',
    color: '#6B7280',
    marginBottom: '20px',
  },
  
  badgesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '50px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  
  badgeIcon: {
    fontSize: '14px',
  },
  
  badgeText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#7C3AED',
  },
  
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'flex-end',
  },
  
  timeCard: {
    textAlign: 'right',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05))',
    borderRadius: '16px',
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  
  timeDisplay: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#7C3AED',
  },
  
  dateDisplay: {
    fontSize: '13px',
    color: '#8B5CF6',
    fontWeight: '500',
  },
  
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    border: 'none',
    borderRadius: '16px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
  },
  
  secondaryBtn: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    border: '2px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '16px',
    fontSize: '20px',
    cursor: 'pointer',
  },

  // Stats Section
  statsSection: {
    marginBottom: '32px',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  
  statCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  statCardInner: {
    padding: '24px',
    position: 'relative',
  },
  
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statIcon: {
    fontSize: '24px',
  },
  
  statChange: {
    padding: '4px 10px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '4px',
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
  },
  
  statAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
  },

  // Main Grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },

  // Lessons Section
  lessonsSection: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)',
  },
  
  sectionHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  
  sectionTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  
  sectionIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.3)',
  },
  
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0,
  },
  
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  
  tabsWrapper: {
    display: 'flex',
    gap: '8px',
    padding: '6px',
    background: 'rgba(139, 92, 246, 0.08)',
    borderRadius: '14px',
  },
  
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  tabButtonActive: {
    background: 'white',
    color: '#7C3AED',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)',
  },
  
  tabLabel: {},
  
  lessonsList: {},
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  
  skeletonCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'rgba(139, 92, 246, 0.05)',
    borderRadius: '16px',
  },
  
  skeletonIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(90deg, #E9D5FF 25%, #F3E8FF 50%, #E9D5FF 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  
  skeletonContent: {
    flex: 1,
  },
  
  skeletonLine1: {
    width: '60%',
    height: '18px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #E9D5FF 25%, #F3E8FF 50%, #E9D5FF 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '10px',
  },
  
  skeletonLine2: {
    width: '40%',
    height: '14px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #E9D5FF 25%, #F3E8FF 50%, #E9D5FF 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  
  emptyText: {
    fontSize: '15px',
    color: '#6B7280',
    marginBottom: '20px',
  },
  
  emptyButton: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  viewAllCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.04))',
    borderRadius: '16px',
    border: '2px dashed rgba(139, 92, 246, 0.2)',
    marginTop: '12px',
    cursor: 'pointer',
    color: '#7C3AED',
    fontSize: '15px',
    fontWeight: '600',
  },
  
  viewAllArrow: {
    fontSize: '18px',
  },

  // Sidebar
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  
  sidebarCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)',
  },
  
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  
  cardIcon: {
    fontSize: '20px',
  },
  
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1F2937',
    margin: 0,
  },
  
  levelBadge: {
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
  },
  
  progressSection: {
    marginBottom: '16px',
  },
  
  progressBarContainer: {
    height: '12px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '50px',
    overflow: 'hidden',
    marginBottom: '10px',
    position: 'relative',
  },
  
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #A855F7, #7C3AED)',
    borderRadius: '50px',
    position: 'relative',
    overflow: 'hidden',
  },
  
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite',
  },
  
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  
  progressCurrent: {
    color: '#6B7280',
    fontWeight: '500',
  },
  
  progressTotal: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  
  xpNeededBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.1)',
  },
  
  xpNeededIcon: {
    fontSize: '18px',
  },
  
  xpNeededText: {
    fontSize: '14px',
    color: '#7C3AED',
    fontWeight: '500',
  },
  
  goalProgress: {
    padding: '6px 14px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '50px',
    color: '#10B981',
    fontSize: '13px',
    fontWeight: '700',
  },
  
  goalsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  
  streakBadge: {
    padding: '6px 14px',
    background: 'rgba(236, 72, 153, 0.1)',
    borderRadius: '50px',
    color: '#EC4899',
    fontSize: '13px',
    fontWeight: '600',
  },
  
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '16px',
  },
  
  dayItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    borderRadius: '12px',
    background: 'rgba(139, 92, 246, 0.05)',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    transition: 'all 0.3s ease',
  },
  
  dayCompleted: {
    background: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid rgba(236, 72, 153, 0.2)',
  },
  
  dayToday: {
    background: 'linear-gradient(135deg, #EC4899, #DB2777)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
  },
  
  dayName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '4px',
  },
  
  dayCheck: {
    fontSize: '12px',
    color: '#10B981',
  },
  
  streakMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#DB2777',
    fontWeight: '500',
  },
  
  practiceButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED, #6366F1)',
    border: 'none',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
  },
  
  practiceButtonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  
  practiceButtonIcon: {
    fontSize: '28px',
  },
  
  practiceButtonText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
  },
  
  practiceButtonTitle: {
    fontSize: '16px',
    fontWeight: '700',
  },
  
  practiceButtonSubtitle: {
    fontSize: '12px',
    opacity: 0.8,
  },
  
  practiceButtonArrow: {
    fontSize: '24px',
    opacity: 0.8,
  },
  
  viewAllLink: {
    fontSize: '13px',
    color: '#8B5CF6',
    textDecoration: 'none',
    fontWeight: '500',
  },
  
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
  },
  
  achievementItem: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  achievementLocked: {
    opacity: 0.4,
    filter: 'grayscale(100%)',
    background: 'rgba(139, 92, 246, 0.05)',
  },
};

// Lesson Card Styles
const lessonStyles = {
  card: {
    background: 'white',
    borderRadius: '18px',
    border: '1px solid rgba(139, 92, 246, 0.1)',
    marginBottom: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
  },
  
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
  },
  
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    flexShrink: 0,
  },
  
  icon: {
    fontSize: '28px',
  },
  
  info: {
    flex: 1,
    minWidth: 0,
  },
  
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2937',
    margin: 0,
  },
  
  completedIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10B981, #34D399)',
    color: 'white',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  
  description: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 10px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#9CA3AF',
  },
  
  difficultyBadge: {
    padding: '3px 10px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: '600',
  },
  
  progressWrapper: {
    flexShrink: 0,
  },
  
  progressCircle: {
    position: 'relative',
    width: '56px',
    height: '56px',
  },
  
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: '700',
    color: '#7C3AED',
  },
  
  arrow: {
    fontSize: '20px',
    color: '#A855F7',
    flexShrink: 0,
  },
  
  progressBar: {
    height: '3px',
    background: 'rgba(139, 92, 246, 0.1)',
  },
  
  progressBarFill: {
    height: '100%',
  },
};

// Goal Styles
const goalStyles = {
  item: {
    marginBottom: '4px',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  
  labelWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  icon: {
    fontSize: '16px',
  },
  
  label: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  
  value: {
    fontSize: '13px',
    fontWeight: '600',
  },
  
  progressBar: {
    height: '8px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '50px',
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: '50px',
  },
};

export default Dashboard;