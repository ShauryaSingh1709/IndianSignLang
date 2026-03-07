import React from 'react';
const XPProgress = ({ xp = 2500 }) => {
  const level = Math.floor(xp / 1000) + 1;
  return <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>Level {level}</h3><p style={{fontSize:'28px',fontWeight:'700',color:'#667eea'}}>{xp} XP</p></div>;
};
export default XPProgress;
