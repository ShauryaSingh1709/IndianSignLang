import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { predictSign, checkModelHealth } from '../utils/api';
import './learn.css';

// Hand connections for drawing skeleton (same as MediaPipe)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],           // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12],      // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16],    // Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
  [5, 9], [9, 13], [13, 17], [0, 5], [0, 17] // Palm
];

// Generate alphabet data
const ALPHABETS = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return {
    id: i + 1,
    letter: letter,
    images: [
      `/dataset/${letter}/1.jpg`,
      `/dataset/${letter}/2.jpg`,
      `/dataset/${letter}/3.jpg`,
    ],
  };
});

// Lessons configuration
const LESSONS = {
  'alphabets-basics': {
    id: 'alphabets-basics',
    title: 'ISL Alphabets - A to I',
    description: 'Learn basic hand signs for letters A to I',
    alphabets: ALPHABETS.slice(0, 9),
    xpReward: 100,
  },
  'alphabets-intermediate': {
    id: 'alphabets-intermediate',
    title: 'ISL Alphabets - J to R',
    description: 'Learn hand signs for letters J to R',
    alphabets: ALPHABETS.slice(9, 18),
    xpReward: 150,
  },
  'alphabets-advanced': {
    id: 'alphabets-advanced',
    title: 'ISL Alphabets - S to Z',
    description: 'Learn hand signs for letters S to Z',
    alphabets: ALPHABETS.slice(18, 26),
    xpReward: 150,
  },
  'all-alphabets': {
    id: 'all-alphabets',
    title: 'Complete ISL Alphabets',
    description: 'Learn all 26 ISL alphabet signs',
    alphabets: ALPHABETS,
    xpReward: 300,
  },
};

// Configuration
const CONFIG = {
  DETECTION_INTERVAL: 400,
  STABILITY_THRESHOLD: 4,
  CONFIDENCE_THRESHOLD: 70,
  HOLD_TIME_REQUIRED: 2000,
  QUEUE_SIZE: 8,
};

const Learn = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // Basic states
  const [lesson, setLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState('intro');
  const [showCamera, setShowCamera] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [learnedLetters, setLearnedLetters] = useState([]);
  const [scores, setScores] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelStatus, setModelStatus] = useState('unknown');
  
  // Detection states
  const [handDetected, setHandDetected] = useState(false);
  const [stablePrediction, setStablePrediction] = useState(null);
  const [stableConfidence, setStableConfidence] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('waiting');

  // Refs
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

  const currentAlphabet = lesson?.alphabets[currentIndex];

  // Check model status
  useEffect(() => {
    const checkModel = async () => {
      try {
        const health = await checkModelHealth();
        setModelStatus(health.status || 'unknown');
      } catch (error) {
        setModelStatus('unavailable');
      }
    };
    checkModel();
  }, []);

  // Load lesson
  useEffect(() => {
    const lessonData = LESSONS[lessonId] || LESSONS['all-alphabets'];
    setLesson(lessonData);
  }, [lessonId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Reset detection state when changing letter (but keep camera running)
  useEffect(() => {
    resetDetectionStateOnly();
  }, [currentIndex]);

  // Start/stop drawing loop based on streaming state
  useEffect(() => {
    if (isStreaming) {
      isStreamingRef.current = true;
      startDrawingLoop();
    } else {
      isStreamingRef.current = false;
      stopDrawingLoop();
    }
    
    return () => {
      stopDrawingLoop();
    };
  }, [isStreaming]);

  // Clear old landmarks and reset detection (keep camera running)
  const resetDetectionStateOnly = () => {
    // Clear landmarks immediately
    landmarksRef.current = null;
    clearOverlayCanvas();
    
    // Reset detection states
    setImageIndex(0);
    setImageLoadError(false);
    setStablePrediction(null);
    setStableConfidence(0);
    setIsCorrect(false);
    setHoldProgress(0);
    setIsLocked(false);
    setShowSuccess(false);
    setDetectionStatus('waiting');
    setHandDetected(false);
    
    // Clear prediction queue
    predictionQueueRef.current = [];
    holdStartTimeRef.current = null;
    
    // Clear hold timer
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    
    console.log('🔄 Detection state reset for new letter');
  };

  // Clear the overlay canvas
  const clearOverlayCanvas = () => {
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  };

  // Full reset (including camera)
  const fullReset = () => {
    resetDetectionStateOnly();
    landmarksRef.current = null;
  };

  // Draw hand skeleton on overlay canvas
  // NOTE: We draw WITHOUT mirroring because canvas has CSS transform: scaleX(-1)
  const drawHandSkeleton = (landmarks, canvas) => {
    if (!landmarks || landmarks.length === 0 || !canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    // Process each hand (21 landmarks per hand)
    const handsCount = Math.floor(landmarks.length / 21);
    
    for (let h = 0; h < handsCount; h++) {
      const handLandmarks = landmarks.slice(h * 21, (h + 1) * 21);
      
      // Draw connections (lines) - Red color
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      
      for (const [start, end] of HAND_CONNECTIONS) {
        if (handLandmarks[start] && handLandmarks[end]) {
          const startPoint = handLandmarks[start];
          const endPoint = handLandmarks[end];
          
          // NO mirroring here - canvas has CSS transform
          const x1 = startPoint.x * width;
          const y1 = startPoint.y * height;
          const x2 = endPoint.x * width;
          const y2 = endPoint.y * height;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Draw landmarks (dots) - Green color
      for (let i = 0; i < handLandmarks.length; i++) {
        const landmark = handLandmarks[i];
        if (landmark) {
          // NO mirroring here - canvas has CSS transform
          const x = landmark.x * width;
          const y = landmark.y * height;
          
          // Green filled circle
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#00FF00';
          ctx.fill();
          
          // White border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  };

  // Continuous drawing loop for smooth skeleton
  const startDrawingLoop = () => {
    stopDrawingLoop(); // Clear any existing loop
    
    const draw = () => {
      if (!isStreamingRef.current) return;
      
      if (overlayCanvasRef.current && videoRef.current) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        
        // Set canvas size to match video
        if (video.videoWidth && video.videoHeight) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
        }
        
        // Draw current landmarks or clear
        if (landmarksRef.current && landmarksRef.current.length > 0) {
          drawHandSkeleton(landmarksRef.current, canvas);
        } else {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      drawLoopRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  // Stop drawing loop
  const stopDrawingLoop = () => {
    if (drawLoopRef.current) {
      cancelAnimationFrame(drawLoopRef.current);
      drawLoopRef.current = null;
    }
  };

  // Get stable prediction from queue
  const getStablePrediction = (queue) => {
    if (queue.length < CONFIG.STABILITY_THRESHOLD) return null;
    
    const recentPredictions = queue.slice(-CONFIG.STABILITY_THRESHOLD);
    const firstPred = recentPredictions[0]?.predicted;
    const allSame = recentPredictions.every(p => p.predicted === firstPred);
    
    if (allSame && firstPred) {
      const avgConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / recentPredictions.length;
      
      if (avgConfidence >= CONFIG.CONFIDENCE_THRESHOLD) {
        return { predicted: firstPred, confidence: avgConfidence };
      }
    }
    
    return null;
  };

  // Process detection frame
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !currentAlphabet || isLocked) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState < 2) return;

    // Set canvas size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame (NOT mirrored - we send original to backend)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      const result = await predictSign(imageData, currentAlphabet.letter);

      if (result.success && result.handDetected) {
        setHandDetected(true);
        setDetectionStatus('detecting');

        // Store landmarks for drawing
        if (result.landmarks && result.landmarks.length > 0) {
          landmarksRef.current = result.landmarks;
        } else {
          landmarksRef.current = null;
        }

        // Add to prediction queue
        predictionQueueRef.current.push({
          predicted: result.predicted,
          confidence: result.confidence
        });

        if (predictionQueueRef.current.length > CONFIG.QUEUE_SIZE) {
          predictionQueueRef.current.shift();
        }

        // Get stable prediction
        const stable = getStablePrediction(predictionQueueRef.current);

        if (stable) {
          setStablePrediction(stable.predicted);
          setStableConfidence(stable.confidence);

          const correct = stable.predicted.toUpperCase() === currentAlphabet.letter.toUpperCase();
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
        // No hand detected - clear everything
        setHandDetected(false);
        setDetectionStatus('waiting');
        setStablePrediction(null);
        setStableConfidence(0);
        setIsCorrect(false);
        resetHoldTimer();
        predictionQueueRef.current = [];
        landmarksRef.current = null; // Clear landmarks
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  // Start hold timer
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

      if (progress >= 100) {
        handleLetterSuccess();
      }
    }, 50);
  };

  // Reset hold timer
  const resetHoldTimer = () => {
    holdStartTimeRef.current = null;
    setHoldProgress(0);
    
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Handle successful letter completion
  const handleLetterSuccess = () => {
    if (isLocked) return;

    setIsLocked(true);
    setShowSuccess(true);
    setDetectionStatus('success');
    resetHoldTimer();

    // Pause detection temporarily
    pauseDetection();

    // Clear landmarks immediately for clean transition
    landmarksRef.current = null;
    clearOverlayCanvas();

    // Add to learned letters
    const currentLetter = currentAlphabet.letter;
    setLearnedLetters(prev => [...new Set([...prev, currentLetter])]);
    setScores(prev => [...prev, stableConfidence]);

    toast.success(`🎉 Perfect! You learned "${currentLetter}"!`, {
      duration: 2000,
      icon: '🌟'
    });

    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < lesson.alphabets.length - 1) {
        const nextLetter = lesson.alphabets[currentIndex + 1].letter;
        
        // Move to next letter
        setCurrentIndex(prev => prev + 1);
        setShowSuccess(false);
        setIsLocked(false);
        
        // Clear everything for new letter
        landmarksRef.current = null;
        clearOverlayCanvas();
        predictionQueueRef.current = [];
        
        toast.success(`Now show "${nextLetter}"!`, {
          duration: 2000,
          icon: '👉'
        });
        
        // Resume detection after brief pause
        setTimeout(() => {
          resumeDetection();
        }, 300);
      } else {
        // Lesson complete
        setStage('complete');
        stopCamera();
      }
    }, 2000);
  };

  // Pause detection (keep camera running)
  const pauseDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Resume detection
  const resumeDetection = () => {
    if (!detectionIntervalRef.current && isStreaming) {
      detectionIntervalRef.current = setInterval(() => {
        processFrame();
      }, CONFIG.DETECTION_INTERVAL);
    }
  };

  // Start detection loop
  const startDetection = () => {
    pauseDetection();
    
    detectionIntervalRef.current = setInterval(() => {
      processFrame();
    }, CONFIG.DETECTION_INTERVAL);

    console.log('🟢 Detection started');
  };

  // Stop detection loop
  const stopDetection = () => {
    pauseDetection();
    resetHoldTimer();
    console.log('🔴 Detection stopped');
  };

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      fullReset();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsStreaming(true);
              toast.success(`📷 Camera ready! Show "${currentAlphabet.letter}"`, {
                duration: 2000
              });
              
              setTimeout(() => {
                startDetection();
              }, 800);
            })
            .catch(err => {
              setCameraError('Failed to start video');
            });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      let message = 'Camera error: ';
      if (err.name === 'NotAllowedError') {
        message += 'Permission denied';
      } else if (err.name === 'NotFoundError') {
        message += 'No camera found';
      } else {
        message += err.message;
      }
      setCameraError(message);
      toast.error(message);
    }
  };

  // Stop camera completely
  const stopCamera = () => {
    stopDetection();
    stopDrawingLoop();
    
    // Clear landmarks
    landmarksRef.current = null;
    clearOverlayCanvas();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setShowCamera(false);
    fullReset();
    
    toast.success('Camera stopped');
  };

  // Navigation
  const handleNext = () => {
    // Clear landmarks before switching
    landmarksRef.current = null;
    clearOverlayCanvas();
    
    if (currentIndex < lesson.alphabets.length - 1) {
      pauseDetection();
      setCurrentIndex(prev => prev + 1);
      
      if (showCamera && isStreaming) {
        setTimeout(() => resumeDetection(), 300);
      }
    } else {
      setStage('complete');
      stopCamera();
    }
  };

  const handlePrev = () => {
    // Clear landmarks before switching
    landmarksRef.current = null;
    clearOverlayCanvas();
    
    if (currentIndex > 0) {
      pauseDetection();
      setCurrentIndex(prev => prev - 1);
      
      if (showCamera && isStreaming) {
        setTimeout(() => resumeDetection(), 300);
      }
    }
  };

  const handleStartPractice = () => {
    setShowCamera(true);
    startCamera();
  };

  // Image handling
  const getImageUrl = () => {
    if (!currentAlphabet) return '';
    return currentAlphabet.images[imageIndex] || currentAlphabet.images[0];
  };

  const handleImageError = () => {
    if (imageIndex < currentAlphabet.images.length - 1) {
      setImageIndex(prev => prev + 1);
    } else {
      setImageLoadError(true);
    }
  };

  // Get status info
  const getStatusInfo = () => {
    switch (detectionStatus) {
      case 'waiting':
        return { text: '👋 Show your hand', color: 'gray' };
      case 'detecting':
        if (isCorrect) {
          return { text: `✓ Correct! Hold it...`, color: 'green' };
        }
        if (stablePrediction) {
          return { text: `Showing "${stablePrediction}"`, color: 'orange' };
        }
        return { text: 'Detecting...', color: 'blue' };
      case 'holding':
        return { text: `✓ Hold "${currentAlphabet?.letter}"...`, color: 'green' };
      case 'success':
        return { text: '🎉 Perfect!', color: 'green' };
      default:
        return { text: 'Waiting...', color: 'gray' };
    }
  };

  const statusInfo = getStatusInfo();

  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  if (!lesson) {
    return (
      <div className="learn-page">
        <div className="learn-loading">
          <div className="spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-page">
      {/* Background */}
      <div className="learn-bg">
        <div className="bg-gradient"></div>
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
      </div>

      {/* Header */}
      <header className="learn-header">
        <button onClick={() => { stopCamera(); navigate('/dashboard'); }} className="btn-exit">
          ← Exit
        </button>
        
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / lesson.alphabets.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">{currentIndex + 1} / {lesson.alphabets.length}</span>
        </div>

        <div className="header-badges">
          <div className="xp-badge">⚡ {lesson.xpReward} XP</div>
          <div className={`model-badge ${modelStatus === 'ready' ? 'ready' : 'error'}`}>
            {modelStatus === 'ready' ? '🤖 AI Ready' : '⚠️ Loading'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="learn-main">
        
        {/* INTRO STAGE */}
        {stage === 'intro' && (
          <motion.div 
            className="intro-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="intro-icon">🤟</div>
            <h1>{lesson.title}</h1>
            <p>{lesson.description}</p>

            <div className="intro-stats">
              <div className="stat">
                <span className="stat-value">{lesson.alphabets.length}</span>
                <span className="stat-label">Letters</span>
              </div>
              <div className="stat">
                <span className="stat-value">{lesson.xpReward}</span>
                <span className="stat-label">XP Reward</span>
              </div>
            </div>

            <div className="intro-letters">
              {lesson.alphabets.map(a => (
                <span key={a.id} className="intro-letter">{a.letter}</span>
              ))}
            </div>

            <div className={`model-status ${modelStatus}`}>
              {modelStatus === 'ready' ? (
                <>✅ AI Ready - Hand tracking enabled</>
              ) : modelStatus === 'unavailable' ? (
                <>⚠️ Start backend server</>
              ) : (
                <>🔄 Checking AI...</>
              )}
            </div>

            <button onClick={() => setStage('learn')} className="btn-start">
              Start Learning →
            </button>
          </motion.div>
        )}

        {/* LEARN STAGE */}
        {stage === 'learn' && currentAlphabet && (
          <div className="learn-screen">
            <div className="learn-grid">
              
              {/* Sign Card */}
              <motion.div 
                className="sign-card"
                key={currentIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="sign-header">
                  <div className="sign-letter-badge">{currentAlphabet.letter}</div>
                  <span className="sign-number">Letter {currentIndex + 1} of {lesson.alphabets.length}</span>
                  {learnedLetters.includes(currentAlphabet.letter) && (
                    <span className="learned-badge">✓ Learned</span>
                  )}
                </div>

                <div className="sign-image-box">
                  {!imageLoadError ? (
                    <>
                      <img
                        src={getImageUrl()}
                        alt={`Sign for ${currentAlphabet.letter}`}
                        className="sign-image"
                        onError={handleImageError}
                        onLoad={() => setImageLoadError(false)}
                      />
                      <div className="image-dots">
                        {currentAlphabet.images.slice(0, 3).map((_, idx) => (
                          <button
                            key={idx}
                            className={`dot ${imageIndex === idx ? 'active' : ''}`}
                            onClick={() => setImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="sign-placeholder">
                      <span className="placeholder-letter">{currentAlphabet.letter}</span>
                      <p>Reference Image</p>
                    </div>
                  )}
                </div>

                <div className="sign-info">
                  <h2>Learn Letter "{currentAlphabet.letter}"</h2>
                  <p>Copy the sign shown above, then practice with camera</p>
                </div>

                <div className="sign-buttons">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="btn-nav"
                  >
                    ← Prev
                  </button>
                  
                  {!showCamera ? (
                    <button 
                      onClick={handleStartPractice} 
                      className="btn-practice"
                    >
                      📷 Start Practice
                    </button>
                  ) : (
                    <button 
                      onClick={stopCamera} 
                      className="btn-stop-camera"
                    >
                      ⏹️ Stop Camera
                    </button>
                  )}
                  
                  <button onClick={handleNext} className="btn-nav btn-next">
                    Skip →
                  </button>
                </div>
              </motion.div>

              {/* Camera Section */}
              {showCamera && (
                <motion.div 
                  className="camera-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="camera-header">
                    <h3>🎯 Show "{currentAlphabet.letter}"</h3>
                    <button onClick={stopCamera} className="btn-close">✕</button>
                  </div>

                  {cameraError ? (
                    <div className="camera-error">
                      <p>⚠️ {cameraError}</p>
                      <button onClick={startCamera} className="btn-retry-camera">
                        🔄 Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Camera Container */}
                      <div className={`camera-container ${showSuccess ? 'success-glow' : isCorrect && holdProgress > 0 ? 'correct-glow' : ''}`}>
                        {/* Video - mirrored with CSS */}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="camera-video"
                        />
                        
                        {/* Hidden canvas for capture (NOT mirrored) */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        
                        {/* Overlay canvas for hand skeleton - mirrored with CSS to match video */}
                        <canvas 
                          ref={overlayCanvasRef} 
                          className="skeleton-overlay"
                        />

                        {/* Target Letter */}
                        <div className="camera-target-overlay">
                          <span className="target-label">Target:</span>
                          <span className="target-letter">{currentAlphabet.letter}</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`status-badge status-${statusInfo.color}`}>
                          {statusInfo.text}
                        </div>

                        {/* Confidence Badge */}
                        {stableConfidence > 0 && (
                          <div className="confidence-badge">
                            {Math.round(stableConfidence)}%
                          </div>
                        )}

                        {/* Hold Progress Circle */}
                        {detectionStatus === 'holding' && holdProgress > 0 && (
                          <div className="hold-progress-overlay">
                            <svg className="hold-circle" viewBox="0 0 100 100">
                              <circle className="hold-circle-bg" cx="50" cy="50" r="45" />
                              <circle
                                className="hold-circle-fill"
                                cx="50"
                                cy="50"
                                r="45"
                                style={{ strokeDasharray: `${holdProgress * 2.83} 283` }}
                              />
                            </svg>
                            <div className="hold-text">
                              <span className="hold-letter">{currentAlphabet.letter}</span>
                              <span className="hold-percent">{Math.round(holdProgress)}%</span>
                            </div>
                          </div>
                        )}

                        {/* Success Overlay */}
                        {showSuccess && (
                          <div className="success-overlay">
                            <div className="success-content">
                              <span className="success-icon">🎉</span>
                              <span className="success-text">Perfect!</span>
                              <span className="success-letter">"{currentAlphabet.letter}" Learned!</span>
                              {currentIndex < lesson.alphabets.length - 1 && (
                                <span className="success-next">Next: "{lesson.alphabets[currentIndex + 1].letter}"</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Loading */}
                        {!isStreaming && (
                          <div className="camera-loading">
                            <div className="spinner"></div>
                            <p>Starting camera...</p>
                          </div>
                        )}
                      </div>

                      {/* Detection Info Boxes */}
                      <div className="detection-info">
                        <div className={`info-box ${handDetected ? 'active' : ''}`}>
                          <span className="info-icon">{handDetected ? '✋' : '👋'}</span>
                          <span className="info-label">Hand</span>
                          <span className="info-value">{handDetected ? 'Detected' : 'Not Found'}</span>
                        </div>
                        
                        <div className={`info-box ${stablePrediction ? 'active' : ''}`}>
                          <span className="info-icon">🔤</span>
                          <span className="info-label">Detected</span>
                          <span className="info-value large">{stablePrediction || '—'}</span>
                        </div>
                        
                        <div className={`info-box ${isCorrect ? 'correct' : ''}`}>
                          <span className="info-icon">{isCorrect ? '✓' : '🎯'}</span>
                          <span className="info-label">Status</span>
                          <span className={`info-value ${isCorrect ? 'text-green' : ''}`}>
                            {isCorrect ? 'Correct!' : stablePrediction ? 'Try again' : 'Waiting'}
                          </span>
                        </div>
                        
                        <div className="info-box">
                          <span className="info-icon">📊</span>
                          <span className="info-label">Confidence</span>
                          <span className="info-value">{stableConfidence > 0 ? `${Math.round(stableConfidence)}%` : '—'}</span>
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill"
                              style={{ 
                                width: `${stableConfidence}%`,
                                backgroundColor: stableConfidence >= 70 ? '#10b981' : '#f59e0b'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="instructions-box">
                        <h4>📝 Steps to Complete:</h4>
                        <div className="steps">
                          <div className={`step ${handDetected ? 'done' : 'active'}`}>
                            <span className="step-num">1</span>
                            <span className="step-text">Show hand to camera</span>
                            {handDetected && <span className="step-check">✓</span>}
                          </div>
                          <div className={`step ${isCorrect ? 'done' : handDetected ? 'active' : ''}`}>
                            <span className="step-num">2</span>
                            <span className="step-text">Make sign for "{currentAlphabet.letter}"</span>
                            {isCorrect && <span className="step-check">✓</span>}
                          </div>
                          <div className={`step ${holdProgress >= 100 ? 'done' : isCorrect ? 'active' : ''}`}>
                            <span className="step-num">3</span>
                            <span className="step-text">Hold for 2 seconds</span>
                            {holdProgress > 0 && holdProgress < 100 && (
                              <span className="step-progress">{Math.round(holdProgress)}%</span>
                            )}
                            {holdProgress >= 100 && <span className="step-check">✓</span>}
                          </div>
                        </div>
                      </div>

                      {/* Stop Button */}
                      <button onClick={stopCamera} className="btn-stop-full">
                        ⏹️ Stop Camera
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Letter Navigation Bar */}
            <div className="letter-bar">
              {lesson.alphabets.map((alpha, i) => (
                <button
                  key={alpha.id}
                  onClick={() => {
                    // Clear landmarks when manually switching
                    landmarksRef.current = null;
                    clearOverlayCanvas();
                    pauseDetection();
                    setCurrentIndex(i);
                    if (showCamera && isStreaming) {
                      setTimeout(() => resumeDetection(), 300);
                    }
                  }}
                  className={`letter-btn ${i === currentIndex ? 'active' : ''} ${learnedLetters.includes(alpha.letter) ? 'learned' : ''}`}
                >
                  {alpha.letter}
                  {learnedLetters.includes(alpha.letter) && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETE STAGE */}
        {stage === 'complete' && (
          <motion.div 
            className="complete-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="complete-icon">🎉</div>
            <h1>Lesson Complete!</h1>
            <p>You've finished {lesson.title}</p>

            <div className="complete-stats">
              <div className="stat">
                <span className="stat-value">{lesson.alphabets.length}</span>
                <span className="stat-label">Letters</span>
              </div>
              <div className="stat">
                <span className="stat-value">{learnedLetters.length}</span>
                <span className="stat-label">Mastered</span>
              </div>
              <div className="stat">
                <span className="stat-value">{avgScore > 0 ? avgScore : '—'}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat">
                <span className="stat-value">+{lesson.xpReward}</span>
                <span className="stat-label">XP Earned</span>
              </div>
            </div>

            <div className="complete-letters">
              {lesson.alphabets.map(a => (
                <div 
                  key={a.id} 
                  className={`complete-letter ${learnedLetters.includes(a.letter) ? 'practiced' : ''}`}
                >
                  {a.letter}
                  {learnedLetters.includes(a.letter) && <span>✓</span>}
                </div>
              ))}
            </div>

            <div className="complete-buttons">
              <button 
                onClick={() => {
                  setCurrentIndex(0);
                  setScores([]);
                  setLearnedLetters([]);
                  setStage('learn');
                  setShowCamera(false);
                  fullReset();
                }}
                className="btn-retry-lesson"
              >
                🔄 Practice Again
              </button>
              <Link to="/dashboard" className="btn-home">
                🏠 Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Learn;