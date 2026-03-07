import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

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
