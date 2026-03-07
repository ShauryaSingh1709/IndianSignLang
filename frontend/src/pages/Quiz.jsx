import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Common/Navbar';
import './Quiz.css';

// ISL Alphabet quiz questions — image-based (uses dataset images)
const ALL_QUESTIONS = [
  { id: 1,  question: 'Which letter does this ISL sign represent?', image: '/dataset/A/1.jpg', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'The closed fist with thumb to the side represents the letter A in ISL.' },
  { id: 2,  question: 'Which letter does this ISL sign represent?', image: '/dataset/B/1.jpg', options: ['B', 'C', 'D', 'E'], correct: 0, explanation: 'Four fingers extended upward with thumb folded represents B.' },
  { id: 3,  question: 'Which letter does this ISL sign represent?', image: '/dataset/C/1.jpg', options: ['A', 'C', 'G', 'O'], correct: 1, explanation: 'A curved hand forming a C shape represents the letter C.' },
  { id: 4,  question: 'Which letter does this ISL sign represent?', image: '/dataset/D/1.jpg', options: ['D', 'F', 'P', 'Q'], correct: 0, explanation: 'Index finger pointing up with other fingers curved represents D.' },
  { id: 5,  question: 'Which letter does this ISL sign represent?', image: '/dataset/E/1.jpg', options: ['A', 'E', 'S', 'N'], correct: 1, explanation: 'Fingers bent at the knuckles with thumb tucked represents E.' },
  { id: 6,  question: 'Which letter does this ISL sign represent?', image: '/dataset/F/1.jpg', options: ['F', 'G', 'H', 'I'], correct: 0, explanation: 'Index finger and thumb touching in a circle with other fingers up represents F.' },
  { id: 7,  question: 'Which letter does this ISL sign represent?', image: '/dataset/G/1.jpg', options: ['C', 'D', 'G', 'Q'], correct: 2, explanation: 'Index finger and thumb pointing sideways represents G.' },
  { id: 8,  question: 'Which letter does this ISL sign represent?', image: '/dataset/H/1.jpg', options: ['H', 'K', 'U', 'V'], correct: 0, explanation: 'Index and middle fingers extended horizontally represents H.' },
  { id: 9,  question: 'Which letter does this ISL sign represent?', image: '/dataset/I/1.jpg', options: ['A', 'I', 'J', 'Y'], correct: 1, explanation: 'Pinky finger extended upward represents I.' },
  { id: 10, question: 'Which letter does this ISL sign represent?', image: '/dataset/J/1.jpg', options: ['I', 'J', 'U', 'Z'], correct: 1, explanation: 'Pinky extended and traced in a J motion represents J.' },
  { id: 11, question: 'Which letter does this ISL sign represent?', image: '/dataset/K/1.jpg', options: ['K', 'P', 'U', 'V'], correct: 0, explanation: 'Index and middle fingers up with thumb between them represents K.' },
  { id: 12, question: 'Which letter does this ISL sign represent?', image: '/dataset/L/1.jpg', options: ['G', 'L', 'Q', 'Y'], correct: 1, explanation: 'Index finger up and thumb out forming an L shape represents L.' },
  { id: 13, question: 'Which letter does this ISL sign represent?', image: '/dataset/M/1.jpg', options: ['M', 'N', 'S', 'T'], correct: 0, explanation: 'Three fingers folded over the thumb represents M.' },
  { id: 14, question: 'Which letter does this ISL sign represent?', image: '/dataset/N/1.jpg', options: ['M', 'N', 'H', 'U'], correct: 1, explanation: 'Two fingers folded over the thumb represents N.' },
  { id: 15, question: 'Which letter does this ISL sign represent?', image: '/dataset/O/1.jpg', options: ['C', 'D', 'O', 'Q'], correct: 2, explanation: 'All fingers and thumb curved to form a circle represents O.' },
  { id: 16, question: 'Which letter does this ISL sign represent?', image: '/dataset/P/1.jpg', options: ['D', 'K', 'P', 'Q'], correct: 2, explanation: 'Index and middle fingers pointing down with thumb out represents P.' },
  { id: 17, question: 'Which letter does this ISL sign represent?', image: '/dataset/Q/1.jpg', options: ['G', 'O', 'P', 'Q'], correct: 3, explanation: 'Index finger and thumb pointing downward represents Q.' },
  { id: 18, question: 'Which letter does this ISL sign represent?', image: '/dataset/R/1.jpg', options: ['R', 'U', 'V', 'W'], correct: 0, explanation: 'Index and middle fingers crossed represents R.' },
  { id: 19, question: 'Which letter does this ISL sign represent?', image: '/dataset/S/1.jpg', options: ['A', 'E', 'M', 'S'], correct: 3, explanation: 'Fist with thumb over fingers represents S.' },
  { id: 20, question: 'Which letter does this ISL sign represent?', image: '/dataset/T/1.jpg', options: ['A', 'D', 'N', 'T'], correct: 3, explanation: 'Thumb between index and middle fingers represents T.' },
  { id: 21, question: 'Which letter does this ISL sign represent?', image: '/dataset/U/1.jpg', options: ['H', 'N', 'U', 'V'], correct: 2, explanation: 'Index and middle fingers extended together upward represents U.' },
  { id: 22, question: 'Which letter does this ISL sign represent?', image: '/dataset/V/1.jpg', options: ['K', 'U', 'V', 'W'], correct: 2, explanation: 'Index and middle fingers spread in a V shape represents V.' },
  { id: 23, question: 'Which letter does this ISL sign represent?', image: '/dataset/W/1.jpg', options: ['M', 'V', 'W', 'Y'], correct: 2, explanation: 'Three fingers spread out represents W.' },
  { id: 24, question: 'Which letter does this ISL sign represent?', image: '/dataset/X/1.jpg', options: ['D', 'G', 'X', 'Z'], correct: 2, explanation: 'Index finger bent in a hook shape represents X.' },
  { id: 25, question: 'Which letter does this ISL sign represent?', image: '/dataset/Y/1.jpg', options: ['A', 'I', 'L', 'Y'], correct: 3, explanation: 'Thumb and pinky extended outward represents Y.' },
  { id: 26, question: 'Which letter does this ISL sign represent?', image: '/dataset/Z/1.jpg', options: ['J', 'N', 'S', 'Z'], correct: 3, explanation: 'Index finger traces a Z shape in the air represents Z.' },
];

const QUIZ_MODES = [
  { id: 'quick',    label: 'Quick Quiz',    count: 5,  time: 20, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)',  desc: '5 questions, 20s each' },
  { id: 'standard', label: 'Standard Quiz', count: 10, time: 25, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)', desc: '10 questions, 25s each' },
  { id: 'full',     label: 'Full Alphabet', count: 26, time: 30, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)',  desc: 'All 26 letters, 30s each' },
  { id: 'speed',    label: 'Speed Round',   count: 10, time: 10, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)',   desc: '10 questions, 10s each' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const Quiz = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [stage, setStage] = useState('select'); // select | playing | finished
  const [mode, setMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [imageError, setImageError] = useState(false);

  const currentQ = questions[currentIdx];

  // Timer
  useEffect(() => {
    if (stage !== 'playing' || showFeedback) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, stage, showFeedback]);

  const startQuiz = (selectedMode) => {
    const pool = shuffle(ALL_QUESTIONS).slice(0, selectedMode.count);
    setMode(selectedMode);
    setQuestions(pool);
    setCurrentIdx(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setShowFeedback(false);
    setTimeLeft(selectedMode.time);
    setImageError(false);
    setStage('playing');
  };

  const handleAnswer = (answerIdx) => {
    if (showFeedback) return;
    clearTimeout(timerRef.current);

    const isCorrect = answerIdx === currentQ.correct;
    const timeBonus = isCorrect ? Math.floor(timeLeft / 3) : 0;
    const points = isCorrect ? 10 + timeBonus : 0;

    setSelected(answerIdx);
    setShowFeedback(true);
    setAnswers(prev => [...prev, { questionId: currentQ.id, selected: answerIdx, correct: currentQ.correct, isCorrect, points }]);
    if (isCorrect) {
      setScore(prev => prev + points);
      toast.success(`Correct! +${points} points`, { duration: 1200 });
    } else {
      toast.error(`Wrong! The answer was "${currentQ.options[currentQ.correct]}"`, { duration: 1500 });
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelected(null);
        setShowFeedback(false);
        setTimeLeft(mode.time);
        setImageError(false);
      } else {
        setStage('finished');
      }
    }, 1800);
  };

  const getGrade = () => {
    const maxScore = questions.length * 13;
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return { grade: 'A+', message: 'Outstanding!', color: '#10B981' };
    if (pct >= 80) return { grade: 'A',  message: 'Excellent!',   color: '#34D399' };
    if (pct >= 70) return { grade: 'B',  message: 'Great Job!',   color: '#A855F7' };
    if (pct >= 60) return { grade: 'C',  message: 'Good Effort!', color: '#F59E0B' };
    return              { grade: 'D',  message: 'Keep Practicing!', color: '#EF4444' };
  };

  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return (
    <div className="quiz-page">
      {/* Background */}
      <div className="quiz-bg">
        <div className="quiz-bg-main" />
        <div className="quiz-bg-c1" />
        <div className="quiz-bg-c2" />
        <div className="quiz-bg-pattern" />
      </div>

      <Navbar />

      <main className="quiz-main">

        {/* ── SELECT STAGE ── */}
        <AnimatePresence mode="wait">
          {stage === 'select' && (
            <motion.div
              key="select"
              className="quiz-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="quiz-select-header">
                <h1 className="quiz-title">ISL Alphabet Quiz</h1>
                <p className="quiz-subtitle">Test your knowledge of Indian Sign Language alphabets</p>
              </div>

              <div className="mode-grid">
                {QUIZ_MODES.map((m, i) => (
                  <motion.button
                    key={m.id}
                    className="mode-card"
                    style={{ '--mode-color': m.color, '--mode-bg': m.bg }}
                    onClick={() => startQuiz(m)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -6, boxShadow: `0 16px 40px ${m.color}25` }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="mode-icon-wrapper" style={{ background: m.bg }}>
                      <span className="mode-count" style={{ color: m.color }}>{m.count}</span>
                      <span className="mode-count-label" style={{ color: m.color }}>Q</span>
                    </div>
                    <h3 className="mode-name">{m.label}</h3>
                    <p className="mode-desc">{m.desc}</p>
                    <div className="mode-start-btn" style={{ background: m.color }}>Start</div>
                  </motion.button>
                ))}
              </div>

              <div className="quiz-info-row">
                <div className="quiz-info-chip">Questions use real ISL dataset images</div>
                <div className="quiz-info-chip">Earn bonus points for fast answers</div>
                <div className="quiz-info-chip">All 26 ISL alphabets covered</div>
              </div>
            </motion.div>
          )}

          {/* ── PLAYING STAGE ── */}
          {stage === 'playing' && currentQ && (
            <motion.div
              key="playing"
              className="quiz-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top bar */}
              <div className="quiz-topbar">
                <div className="quiz-progress-info">
                  <span className="q-counter">{currentIdx + 1} / {questions.length}</span>
                  <div className="quiz-progress-bar">
                    <motion.div
                      className="quiz-progress-fill"
                      animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                <div className={`quiz-timer ${timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warning' : ''}`}>
                  <svg viewBox="0 0 36 36" className="timer-ring">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#A855F7'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(timeLeft / mode.time) * 94.2} 94.2`}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 1s linear' }}
                    />
                  </svg>
                  <span className="timer-num">{timeLeft}</span>
                </div>

                <div className="quiz-score-chip">
                  <span className="score-val">{score}</span>
                  <span className="score-lbl">pts</span>
                </div>
              </div>

              {/* Question Card */}
              <motion.div
                key={currentIdx}
                className="question-card"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="question-text">{currentQ.question}</p>

                {/* Sign Image */}
                <div className="sign-image-box">
                  {!imageError ? (
                    <img
                      src={currentQ.image}
                      alt="ISL sign"
                      className="sign-image"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="sign-image-fallback">
                      <span className="fallback-letter">{currentQ.options[currentQ.correct]}</span>
                      <p>Reference image</p>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="options-grid">
                  {currentQ.options.map((opt, idx) => {
                    let state = 'default';
                    if (showFeedback) {
                      if (idx === currentQ.correct) state = 'correct';
                      else if (idx === selected) state = 'wrong';
                    } else if (selected === idx) {
                      state = 'selected';
                    }
                    return (
                      <motion.button
                        key={idx}
                        className={`option-btn option-${state}`}
                        onClick={() => !showFeedback && handleAnswer(idx)}
                        disabled={showFeedback}
                        whileHover={!showFeedback ? { scale: 1.02 } : {}}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                        <span className="option-text">{opt}</span>
                        {showFeedback && idx === currentQ.correct && <span className="option-icon">✓</span>}
                        {showFeedback && idx === selected && idx !== currentQ.correct && <span className="option-icon">✗</span>}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback explanation */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      className={`feedback-box ${selected === currentQ.correct ? 'feedback-correct' : 'feedback-wrong'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <strong>{selected === currentQ.correct ? 'Correct!' : 'Incorrect!'}</strong>
                      <span>{currentQ.explanation}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ── FINISHED STAGE ── */}
          {stage === 'finished' && (
            <motion.div
              key="finished"
              className="quiz-finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="result-card">
                <div className="result-grade" style={{ color: getGrade().color }}>
                  {getGrade().grade}
                </div>
                <h2 className="result-message">{getGrade().message}</h2>

                <div className="result-stats">
                  <div className="result-stat">
                    <span className="rs-value purple">{score}</span>
                    <span className="rs-label">Points</span>
                  </div>
                  <div className="result-stat">
                    <span className="rs-value green">{correctCount}/{questions.length}</span>
                    <span className="rs-label">Correct</span>
                  </div>
                  <div className="result-stat">
                    <span className="rs-value">{accuracy}%</span>
                    <span className="rs-label">Accuracy</span>
                  </div>
                </div>

                {/* Accuracy bar */}
                <div className="result-accuracy-bar">
                  <motion.div
                    className="result-accuracy-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ background: getGrade().color }}
                  />
                </div>

                <div className="result-actions">
                  <motion.button
                    className="btn-retry"
                    onClick={() => setStage('select')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Try Another Quiz
                  </motion.button>
                  <motion.button
                    className="btn-dashboard"
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back to Dashboard
                  </motion.button>
                </div>
              </div>

              {/* Answer Review */}
              <div className="answer-review">
                <h3 className="review-title">Answer Review</h3>
                <div className="review-list">
                  {answers.map((ans, i) => {
                    const q = questions[i];
                    return (
                      <div key={i} className={`review-row ${ans.isCorrect ? 'review-correct' : 'review-wrong'}`}>
                        <span className="review-num">Q{i + 1}</span>
                        <div className="review-img-wrapper">
                          <img src={q.image} alt="" className="review-img" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <div className="review-info">
                          <span className="review-your">Your answer: <strong>{q.options[ans.selected] ?? 'Timed out'}</strong></span>
                          {!ans.isCorrect && <span className="review-correct-ans">Correct: <strong>{q.options[q.correct]}</strong></span>}
                        </div>
                        <span className={`review-icon ${ans.isCorrect ? 'icon-correct' : 'icon-wrong'}`}>
                          {ans.isCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Quiz;
