# fix_all.ps1
$base = "C:\Users\ahira\Desktop\ISL PLAT\frontend\src"

# Create directories
@(
    "components/Common",
    "components/Dashboard", 
    "components/Auth",
    "components/Learn",
    "components/Practice",
    "api",
    "styles"
) | ForEach-Object { New-Item -ItemType Directory -Force -Path "$base/$_" | Out-Null }

# Fix file names (case sensitive)
if (Test-Path "$base/store/slices/progressslice.js") {
    Rename-Item "$base/store/slices/progressslice.js" "progressSlice.js" -Force
}

if (Test-Path "$base/components/Practice/practice") {
    Remove-Item "$base/components/Practice/practice" -Force -ErrorAction SilentlyContinue
}

# ===== CREATE FILES =====

# styles/global.css
@"
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: #f5f7fa; }
"@ | Out-File "$base/styles/global.css" -Encoding utf8

# components/Common/LoadingScreen.jsx
@"
import React from 'react';
const LoadingScreen = () => (
  <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
    <p style={{color:'white',fontSize:'18px'}}>Loading...</p>
  </div>
);
export default LoadingScreen;
"@ | Out-File "$base/components/Common/LoadingScreen.jsx" -Encoding utf8

# components/Common/Navbar.jsx
@"
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <nav style={{background:'white',padding:'15px 30px',display:'flex',justifyContent:'space-between',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
      <Link to="/dashboard" style={{fontSize:'24px',fontWeight:'700',color:'#667eea',textDecoration:'none'}}>🤟 ISL Learn</Link>
      <div style={{display:'flex',gap:'15px'}}>
        <Link to="/dashboard" style={{padding:'10px 20px',textDecoration:'none',color:'#333'}}>Dashboard</Link>
        <Link to="/learn" style={{padding:'10px 20px',textDecoration:'none',color:'#333'}}>Learn</Link>
        <Link to="/practice" style={{padding:'10px 20px',textDecoration:'none',color:'#333'}}>Practice</Link>
        <Link to="/quiz/1" style={{padding:'10px 20px',textDecoration:'none',color:'#333'}}>Quiz</Link>
        <Link to="/leaderboard" style={{padding:'10px 20px',textDecoration:'none',color:'#333'}}>Leaderboard</Link>
        <button onClick={() => { dispatch(logout()); navigate('/login'); }} style={{padding:'10px 20px',background:'#f44336',color:'white',borderRadius:'8px',fontWeight:'600'}}>Logout</button>
      </div>
    </nav>
  );
};
export default Navbar;
"@ | Out-File "$base/components/Common/Navbar.jsx" -Encoding utf8

# components/Dashboard files
@"
import React from 'react';
const StreakCalendar = () => <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>🔥 Streak Calendar</h3><p style={{fontSize:'32px',fontWeight:'700',color:'#667eea'}}>7 Days</p></div>;
export default StreakCalendar;
"@ | Out-File "$base/components/Dashboard/StreakCalendar.jsx" -Encoding utf8

@"
import React from 'react';
const LessonCard = ({ lesson = {} }) => <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>{lesson.title || 'Lesson'}</h3><p>{lesson.description || 'Learn new signs'}</p></div>;
export default LessonCard;
"@ | Out-File "$base/components/Dashboard/LessonCard.jsx" -Encoding utf8

@"
import React from 'react';
const XPProgress = ({ xp = 2500 }) => {
  const level = Math.floor(xp / 1000) + 1;
  return <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>Level {level}</h3><p style={{fontSize:'28px',fontWeight:'700',color:'#667eea'}}>{xp} XP</p></div>;
};
export default XPProgress;
"@ | Out-File "$base/components/Dashboard/XPProgress.jsx" -Encoding utf8

@"
import React from 'react';
const AchievementBadge = () => <div style={{background:'#ffd700',padding:'15px',borderRadius:'12px',textAlign:'center'}}>🏆 Achievement</div>;
export default AchievementBadge;
"@ | Out-File "$base/components/Dashboard/AchievementBadge.jsx" -Encoding utf8

@"
import React from 'react';
const DailyGoal = () => <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>🎯 Daily Goal</h3><p>Complete 5 lessons today</p></div>;
export default DailyGoal;
"@ | Out-File "$base/components/Dashboard/DailyGoal.jsx" -Encoding utf8

# components/Learn files
@"
import React from 'react';
const SignCard = ({ sign = {} }) => (
  <div style={{background:'white',padding:'30px',borderRadius:'16px',textAlign:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
    <div style={{fontSize:'80px',marginBottom:'20px'}}>{sign.image || '👋'}</div>
    <h2>{sign.name || 'Hello'}</h2>
    <p style={{color:'#667eea',fontSize:'20px'}}>{sign.hindi || 'नमस्ते'}</p>
  </div>
);
export default SignCard;
"@ | Out-File "$base/components/Learn/SignCard.jsx" -Encoding utf8

@"
import React from 'react';
import { Link } from 'react-router-dom';
const LessonComplete = ({ xp = 50 }) => (
  <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
    <div style={{background:'white',padding:'50px',borderRadius:'20px',textAlign:'center'}}>
      <h1>🎉 Complete!</h1>
      <p style={{fontSize:'24px',color:'#667eea',fontWeight:'700'}}>+{xp} XP</p>
      <Link to="/dashboard" style={{display:'inline-block',marginTop:'20px',padding:'15px 30px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',borderRadius:'10px',textDecoration:'none',fontWeight:'600'}}>Continue</Link>
    </div>
  </div>
);
export default LessonComplete;
"@ | Out-File "$base/components/Learn/LessonComplete.jsx" -Encoding utf8

# components/Practice/WebcamPractice.jsx
@"
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
"@ | Out-File "$base/components/Practice/WebcamPractice.jsx" -Encoding utf8

# api/lessonAPI.js
@"
export const lessonAPI = {
  getAllLessons: async () => [
    { id: 1, title: 'Alphabets', icon: '🔤', description: 'Learn A-Z', progress: 60 },
    { id: 2, title: 'Numbers', icon: '🔢', description: 'Learn 0-9', progress: 30 },
  ],
  getLessonById: async (id) => ({ id, title: 'Lesson ' + id, signs: [] }),
};
"@ | Out-File "$base/api/lessonAPI.js" -Encoding utf8

# api/predictionAPI.js
@"
export const predictionAPI = {
  predictSign: async () => ({ sign: 'Hello', confidence: 0.95 }),
};
"@ | Out-File "$base/api/predictionAPI.js" -Encoding utf8

Write-Host "All files created successfully!" -ForegroundColor Green