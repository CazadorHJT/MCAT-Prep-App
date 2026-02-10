import React, { useState, useEffect } from 'react';
import { getQuestionsByChapter } from '../services/api';

const QuizView = ({ chapterId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    setSelectedAnswer(answer);
    setShowResult(true);
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
    if (option === currentQuestion.correct_answer) return 'option-button correct';
    if (option === selectedAnswer) return 'option-button incorrect';
    return 'option-button';
  };

  // Check if quiz is complete
  if (showResult && isLastQuestion) {
    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <h3>Quiz Complete!</h3>
          <p>You've finished all {questions.length} questions in this chapter.</p>
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
