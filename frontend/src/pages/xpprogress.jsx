import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { calculateLevel, getXPProgress, calculateXPForNextLevel } from '../../utils/helpers';
import './XPProgress.css';

const XPProgress = ({ totalXP }) => {
  const level = calculateLevel(totalXP);
  const progress = getXPProgress(totalXP);
  const nextLevelXP = calculateXPForNextLevel(totalXP);
  const currentLevelXP = (level - 1) * 1000;
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - totalXP;

  return (
    <div className="xp-progress-card">
      <div className="xp-header">
        <h3>Your Progress</h3>
        <FiTrendingUp className="trending-icon" />
      </div>

      <div className="level-display">
        <div className="level-badge">
          <span className="level-number">{level}</span>
          <span className="level-label">Level</span>
        </div>

        <div className="xp-info">
          <p className="total-xp">{totalXP.toLocaleString()} XP</p>
          <p className="xp-needed">{xpNeeded} XP to next level</p>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar-large">
          <div 
            className="progress-fill-large"
            style={{ width: `${progress}%` }}
          >
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="xp-range">
          <span>{currentLevelXP}</span>
          <span>{nextLevelXP}</span>
        </div>
      </div>
    </div>
  );
};

export default XPProgress;