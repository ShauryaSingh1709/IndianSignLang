export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LEARN: '/learn',
  PRACTICE: '/practice',
  QUIZ: '/quiz',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export const LESSON_CATEGORIES = {
  ALPHABETS: 'alphabets',
  NUMBERS: 'numbers',
  COMMON_WORDS: 'common_words',
  PHRASES: 'phrases',
};

export const XP_PER_LESSON = 50;
export const XP_PER_QUIZ = 100;
export const STREAK_BONUS_XP = 25;

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};