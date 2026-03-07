import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/learn', label: 'Learn' },
  { path: '/practice', label: 'Practice' },
  { path: '/quiz', label: 'Quiz' },
  { path: '/leaderboard', label: 'Leaderboard' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.inner}>
          {/* Logo */}
          <Link to="/dashboard" style={styles.logo}>
            <span style={styles.logoIcon}>ISL</span>
            <span style={styles.logoText}>Learn</span>
          </Link>

          {/* Desktop Nav */}
          <div style={styles.navLinks}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive(item.path) ? styles.navLinkActive : {}),
                }}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={styles.activeIndicator}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div style={styles.userSection}>
            {user && (
              <div style={styles.userChip}>
                <div style={styles.avatar}>
                  {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user.full_name?.split(' ')[0] || user.username}</span>
                  <span style={styles.userXp}>{user.xp_points || 0} XP</span>
                </div>
              </div>
            )}
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>

            {/* Mobile hamburger */}
            <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
              <span style={{ ...styles.bar, ...(menuOpen ? styles.barTop : {}) }} />
              <span style={{ ...styles.bar, ...(menuOpen ? styles.barMid : {}) }} />
              <span style={{ ...styles.bar, ...(menuOpen ? styles.barBot : {}) }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            style={styles.mobileMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.mobileLink,
                  ...(isActive(item.path) ? styles.mobileLinkActive : {}),
                }}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button style={styles.mobileLogout} onClick={handleLogout}>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(168, 85, 247, 0.12)',
    boxShadow: '0 2px 20px rgba(139, 92, 246, 0.08)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  inner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1F1235',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    position: 'relative',
    padding: '8px 16px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    borderRadius: '10px',
    transition: 'color 0.2s, background 0.2s',
  },
  navLinkActive: {
    color: '#7C3AED',
    fontWeight: '600',
    background: 'rgba(168, 85, 247, 0.08)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-1px',
    left: '16px',
    right: '16px',
    height: '2px',
    background: 'linear-gradient(90deg, #A855F7, #7C3AED)',
    borderRadius: '2px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px 6px 6px',
    background: 'rgba(233, 213, 255, 0.4)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    borderRadius: '40px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1F1235',
  },
  userXp: {
    fontSize: '11px',
    color: '#7C3AED',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  bar: {
    display: 'block',
    width: '22px',
    height: '2px',
    background: '#7C3AED',
    borderRadius: '2px',
    transition: 'all 0.3s',
  },
  barTop: { transform: 'translateY(7px) rotate(45deg)' },
  barMid: { opacity: 0 },
  barBot: { transform: 'translateY(-7px) rotate(-45deg)' },
  mobileMenu: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    zIndex: 99,
    background: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(168, 85, 247, 0.12)',
    padding: '12px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.1)',
  },
  mobileLink: {
    padding: '12px 16px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  mobileLinkActive: {
    background: 'rgba(168, 85, 247, 0.08)',
    color: '#7C3AED',
    fontWeight: '600',
  },
  mobileLogout: {
    marginTop: '8px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
  },
};

// Responsive: hide desktop nav on mobile via media query injection
const styleTag = document.createElement('style');
styleTag.textContent = `
  @media (max-width: 768px) {
    .navbar-desktop-links { display: none !important; }
    .navbar-user-chip { display: none !important; }
    .navbar-logout-btn { display: none !important; }
    .navbar-hamburger { display: flex !important; }
  }
`;
if (!document.head.querySelector('[data-navbar-styles]')) {
  styleTag.setAttribute('data-navbar-styles', '1');
  document.head.appendChild(styleTag);
}

export default Navbar;
