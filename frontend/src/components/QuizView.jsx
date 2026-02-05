import React, { useState, useEffect } from 'react';
import { getQuestionsByChapter, regenerateQuestion } from '../services/api';

const QuizView = ({ chapterId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = true);
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

  const handleAnswerSelect = async (answer) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentQuestionIndex].correct_answer;

    if (!isCorrect) {
      try {
        const response = await regenerateQuestion(chapterId);
        const newQuestion = response.data;
        
        // Insert the new question at a random position after the current one
        const remainingQuestions = questions.slice(currentQuestionIndex + 1);
        const randomIndex = Math.floor(Math.random() * (remainingQuestions.length + 1));
        const newQuestions = [
          ...questions.slice(0, currentQuestionIndex + 1),
          ...remainingQuestions.slice(0, randomIndex),
          newQuestion,
          ...remainingQuestions.slice(randomIndex)
        ];
        setQuestions(newQuestions);

      } catch (err) {
        console.error("Failed to regenerate question:", err);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (questions.length === 0) {
    return <p>No questions found for this chapter.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  // The options are stored as a JSON string, so we need to parse them
  const options = JSON.parse(currentQuestion.options);

  const getButtonClassName = (option) => {
    if (!showResult) return '';
    if (option === currentQuestion.correct_answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return '';
  };

  return (
    <div>
      <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
      <p>{currentQuestion.question_text}</p>
      <ul>
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

      <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1 || !showResult}>
        Next Question
      </button>
    </div>
  );
};

export default QuizView;
