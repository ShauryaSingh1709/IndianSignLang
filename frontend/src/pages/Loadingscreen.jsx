import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-inner"></div>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;