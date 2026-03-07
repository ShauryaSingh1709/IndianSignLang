import React from 'react';
const SignCard = ({ sign = {} }) => (
  <div style={{background:'white',padding:'30px',borderRadius:'16px',textAlign:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
    <div style={{fontSize:'80px',marginBottom:'20px'}}>{sign.image || '👋'}</div>
    <h2>{sign.name || 'Hello'}</h2>
    <p style={{color:'#667eea',fontSize:'20px'}}>{sign.hindi || 'नमस्ते'}</p>
  </div>
);
export default SignCard;
