import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiBook, FiTarget, FiAward, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/learn', label: 'Learn', icon: <FiBook /> },
    { path: '/practice', label: 'Practice', icon: <FiTarget /> },
    { path: '/quiz', label: 'Quiz', icon: <FiAward /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FiAward /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">🤟</span>
          <span className="logo-text">ISL Learn</span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="user-xp">{user?.xp_points || 0} XP</span>
            </div>
          </div>

          <div className="user-dropdown">
            <Link to="/profile" className="dropdown-item">
              <FiUser /> Profile
            </Link>
            <button onClick={handleLogout} className="dropdown-item logout">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;