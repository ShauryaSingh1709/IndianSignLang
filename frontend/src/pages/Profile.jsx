import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMail, FiEdit2, FiCamera, FiAward, FiTrendingUp, FiCalendar, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../components/Common/Navbar';
import { calculateLevel, getXPProgress } from '../utils/helpers';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || 'User',
    email: user?.email || 'user@example.com',
    fullName: user?.full_name || '',
    bio: user?.bio || '',
  });

  // Mock user data (replace with actual user data)
  const userData = {
    username: formData.username,
    email: formData.email,
    fullName: formData.fullName || 'John Doe',
    bio: formData.bio || 'Learning ISL enthusiast',
    avatar: user?.avatar_url,
    xp: user?.xp_points || 2500,
    streak: user?.streak_days || 15,
    lessonsCompleted: 24,
    quizzesTaken: 18,
    accuracy: 85,
    joinedDate: user?.created_at || '2024-01-15',
    achievements: [
      { id: 1, name: 'First Step', icon: '🌟', description: 'Complete your first lesson' },
      { id: 2, name: 'Week Warrior', icon: '🔥', description: '7 day streak' },
      { id: 3, name: 'Quiz Master', icon: '🏆', description: 'Score 100% in a quiz' },
      { id: 4, name: 'Fast Learner', icon: '⚡', description: 'Complete 10 lessons' },
    ],
    recentActivity: [
      { date: '2024-01-20', activity: 'Completed Alphabets Lesson', xp: 50 },
      { date: '2024-01-19', activity: 'Quiz: Numbers (Score: 90%)', xp: 80 },
      { date: '2024-01-18', activity: 'Practice Session', xp: 30 },
    ],
  };

  const level = calculateLevel(userData.xp);
  const xpProgress = getXPProgress(userData.xp);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Add API call here
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add file upload logic
      toast.info('Avatar upload feature coming soon!');
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.username} />
              ) : (
                <span className="avatar-placeholder">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              )}
              <label className="avatar-upload">
                <FiCamera />
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>
            
            <div className="level-badge">
              <span>Level {level}</span>
            </div>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                />
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave}>
                    <FiSave /> Save
                  </button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1>{userData.fullName || userData.username}</h1>
                <p className="username">@{userData.username}</p>
                <p className="bio">{userData.bio}</p>
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <FiEdit2 /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <FiTrendingUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{userData.xp.toLocaleString()}</span>
              <span className="stat-label">Total XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-emoji">🔥</span>
            <div className="stat-content">
              <span className="stat-value">{userData.streak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-emoji">📚</span>
            <div className="stat-content">
              <span className="stat-value">{userData.lessonsCompleted}</span>
              <span className="stat-label">Lessons Done</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-emoji">🎯</span>
            <div className="stat-content">
              <span className="stat-value">{userData.accuracy}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Achievements */}
          <div className="achievements-section">
            <h2><FiAward /> Achievements</h2>
            <div className="achievements-grid">
              {userData.achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <span className="achievement-icon">{achievement.icon}</span>
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2><FiCalendar /> Recent Activity</h2>
            <div className="activity-list">
              {userData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-date">{activity.date}</div>
                  <div className="activity-info">
                    <p>{activity.activity}</p>
                    <span className="activity-xp">+{activity.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <h2>Account Settings</h2>
          <div className="settings-item">
            <div className="setting-info">
              <FiMail />
              <div>
                <h4>Email Address</h4>
                <p>{userData.email}</p>
              </div>
            </div>
            <button className="btn-change">Change</button>
          </div>
          
          <div className="settings-item">
            <div className="setting-info">
              <FiUser />
              <div>
                <h4>Password</h4>
                <p>••••••••</p>
              </div>
            </div>
            <button className="btn-change">Change</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;