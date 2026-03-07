import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceMeter = ({ confidence, isCorrect }) => {
  const percentage = Math.round(confidence * 100);
  
  const getColor = () => {
    if (isCorrect && confidence > 0.8) return '#10B981'; // green
    if (confidence > 0.6) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="bg-black/70 rounded-xl p-3 backdrop-blur-sm">
      <p className="text-white text-xs mb-2 text-center">Confidence</p>
      
      {/* Circular progress */}
      <div className="relative w-16 h-16 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke="#374151"
            strokeWidth="3"
          />
          <motion.circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke={getColor()}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            transition={{ duration: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceMeter;