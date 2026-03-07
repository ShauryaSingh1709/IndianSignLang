import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      
      setStream(mediaStream);
      setIsStreaming(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (error) {
      console.error('Camera access error:', error);
      throw error;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  return {
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    captureFrame,
  };
};