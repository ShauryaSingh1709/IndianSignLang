import { useEffect, useRef, useState, useCallback } from 'react';
import * as mp from '@mediapipe/hands';
import * as drawingUtils from '@mediapipe/drawing_utils';
import * as cam from '@mediapipe/camera_utils';

const PREDICTION_INTERVAL = 500; // ms between predictions

export const useHandDetection = ({
  onPrediction,
  expectedSign = null,
  isActive = true,
  onLandmarksDetected = null,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const wsRef = useRef(null);
  const lastPredictionTime = useRef(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [detectionState, setDetectionState] = useState({
    handDetected: false,
    landmarks: null,
    prediction: null,
    confidence: 0,
    feedback: '',
    isCorrect: false,
  });
  const [error, setError] = useState(null);

  // Initialize WebSocket for real-time prediction
  const initWebSocket = useCallback(() => {
    const userId = JSON.parse(localStorage.getItem('user'))?.id || 0;
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    
    wsRef.current = new WebSocket(`${wsUrl}/api/predict/ws/${userId}`);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('✅ WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'pong') {
        setDetectionState(prev => ({
          ...prev,
          handDetected: data.detected,
          prediction: data.predicted,
          confidence: data.confidence,
          feedback: data.feedback,
          isCorrect: data.is_correct,
        }));
        
        if (onPrediction) {
          onPrediction(data);
        }
      }
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
      // Reconnect after 3 seconds
      setTimeout(initWebSocket, 3000);
    };
    
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error. Please refresh.');
    };
  }, [onPrediction]);

  // Send frame to WebSocket
  const sendFrame = useCallback((canvas) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const now = Date.now();
    if (now - lastPredictionTime.current < PREDICTION_INTERVAL) return;
    lastPredictionTime.current = now;
    
    // Convert canvas to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.6);
    const base64 = imageData.split(',')[1];
    
    wsRef.current.send(JSON.stringify({
      type: 'frame',
      image: base64,
      expected_sign: expectedSign,
    }));
  }, [expectedSign]);

  // Draw landmarks on canvas
  const drawLandmarks = useCallback((landmarks, canvasCtx, canvasElement) => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (landmarks) {
      for (const handLandmarks of landmarks) {
        // Draw connections
        drawingUtils.drawConnectors(
          canvasCtx,
          handLandmarks,
          mp.HAND_CONNECTIONS,
          { color: '#00FF88', lineWidth: 3 }
        );
        
        // Draw landmarks
        drawingUtils.drawLandmarks(
          canvasCtx,
          handLandmarks,
          { 
            color: '#FF0066', 
            lineWidth: 2,
            radius: 5
          }
        );
      }
    }
    
    canvasCtx.restore();
  }, []);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (!isActive) return;

    const hands = new mp.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const canvasElement = canvasRef.current;
      const videoElement = videoRef.current;
      
      if (!canvasElement || !videoElement) return;
      
      const canvasCtx = canvasElement.getContext('2d');
      
      // Mirror video
      canvasCtx.save();
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);
      canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.restore();
      
      const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
      
      if (handDetected) {
        drawLandmarks(results.multiHandLandmarks, canvasCtx, canvasElement);
        
        if (onLandmarksDetected) {
          onLandmarksDetected(results.multiHandLandmarks);
        }
        
        // Send frame for prediction
        sendFrame(canvasElement);
      }
      
      setDetectionState(prev => ({
        ...prev,
        handDetected,
        landmarks: results.multiHandLandmarks || [],
      }));
    });

    handsRef.current = hands;

    // Start camera
    if (videoRef.current) {
      const camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      
      camera.start()
        .then(() => setIsLoading(false))
        .catch((err) => {
          setError('Camera access denied. Please allow camera permissions.');
          setIsLoading(false);
        });
      
      cameraRef.current = camera;
    }

    // Init WebSocket
    initWebSocket();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
      if (wsRef.current) wsRef.current.close();
    };
  }, [isActive]);

  return {
    videoRef,
    canvasRef,
    detectionState,
    isLoading,
    isConnected,
    error,
  };
};