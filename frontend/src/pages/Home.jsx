import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiTarget, FiAward, FiUsers, FiArrowRight, FiCheck, FiStar, FiHeart, FiX } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Replace this with your actual catbox QR code URL
  const QR_CODE_URL = "https://files.catbox.moe/your-qr-code.png";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FiBook />,
      title: 'Interactive Lessons',
      description: 'Learn ISL through structured, interactive lessons designed by experts',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
      icon: <FiTarget />,
      title: 'AI Practice Mode',
      description: 'Practice signs with real-time AI-powered feedback using your webcam',
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
    },
    {
      icon: <FiAward />,
      title: 'Quizzes & Achievements',
      description: 'Test your knowledge and earn badges as you progress',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      icon: <FiUsers />,
      title: 'Global Leaderboard',
      description: 'Compete with learners worldwide and climb the ranks',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Learners' },
    { value: '500+', label: 'Signs to Learn' },
    { value: '50+', label: 'Lessons' },
    { value: '95%', label: 'Success Rate' },
  ];

  const signCards = [
    { emoji: '👋', word: 'Hello', color: '#8B5CF6' },
    { emoji: '🙏', word: 'Thank You', color: '#EC4899' },
    { emoji: '❤️', word: 'Love', color: '#EF4444' },
    { emoji: '👍', word: 'Good', color: '#10B981' },
    { emoji: '🌟', word: 'Star', color: '#F59E0B' },
  ];

  const handleDonateClick = () => {
    setShowQRModal(true);
  };

  const openQRInNewTab = () => {
    window.open(QR_CODE_URL, '_blank');
  };

  return (
    <div className="home-wrapper">
      {/* Beautiful Background */}
      <div className="home-background">
        <div className="bg-gradient"></div>
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-circle bg-circle-4"></div>
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="floating-shape floating-shape-1"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="floating-shape floating-shape-2"
        ></motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="floating-shape floating-shape-3"
        ></motion.div>
        <div className="bg-pattern"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`home-nav ${isScrolled ? 'nav-scrolled' : ''}`}
      >
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="brand-icon"
            >
              🤟
            </motion.span>
            <span className="brand-text">ISL Learn</span>
          </Link>

          <div className="nav-links-center">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#donate" className="nav-link">Donate</a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-badge"
            >
              <span className="badge-icon">✨</span>
              <span>India's #1 ISL Learning Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hero-title"
            >
              Learn Indian Sign Language
              <span className="title-highlight"> Interactively</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hero-subtitle"
            >
              Master ISL through AI-powered lessons, real-time practice sessions, 
              and earn achievements as you progress. Join thousands of learners today!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hero-buttons"
            >
              <Link to="/register" className="btn-primary-hero">
                <span>Start Learning Free</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FiArrowRight />
                </motion.span>
              </Link>
              <Link to="/login" className="btn-secondary-hero">
                <span>Sign In</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="hero-trust"
            >
              <div className="trust-avatars">
                {['😊', '😄', '🥰', '😎'].map((emoji, i) => (
                  <div key={i} className="trust-avatar" style={{ zIndex: 4 - i }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="trust-text">
                <div className="trust-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="star-icon" />
                  ))}
                </div>
                <span></span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-visual"
          >
            <div className="visual-container">
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="main-visual-card"
              >
                <div className="visual-card-header">
                  <div className="card-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="card-title">Live Practice</span>
                </div>
                <div className="visual-card-content">
                  <div className="webcam-preview">
                    <span className="webcam-emoji">📷</span>
                    <div className="webcam-overlay">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="detection-circle"
                      ></motion.div>
                    </div>
                  </div>
                  <div className="practice-info">
                    <span className="practice-sign">👋</span>
                    <span className="practice-word">Hello</span>
                    <div className="practice-progress">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span className="practice-accuracy">75% Accuracy</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Sign Cards */}
              {signCards.map((card, index) => (
                <motion.div
                  key={index}
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, index % 2 === 0 ? 5 : -5, 0],
                  }}
                  transition={{
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                  className={`floating-sign-card floating-sign-${index + 1}`}
                  style={{ '--card-color': card.color }}
                >
                  <span className="sign-emoji">{card.emoji}</span>
                  <span className="sign-word">{card.word}</span>
                </motion.div>
              ))}

              {/* Achievement Badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="floating-achievement"
              >
                <span className="achievement-icon">🏆</span>
                <div className="achievement-info">
                  <span className="achievement-title">Achievement Unlocked!</span>
                  <span className="achievement-name">First Sign Master</span>
                </div>
              </motion.div>

              {/* XP Notification */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="floating-xp"
              >
                <span className="xp-icon">⚡</span>
                <span className="xp-text">+50 XP</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="stat-item"
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">Features</span>
            <h2 className="section-title">Why Choose ISL Learn?</h2>
            <p className="section-subtitle">
              Our platform combines cutting-edge AI technology with proven learning 
              methods to help you master Indian Sign Language effectively.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)' }}
                className="feature-card"
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: feature.bgColor, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <a href="#" className="feature-link">
                  Learn More <FiArrowRight />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Start your ISL learning journey in three simple steps
            </p>
          </motion.div>

          <div className="steps-container">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and set your learning goals',
                icon: '📝',
              },
              {
                step: '02',
                title: 'Learn & Practice',
                description: 'Follow interactive lessons and practice with AI feedback',
                icon: '🎯',
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Earn achievements and climb the leaderboard',
                icon: '🏆',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="step-card"
              >
                <div className="step-number">{item.step}</div>
                <div className="step-icon">{item.icon}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>
                {index < 2 && <div className="step-connector"></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="donation-section">
        <div className="donation-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="donation-content"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="donation-heart"
            >
              <FiHeart />
            </motion.div>
            <h2 className="donation-title">Support Our Mission</h2>
            <p className="donation-subtitle">
              Help us make Indian Sign Language education accessible to everyone. 
              Your generous contribution helps us create more content, improve our 
              AI technology, and reach more learners across India.
            </p>
            <div className="donation-buttons">
              <button onClick={handleDonateClick} className="btn-donate-primary">
                <span>💝</span>
                <span>Donate Now</span>
                <FiArrowRight />
              </button>
            </div>
            <div className="donation-features">
              {['100% goes to development', 'Tax deductible', 'Make a difference'].map(
                (item, index) => (
                  <div key={index} className="donation-feature">
                    <FiCheck className="donation-feature-icon" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
            <p className="donation-note">
              Every contribution, big or small, helps us continue our mission. 
              Thank you for your support! 🙏
            </p>
          </motion.div>
        </div>
      </section>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="qr-modal-overlay"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="qr-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                <FiX />
              </button>
              <div className="qr-modal-content">
                <div className="qr-modal-header">
                  <span className="qr-modal-icon">💝</span>
                  <h3>Scan to Donate</h3>
                  <p>Scan the QR code with any UPI app to make your donation</p>
                </div>
                <div className="qr-code-container">
                  <img 
                    src={QR_CODE_URL} 
                    alt="Donation QR Code" 
                    className="qr-code-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="qr-placeholder" style={{ display: 'none' }}>
                    <span>📱</span>
                    <p>QR Code</p>
                  </div>
                </div>
                <div className="qr-modal-actions">
                  <button onClick={openQRInNewTab} className="btn-open-qr">
                    Open QR in New Tab
                    <FiArrowRight />
                  </button>
                </div>
                <div className="qr-modal-footer">
                  <p>Thank you for supporting ISL Learn! 🙏</p>
                  <span>Your donation helps us reach more learners</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Footer */}
      <footer className="home-footer">
        <p>© 2026 ISL Learn. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
