import React, { useRef, useState } from 'react';
const WebcamPractice = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  return (
    <div style={{background:'#1a1a2e',padding:'20px',borderRadius:'16px'}}>
      <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',borderRadius:'12px',transform:'scaleX(-1)'}} />
      {!isStreaming && <button onClick={startCamera} style={{marginTop:'15px',padding:'12px 25px',background:'#667eea',color:'white',borderRadius:'8px',fontWeight:'600',width:'100%'}}>Start Camera</button>}
    </div>
  );
};
export default WebcamPractice;
