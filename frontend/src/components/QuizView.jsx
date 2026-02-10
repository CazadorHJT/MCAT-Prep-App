import React, { useState, useEffect } from 'react';
import { getQuestionsByChapter } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { recordAnswer } from '../services/progressService';

const QuizView = ({ chapterId }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestionsByChapter(chapterId);
        setQuestions(response.data);
      } catch (err) {
        setError('Failed to fetch questions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [chapterId]);

  const handleAnswerSelect = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    // correct_answer is just the letter (e.g., "C"), but answer is the full option string (e.g., "C. Some text")
    const isCorrect = answer.startsWith(currentQuestion.correct_answer + ".");

    setSelectedAnswer(answer);
    setShowResult(true);

    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Record progress (fire-and-forget)
    if (user) {
      const conceptTags = currentQuestion.concept_tags || [];
      recordAnswer(user.id, currentQuestion.id, isCorrect, conceptTags);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz questions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <p>No questions found for this chapter.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion.options;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getButtonClassName = (option) => {
    if (!showResult) return 'option-button';
    // correct_answer is just the letter (e.g., "C"), but option is the full string
    if (option.startsWith(currentQuestion.correct_answer + ".")) return 'option-button correct';
    if (option === selectedAnswer) return 'option-button incorrect';
    return 'option-button';
  };

  // Check if quiz is complete
  if (showResult && isLastQuestion) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((sessionStats.correct / totalAnswered) * 100) : 0;

    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <h3>Quiz Complete!</h3>
          <p>You've finished all {questions.length} questions in this chapter.</p>
        </div>

        <div className="session-stats">
          <h4>Session Results</h4>
          <div className="session-stats-grid">
            <div className="session-stat">
              <span className="session-stat-value correct">{sessionStats.correct}</span>
              <span className="session-stat-label">Correct</span>
            </div>
            <div className="session-stat">
              <span className="session-stat-value incorrect">{sessionStats.incorrect}</span>
              <span className="session-stat-label">Incorrect</span>
            </div>
            <div className="session-stat">
              <span className="session-stat-value">{accuracy}%</span>
              <span className="session-stat-label">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Show last question's explanation */}
        <div className="explanation">
          <h4>Explanation</h4>
          <p>{currentQuestion.explanation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span className="progress-text">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="question-card">
        <p className="question-text">{currentQuestion.question_text}</p>
      </div>

      <ul className="options-list">
        {options.map((option, index) => (
          <li key={index}>
            <button
              onClick={() => handleAnswerSelect(option)}
              className={getButtonClassName(option)}
              disabled={showResult}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      {showResult && (
        <div className="explanation">
          <h4>Explanation</h4>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      {showResult && !isLastQuestion && (
        <button
          className="primary-button"
          onClick={handleNextQuestion}
        >
          Next Question
        </button>
      )}
    </div>
  );
};

export default QuizView;
