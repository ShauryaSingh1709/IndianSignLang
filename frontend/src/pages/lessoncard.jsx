import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DIFFICULTY_COLORS = {
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
};

const CATEGORY_ICONS = {
  alphabets: '🔤',
  numbers: '🔢',
  common_words: '💬',
  greetings: '👋',
  family: '👨‍👩‍👧‍👦',
  colors: '🎨',
  animals: '🐾',
  food: '🍎',
};

const LessonCard = ({ lesson }) => {
  const progress = lesson.user_progress;
  const isCompleted = progress?.status === 'completed';
  const isStarted = progress?.status === 'in_progress';
  const progressPercent = isCompleted ? 100 : isStarted ? 50 : 0;

  return (
    <Link to={`/learn/${lesson.id}`}>
      <motion.div
        whileHover={{ scale: 1.01, x: 4 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative overflow-hidden rounded-2xl p-5 
          border transition-all cursor-pointer
          ${isCompleted 
            ? 'bg-green-950/30 border-green-700' 
            : 'bg-gray-900 border-gray-800 hover:border-purple-600'}
        `}
      >
        {/* Completion indicator */}
        {isCompleted && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="text-4xl w-12 text-center">
            {CATEGORY_ICONS[lesson.category] || '📖'}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white">{lesson.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[lesson.difficulty]}`}>
                {lesson.difficulty}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-2 line-clamp-1">{lesson.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>👋 {lesson.total_signs} signs</span>
              <span>⚡ {lesson.xp_reward} XP</span>
              <span>⏱ {lesson.estimated_minutes}m</span>
            </div>
            
            {/* Progress bar */}
            {progressPercent > 0 && (
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default LessonCard;