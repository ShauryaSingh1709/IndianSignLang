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
