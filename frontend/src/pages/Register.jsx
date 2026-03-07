 import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { validateEmail, validatePassword, validateUsername, getPasswordStrength } from '../utils/validators';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!validateUsername(formData.username)) {
      toast.error('Username must be 3-20 characters (letters, numbers, underscore only)');
      return false;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and number');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    await dispatch(registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
    })).unwrap();
    
    toast.success('Registration successful! Please login.');
    navigate('/login');
  } catch (err) {
    toast.error(err?.message || 'Registration failed');
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/" className="back-home">← Back to Home</Link>
          <h1>Create Account</h1>
          <p>Join thousands of ISL learners today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <FiUser /> Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div> 

          <div className="form-group">
             <label htmlFor="full_name">
               <FiUser /> Full Name
             </label>
             <input
               type="text"
               id="full_name"
               name="full_name"
               value={formData.full_name}
               onChange={handleChange}
               placeholder="Enter your full name"
               required
  />
           </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div 
                  className="strength-bar"
                  style={{ 
                    width: `${(passwordStrength.level === 'weak' ? 33 : passwordStrength.level === 'medium' ? 66 : 100)}%`,
                    backgroundColor: passwordStrength.color 
                  }}
                ></div>
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.level}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FiCheck /> Confirm Password
            </label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <label className="terms-checkbox">
            <input 
              type="checkbox" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span>
              I agree to the <Link to="/terms">Terms & Conditions</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-alternative">
          <p>Already have an account?</p>
          <Link to="/login" className="link-alternative">
            Sign In
          </Link>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Register;