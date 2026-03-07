import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheck, FiX, FiAward, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../components/Common/Navbar';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  
  const [quizState, setQuizState] = useState('select'); // 'select', 'playing', 'finished'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);

  const categories = [
    { id: 'alphabets', name: 'Alphabets', icon: '🔤', questions: 10, difficulty: 'Easy' },
    { id: 'numbers', name: 'Numbers', icon: '🔢', questions: 10, difficulty: 'Easy' },
    { id: 'greetings', name: 'Greetings', icon: '👋', questions: 8, difficulty: 'Medium' },
    { id: 'common', name: 'Common Words', icon: '💬', questions: 15, difficulty: 'Medium' },
    { id: 'phrases', name: 'Phrases', icon: '📝', questions: 10, difficulty: 'Hard' },
    { id: 'mixed', name: 'Mixed Quiz', icon: '🎯', questions: 20, difficulty: 'Hard' },
  ];

  const questions = [
    {
      id: 1,
      type: 'image-to-text',
      question: 'What sign is this?',
      signImage: '👋',
      options: ['Hello', 'Goodbye', 'Thank You', 'Please'],
      correct: 0,
    },
    {
      id: 2,
      type: 'image-to-text',
      question: 'Identify this sign:',
      signImage: '🙏',
      options: ['Sorry', 'Please', 'Thank You', 'Welcome'],
      correct: 2,
    },
    {
      id: 3,
      type: 'image-to-text',
      question: 'What does this sign mean?',
      signImage: '👍',
      options: ['Bad', 'Good/Yes', 'Maybe', 'No'],
      correct: 1,
    },
    {
      id: 4,
      type: 'text-to-image',
      question: 'Which sign represents "I Love You"?',
      options: ['🤙', '🤟', '✌️', '👌'],
      correct: 1,
    },
    {
      id: 5,
      type: 'image-to-text',
      question: 'What sign is shown here?',
      signImage: '✋',
      options: ['Stop', 'Hello', 'Five', 'Wait'],
      correct: 0,
    },
  ];

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizState === 'playing' && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Time's up, wrong answer
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizState, showResult]);

  const startQuiz = (category) => {
    setSelectedCategory(category);
    setQuizState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex) => {
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    
    setAnswers([...answers, {
      question: currentQuestion,
      selected: answerIndex,
      correct: questions[currentQuestion].correct,
      isCorrect,
    }]);

    if (isCorrect) {
      setScore(score + 10 + Math.floor(timeLeft / 3)); // Bonus for quick answers
      toast.success('Correct! 🎉');
    } else {
      toast.error('Wrong answer!');
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setShowResult(false);
      } else {
        setQuizState('finished');
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setQuizState('select');
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
  };

  const getGrade = () => {
    const percentage = (score / (questions.length * 15)) * 100;
    if (percentage >= 90) return { grade: 'A+', message: 'Outstanding!', color: '#4caf50' };
    if (percentage >= 80) return { grade: 'A', message: 'Excellent!', color: '#8bc34a' };
    if (percentage >= 70) return { grade: 'B', message: 'Good Job!', color: '#cddc39' };
    if (percentage >= 60) return { grade: 'C', message: 'Keep Practicing!', color: '#ffc107' };
    return { grade: 'D', message: 'Need More Practice', color: '#f44336' };
  };

  return (
    <div className="quiz-page">
      <Navbar />
      
      <div className="quiz-container">
        {/* Category Selection */}
        {quizState === 'select' && (
          <div className="category-selection">
            <h1>Choose Quiz Category</h1>
            <p className="subtitle">Test your ISL knowledge</p>
            
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => startQuiz(category)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <h3>{category.name}</h3>
                  <div className="category-meta">
                    <span>{category.questions} Questions</span>
                    <span className={`difficulty ${category.difficulty.toLowerCase()}`}>
                      {category.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Playing */}
        {quizState === 'playing' && (
          <div className="quiz-playing">
            {/* Progress Bar */}
            <div className="quiz-progress">
              <div className="progress-info">
                <span>Question {currentQuestion + 1}/{questions.length}</span>
                <span className="score-display">Score: {score}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Timer */}
            <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              <FiClock />
              <span>{timeLeft}s</span>
            </div>

            {/* Question Card */}
            <div className="question-card">
              <h2>{questions[currentQuestion].question}</h2>
              
              {questions[currentQuestion].signImage && (
                <div className="sign-display">
                  <span>{questions[currentQuestion].signImage}</span>
                </div>
              )}

              <div className="options-grid">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${
                      showResult
                        ? index === questions[currentQuestion].correct
                          ? 'correct'
                          : answers[currentQuestion]?.selected === index
                          ? 'wrong'
                          : ''
                        : ''
                    }`}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {showResult && index === questions[currentQuestion].correct && (
                      <FiCheck className="result-icon correct" />
                    )}
                    {showResult && answers[currentQuestion]?.selected === index && 
                      index !== questions[currentQuestion].correct && (
                      <FiX className="result-icon wrong" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Finished */}
        {quizState === 'finished' && (
          <div className="quiz-finished">
            <div className="result-card">
              <div className="result-icon-large" style={{ background: getGrade().color }}>
                <FiAward />
              </div>
              
              <h1>{getGrade().message}</h1>
              <div className="grade-display" style={{ color: getGrade().color }}>
                {getGrade().grade}
              </div>
              
              <div className="final-score">
                <h2>{score} Points</h2>
                <p>{answers.filter(a => a.isCorrect).length} / {questions.length} Correct</p>
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100)}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{score}</span>
                  <span className="stat-label">XP Earned</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-retry" onClick={restartQuiz}>
                  <FiRefreshCw /> Try Another Quiz
                </button>
                <button className="btn-continue" onClick={() => navigate('/dashboard')}>
                  <FiArrowRight /> Back to Dashboard
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="answer-review">
              <h3>Review Your Answers</h3>
              <div className="review-list">
                {answers.map((answer, index) => (
                  <div key={index} className={`review-item ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                    <span className="review-number">Q{index + 1}</span>
                    <span className="review-question">{questions[index].question}</span>
                    <span className="review-result">
                      {answer.isCorrect ? <FiCheck /> : <FiX />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;