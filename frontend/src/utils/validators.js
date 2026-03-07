export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateUsername = (username) => {
  // 3-20 chars, alphanumeric and underscore only
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&#]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: '#ff4444' };
  if (strength <= 4) return { level: 'medium', color: '#ffa500' };
  return { level: 'strong', color: '#00cc00' };
};