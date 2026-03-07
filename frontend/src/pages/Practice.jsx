import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiRefreshCw, FiCheck, FiX, FiVolume2, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../components/Common/Navbar';
import './Practice.css';

const Practice = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSign, setCurrentSign] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [practiceMode, setPracticeMode] = useState('free'); // 'free', 'guided', 'challenge'

  const signs = [
    { id: 1, name: 'Hello', hindi: 'नमस्ते', image: '👋', difficulty: 'easy' },
    { id: 2, name: 'Thank You', hindi: 'धन्यवाद', image: '🙏', difficulty: 'easy' },
    { id: 3, name: 'Yes', hindi: 'हाँ', image: '👍', difficulty: 'easy' },
    { id: 4, name: 'No', hindi: 'नहीं', image: '👎', difficulty: 'easy' },
    { id: 5, name: 'Please', hindi: 'कृपया', image: '🤲', difficulty: 'medium' },
    { id: 6, name: 'Sorry', hindi: 'माफ़ करें', image: '😔', difficulty: 'medium' },
    { id: 7, name: 'Help', hindi: 'मदद', image: '🆘', difficulty: 'medium' },
    { id: 8, name: 'I Love You', hindi: 'मैं तुमसे प्यार करता हूँ', image: '🤟', difficulty: 'hard' },
  ];

  const tips = {
    'Hello': [
      'Raise your hand with palm facing outward',
      'Wave gently from side to side',
      'Keep your fingers together',
    ],
    'Thank You': [
      'Touch your chin with fingertips',
      'Move hand forward and down',
      'Like blowing a kiss gesture',
    ],
    'Yes': [
      'Make a fist with your hand',
      'Move fist up and down',
      'Like nodding with your hand',
    ],
    'No': [
      'Extend index and middle finger',
      'Close them together like scissors',
      'Repeat the motion',
    ],
  };

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        toast.success('Camera started successfully!');
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Failed to access camera. Please allow camera permissions.');
    }
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  // Capture Frame
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simulate prediction (replace with actual API call)
    setTimeout(() => {
      const randomSign = signs[Math.floor(Math.random() * signs.length)];
      const confidence = (Math.random() * 30 + 70).toFixed(1);
      
      setPrediction({
        sign: randomSign.name,
        confidence: parseFloat(confidence),
        isCorrect: currentSign && randomSign.name === currentSign.name,
      });

      setAttempts(prev => prev + 1);
      
      if (currentSign && randomSign.name === currentSign.name) {
        setScore(prev => prev + 10);
        toast.success('Correct! +10 points');
      }

      setIsProcessing(false);
    }, 1500);
  }, [currentSign, signs]);

  // Select Random Sign
  const selectRandomSign = () => {
    const randomIndex = Math.floor(Math.random() * signs.length);
    setCurrentSign(signs[randomIndex]);
    setPrediction(null);
  };

  // Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Auto select sign on mount
  useEffect(() => {
    selectRandomSign();
  }, []);

  return (
    <div className="practice-page">
      <Navbar />
      
      <div className="practice-container">
        <div className="practice-header">
          <h1>Practice Mode</h1>
          <div className="mode-selector">
            <button 
              className={`mode-btn ${practiceMode === 'free' ? 'active' : ''}`}
              onClick={() => setPracticeMode('free')}
            >
              Free Practice
            </button>
            <button 
              className={`mode-btn ${practiceMode === 'guided' ? 'active' : ''}`}
              onClick={() => setPracticeMode('guided')}
            >
              Guided
            </button>
            <button 
              className={`mode-btn ${practiceMode === 'challenge' ? 'active' : ''}`}
              onClick={() => setPracticeMode('challenge')}
            >
              Challenge
            </button>
          </div>
        </div>

        <div className="practice-content">
          {/* Left: Target Sign */}
          <div className="target-section">
            <div className="score-board">
              <div className="score-item">
                <span className="score-value">{score}</span>
                <span className="score-label">Points</span>
              </div>
              <div className="score-item">
                <span className="score-value">{attempts}</span>
                <span className="score-label">Attempts</span>
              </div>
              <div className="score-item">
                <span className="score-value">
                  {attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 0}%
                </span>
                <span className="score-label">Accuracy</span>
              </div>
            </div>

            {currentSign && (
              <div className="target-card">
                <h2>Show this sign:</h2>
                <div className="target-sign">
                  <span className="sign-emoji">{currentSign.image}</span>
                  <h3>{currentSign.name}</h3>
                  <p className="hindi-text">{currentSign.hindi}</p>
                  <span className={`difficulty-badge ${currentSign.difficulty}`}>
                    {currentSign.difficulty}
                  </span>
                </div>
                
                <button className="btn-skip" onClick={selectRandomSign}>
                  <FiRefreshCw /> Next Sign
                </button>
              </div>
            )}

            {/* Tips Section */}
            <div className="tips-section">
              <button 
                className="tips-toggle"
                onClick={() => setShowTips(!showTips)}
              >
                <FiInfo /> {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
              
              {showTips && currentSign && tips[currentSign.name] && (
                <div className="tips-content">
                  <h4>How to sign "{currentSign.name}":</h4>
                  <ul>
                    {tips[currentSign.name].map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Center: Camera */}
          <div className="camera-section">
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={isStreaming ? 'active' : ''}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!isStreaming && (
                <div className="camera-placeholder">
                  <FiCamera size={64} />
                  <p>Camera is off</p>
                </div>
              )}

              {isProcessing && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <p>Analyzing...</p>
                </div>
              )}
            </div>

            <div className="camera-controls">
              {!isStreaming ? (
                <button className="btn-camera start" onClick={startCamera}>
                  <FiCamera /> Start Camera
                </button>
              ) : (
                <>
                  <button className="btn-camera stop" onClick={stopCamera}>
                    <FiX /> Stop Camera
                  </button>
                  <button 
                    className="btn-capture" 
                    onClick={captureFrame}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Capture & Check'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="results-section">
            <h2>Prediction Result</h2>
            
            {prediction ? (
              <div className={`result-card ${prediction.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-icon">
                  {prediction.isCorrect ? <FiCheck /> : <FiX />}
                </div>
                <h3>{prediction.sign}</h3>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
                <p className="confidence-text">{prediction.confidence}% confident</p>
                
                {prediction.isCorrect ? (
                  <p className="result-message success">Great job! That's correct!</p>
                ) : (
                  <p className="result-message error">Try again! Keep practicing!</p>
                )}
              </div>
            ) : (
              <div className="result-placeholder">
                <p>Capture a frame to see prediction results</p>
              </div>
            )}

            {/* Recent Attempts */}
            <div className="recent-attempts">
              <h4>Sign Library</h4>
              <div className="signs-grid">
                {signs.map(sign => (
                  <button 
                    key={sign.id}
                    className={`sign-item ${currentSign?.id === sign.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentSign(sign);
                      setPrediction(null);
                    }}
                  >
                    <span>{sign.image}</span>
                    <p>{sign.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;