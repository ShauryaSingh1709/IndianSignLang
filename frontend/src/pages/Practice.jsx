import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { predictSign, checkModelHealth } from '../utils/api';
import Navbar from '../components/Common/Navbar';
import './Practice.css';

// Hand connections for drawing skeleton
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17], [0, 5], [0, 17]
];

// ISL Alphabet signs
const ISL_SIGNS = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return {
    id: i + 1,
    name: letter,
    label: `Letter ${letter}`,
    images: [
      `/dataset/${letter}/1.jpg`,
      `/dataset/${letter}/2.jpg`,
      `/dataset/${letter}/3.jpg`,
    ],
    category: i < 9 ? 'A–I' : i < 18 ? 'J–R' : 'S–Z',
  };
});

const CATEGORIES = ['All', 'A–I', 'J–R', 'S–Z'];

const CONFIG = {
  DETECTION_INTERVAL: 400,
  STABILITY_THRESHOLD: 4,
  CONFIDENCE_THRESHOLD: 65,
  HOLD_TIME_REQUIRED: 2000,
  QUEUE_SIZE: 8,
};

const Practice = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const drawLoopRef = useRef(null);
  const predictionQueueRef = useRef([]);
  const holdStartTimeRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const landmarksRef = useRef(null);
  const isStreamingRef = useRef(false);
  const currentSignRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSign, setCurrentSign] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [stablePrediction, setStablePrediction] = useState(null);
  const [stableConfidence, setStableConfidence] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('waiting');
  const [modelStatus, setModelStatus] = useState('unknown');
  const [cameraError, setCameraError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Keep ref in sync with state (fixes stale closure bug)
  useEffect(() => {
    currentSignRef.current = currentSign;
  }, [currentSign]);

  const filteredSigns = selectedCategory === 'All'
    ? ISL_SIGNS
    : ISL_SIGNS.filter(s => s.category === selectedCategory);

  // Check model health
  useEffect(() => {
    checkModelHealth().then(h => setModelStatus(h.status || 'unknown')).catch(() => setModelStatus('unavailable'));
  }, []);

  // Auto-select first sign
  useEffect(() => {
    if (filteredSigns.length > 0 && !currentSign) {
      setCurrentSign(filteredSigns[0]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Drawing loop
  useEffect(() => {
    if (isStreaming) {
      isStreamingRef.current = true;
      startDrawingLoop();
    } else {
      isStreamingRef.current = false;
      stopDrawingLoop();
    }
    return () => stopDrawingLoop();
  }, [isStreaming]);

  // Reset detection when sign changes
  useEffect(() => {
    resetDetectionState();
  }, [currentSign]);

  // ─── Drawing ───────────────────────────────────────────────────────────────

  const clearOverlayCanvas = () => {
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  };

  const drawHandSkeleton = (landmarks, canvas) => {
    if (!landmarks || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const handsCount = Math.floor(landmarks.length / 21);
    for (let h = 0; h < handsCount; h++) {
      const hand = landmarks.slice(h * 21, (h + 1) * 21);

      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2.5;
      for (const [s, e] of HAND_CONNECTIONS) {
        if (hand[s] && hand[e]) {
          ctx.beginPath();
          ctx.moveTo(hand[s].x * width, hand[s].y * height);
          ctx.lineTo(hand[e].x * width, hand[e].y * height);
          ctx.stroke();
        }
      }

      for (const lm of hand) {
        if (lm) {
          ctx.beginPath();
          ctx.arc(lm.x * width, lm.y * height, 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#C084FC';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  };

  const startDrawingLoop = () => {
    stopDrawingLoop();
    const draw = () => {
      if (!isStreamingRef.current) return;
      if (overlayCanvasRef.current && videoRef.current) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        if (video.videoWidth && video.videoHeight) {
          if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
          if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        }
        if (landmarksRef.current?.length > 0) {
          drawHandSkeleton(landmarksRef.current, canvas);
        } else {
          clearOverlayCanvas();
        }
      }
      drawLoopRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopDrawingLoop = () => {
    if (drawLoopRef.current) {
      cancelAnimationFrame(drawLoopRef.current);
      drawLoopRef.current = null;
    }
  };

  // ─── Detection ─────────────────────────────────────────────────────────────

  const resetDetectionState = () => {
    landmarksRef.current = null;
    clearOverlayCanvas();
    predictionQueueRef.current = [];
    holdStartTimeRef.current = null;
    setStablePrediction(null);
    setStableConfidence(0);
    setIsCorrect(false);
    setHoldProgress(0);
    setIsLocked(false);
    setShowSuccess(false);
    setDetectionStatus('waiting');
    setHandDetected(false);
    setImageIndex(0);
    setImageLoadError(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const getStablePrediction = (queue) => {
    if (queue.length < CONFIG.STABILITY_THRESHOLD) return null;
    const recent = queue.slice(-CONFIG.STABILITY_THRESHOLD);
    const first = recent[0]?.predicted;
    if (recent.every(p => p.predicted === first) && first) {
      const avg = recent.reduce((s, p) => s + p.confidence, 0) / recent.length;
      if (avg >= CONFIG.CONFIDENCE_THRESHOLD) return { predicted: first, confidence: avg };
    }
    return null;
  };

  const processFrame = async () => {
    // Use ref to avoid stale closure
    const sign = currentSignRef.current;
    if (!videoRef.current || !canvasRef.current || !sign || isLocked) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      const result = await predictSign(imageData, sign.name);

      if (result.success && result.handDetected) {
        setHandDetected(true);
        setDetectionStatus('detecting');
        landmarksRef.current = result.landmarks?.length > 0 ? result.landmarks : null;

        predictionQueueRef.current.push({ predicted: result.predicted, confidence: result.confidence });
        if (predictionQueueRef.current.length > CONFIG.QUEUE_SIZE) predictionQueueRef.current.shift();

        const stable = getStablePrediction(predictionQueueRef.current);
        if (stable) {
          setStablePrediction(stable.predicted);
          setStableConfidence(stable.confidence);
          const correct = stable.predicted?.toUpperCase() === sign.name.toUpperCase();
          setIsCorrect(correct);

          if (correct) {
            if (!holdStartTimeRef.current) {
              holdStartTimeRef.current = Date.now();
              setDetectionStatus('holding');
              startHoldTimer();
            }
          } else {
            resetHoldTimer();
            setDetectionStatus('detecting');
          }
        } else {
          resetHoldTimer();
        }
      } else {
        setHandDetected(false);
        setDetectionStatus('waiting');
        setStablePrediction(null);
        setStableConfidence(0);
        setIsCorrect(false);
        resetHoldTimer();
        predictionQueueRef.current = [];
        landmarksRef.current = null;
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  const startHoldTimer = () => {
    if (holdIntervalRef.current) return;
    holdIntervalRef.current = setInterval(() => {
      if (!holdStartTimeRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        return;
      }
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min((elapsed / CONFIG.HOLD_TIME_REQUIRED) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) handleSignSuccess();
    }, 50);
  };

  const resetHoldTimer = () => {
    holdStartTimeRef.current = null;
    setHoldProgress(0);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleSignSuccess = () => {
    if (isLocked) return;
    setIsLocked(true);
    setShowSuccess(true);
    setDetectionStatus('success');
    resetHoldTimer();
    pauseDetection();
    landmarksRef.current = null;
    clearOverlayCanvas();

    setScore(prev => prev + 10);
    setAttempts(prev => prev + 1);

    toast.success(`Perfect! You signed "${currentSignRef.current?.name}" correctly!`, { duration: 2000 });

    setTimeout(() => {
      setShowSuccess(false);
      setIsLocked(false);
      resumeDetection();
    }, 2500);
  };

  const pauseDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const resumeDetection = () => {
    if (!detectionIntervalRef.current && isStreamingRef.current) {
      detectionIntervalRef.current = setInterval(processFrame, CONFIG.DETECTION_INTERVAL);
    }
  };

  const startDetection = () => {
    pauseDetection();
    detectionIntervalRef.current = setInterval(processFrame, CONFIG.DETECTION_INTERVAL);
  };

  // ─── Camera ────────────────────────────────────────────────────────────────

  const startCamera = async () => {
    try {
      setCameraError(null);
      resetDetectionState();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsStreaming(true);
            setVideoReady(true);
            toast.success(`Camera ready! Show "${currentSignRef.current?.name}"`, { duration: 2000 });
            setTimeout(startDetection, 800);
          }).catch(() => setCameraError('Failed to start video'));
        };
      }
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? 'Camera permission denied'
        : err.name === 'NotFoundError' ? 'No camera found'
        : `Camera error: ${err.message}`;
      setCameraError(msg);
      toast.error(msg);
    }
  };

  const stopCamera = () => {
    pauseDetection();
    stopDrawingLoop();
    landmarksRef.current = null;
    clearOverlayCanvas();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);
    setVideoReady(false);
    isStreamingRef.current = false;
    resetDetectionState();
  };

  // ─── Sign Selection ────────────────────────────────────────────────────────

  const selectSign = (sign) => {
    setCurrentSign(sign);
    // resetDetectionState is triggered by useEffect on currentSign change
  };

  const selectRandom = () => {
    const pool = filteredSigns;
    const next = pool[Math.floor(Math.random() * pool.length)];
    selectSign(next);
  };

  // ─── Status ────────────────────────────────────────────────────────────────

  const getStatusInfo = () => {
    switch (detectionStatus) {
      case 'waiting': return { text: 'Show your hand to the camera', color: 'gray' };
      case 'detecting':
        if (isCorrect) return { text: `Correct! Hold the sign...`, color: 'green' };
        if (stablePrediction) return { text: `Detected: "${stablePrediction}" — try again`, color: 'orange' };
        return { text: 'Detecting sign...', color: 'blue' };
      case 'holding': return { text: `Hold "${currentSign?.name}"...`, color: 'green' };
      case 'success': return { text: 'Perfect!', color: 'green' };
      default: return { text: 'Waiting...', color: 'gray' };
    }
  };

  const statusInfo = getStatusInfo();
  const accuracy = attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 0;

  // ─── Image ─────────────────────────────────────────────────────────────────

  const getImageUrl = () => currentSign?.images[imageIndex] || currentSign?.images[0] || '';

  const handleImageError = () => {
    if (currentSign && imageIndex < currentSign.images.length - 1) {
      setImageIndex(prev => prev + 1);
    } else {
      setImageLoadError(true);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="practice-page">
      {/* Background matching Dashboard */}
      <div className="practice-bg">
        <div className="practice-bg-main" />
        <div className="practice-bg-circle practice-bg-circle-1" />
        <div className="practice-bg-circle practice-bg-circle-2" />
        <div className="practice-bg-circle practice-bg-circle-3" />
        <div className="practice-bg-pattern" />
      </div>

      <Navbar />

      <main className="practice-main">
        {/* Header */}
        <motion.div
          className="practice-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="practice-header-left">
            <h1 className="practice-title">Practice Mode</h1>
            <p className="practice-subtitle">Select a sign and practice with your camera</p>
          </div>
          <div className="practice-header-right">
            <div className={`model-status-badge ${modelStatus === 'ready' ? 'ready' : 'loading'}`}>
              <span className="model-dot" />
              {modelStatus === 'ready' ? 'AI Ready' : 'Connecting...'}
            </div>
            <div className="score-chips">
              <div className="score-chip">
                <span className="score-chip-value">{score}</span>
                <span className="score-chip-label">Points</span>
              </div>
              <div className="score-chip">
                <span className="score-chip-value">{attempts}</span>
                <span className="score-chip-label">Attempts</span>
              </div>
              <div className="score-chip">
                <span className="score-chip-value">{accuracy}%</span>
                <span className="score-chip-label">Accuracy</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="practice-grid">

          {/* Left: Sign Library */}
          <motion.div
            className="practice-card sign-library-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header">
              <h2 className="card-title">Sign Library</h2>
              <button className="btn-random" onClick={selectRandom}>Random</button>
            </div>

            {/* Category Filter */}
            <div className="category-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Signs Grid */}
            <div className="signs-grid">
              {filteredSigns.map(sign => (
                <motion.button
                  key={sign.id}
                  className={`sign-btn ${currentSign?.id === sign.id ? 'active' : ''}`}
                  onClick={() => selectSign(sign)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sign.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Center: Camera */}
          <motion.div
            className="practice-card camera-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header">
              <h2 className="card-title">
                {currentSign ? `Practice: "${currentSign.name}"` : 'Select a Sign'}
              </h2>
              {isStreaming && (
                <button className="btn-stop-cam" onClick={stopCamera}>Stop Camera</button>
              )}
            </div>

            {/* Video Container */}
            <div className={`video-wrapper ${showSuccess ? 'glow-success' : isCorrect && holdProgress > 0 ? 'glow-correct' : ''}`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="practice-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <canvas ref={overlayCanvasRef} className="skeleton-overlay" />

              {/* Target overlay */}
              {isStreaming && currentSign && (
                <div className="target-overlay">
                  <span className="target-label">Target</span>
                  <span className="target-letter">{currentSign.name}</span>
                </div>
              )}

              {/* Status badge */}
              {isStreaming && (
                <div className={`status-badge status-${statusInfo.color}`}>
                  {statusInfo.text}
                </div>
              )}

              {/* Confidence badge */}
              {isStreaming && stableConfidence > 0 && (
                <div className="confidence-badge">
                  {Math.round(stableConfidence)}%
                </div>
              )}

              {/* Hold progress circle */}
              {detectionStatus === 'holding' && holdProgress > 0 && (
                <div className="hold-progress-overlay">
                  <svg className="hold-circle" viewBox="0 0 100 100">
                    <circle className="hold-circle-bg" cx="50" cy="50" r="45" />
                    <circle
                      className="hold-circle-fill"
                      cx="50" cy="50" r="45"
                      style={{ strokeDasharray: `${holdProgress * 2.83} 283` }}
                    />
                  </svg>
                  <div className="hold-text">
                    <span className="hold-letter">{currentSign?.name}</span>
                    <span className="hold-percent">{Math.round(holdProgress)}%</span>
                  </div>
                </div>
              )}

              {/* Success overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    className="success-overlay"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="success-content">
                      <div className="success-checkmark">✓</div>
                      <span className="success-text">Perfect!</span>
                      <span className="success-letter">"{currentSign?.name}" Correct!</span>
                      <span className="success-points">+10 Points</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera off placeholder */}
              {!isStreaming && (
                <div className="camera-placeholder">
                  <div className="camera-icon-wrapper">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <p>Camera is off</p>
                  {cameraError && <p className="camera-error-text">{cameraError}</p>}
                </div>
              )}

              {/* Loading */}
              {isStreaming && !videoReady && (
                <div className="camera-loading">
                  <div className="spinner" />
                  <p>Starting camera...</p>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="camera-controls">
              {!isStreaming ? (
                <motion.button
                  className="btn-start-cam"
                  onClick={startCamera}
                  disabled={!currentSign}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Camera
                </motion.button>
              ) : (
                <div className="detection-info-row">
                  <div className={`info-chip ${handDetected ? 'active' : ''}`}>
                    <span className="info-chip-dot" />
                    <span>{handDetected ? 'Hand Detected' : 'No Hand'}</span>
                  </div>
                  <div className={`info-chip ${stablePrediction ? 'active' : ''}`}>
                    <span>Detected: </span>
                    <strong>{stablePrediction || '—'}</strong>
                  </div>
                  <div className={`info-chip ${isCorrect ? 'correct' : ''}`}>
                    <span>{isCorrect ? 'Correct!' : stablePrediction ? 'Keep trying' : 'Waiting'}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Reference + Stats */}
          <motion.div
            className="practice-card reference-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Reference Image */}
            <div className="card-header">
              <h2 className="card-title">Reference</h2>
            </div>

            {currentSign ? (
              <div className="reference-content">
                <div className="reference-letter-badge">{currentSign.name}</div>

                <div className="reference-image-box">
                  {!imageLoadError ? (
                    <>
                      <img
                        src={getImageUrl()}
                        alt={`ISL sign for ${currentSign.name}`}
                        className="reference-image"
                        onError={handleImageError}
                        onLoad={() => setImageLoadError(false)}
                      />
                      <div className="image-dots">
                        {currentSign.images.slice(0, 3).map((_, idx) => (
                          <button
                            key={idx}
                            className={`dot ${imageIndex === idx ? 'active' : ''}`}
                            onClick={() => setImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="reference-placeholder">
                      <span className="placeholder-letter">{currentSign.name}</span>
                      <p>No image available</p>
                    </div>
                  )}
                </div>

                <p className="reference-hint">Copy this hand position and show it to the camera</p>
              </div>
            ) : (
              <div className="reference-empty">
                <p>Select a sign from the library to see the reference image</p>
              </div>
            )}

            {/* Session Stats */}
            <div className="session-stats">
              <h3 className="stats-title">Session Stats</h3>
              <div className="stats-list">
                <div className="stat-row">
                  <span className="stat-row-label">Score</span>
                  <span className="stat-row-value purple">{score} pts</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label">Attempts</span>
                  <span className="stat-row-value">{attempts}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label">Accuracy</span>
                  <span className="stat-row-value green">{accuracy}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label">Current Sign</span>
                  <span className="stat-row-value">{currentSign?.name || '—'}</span>
                </div>
              </div>

              {/* Accuracy bar */}
              {attempts > 0 && (
                <div className="accuracy-bar-wrapper">
                  <div className="accuracy-bar">
                    <motion.div
                      className="accuracy-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${accuracy}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="accuracy-label">{accuracy}% accuracy</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Practice;
