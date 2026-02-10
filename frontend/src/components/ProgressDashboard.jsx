import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgressStats, getHierarchicalProgress } from '../services/progressService';

const ProgressDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [hierarchicalData, setHierarchicalData] = useState({ books: [] });
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      const [statsData, hierarchical] = await Promise.all([
        getProgressStats(user.id),
        getHierarchicalProgress(user.id),
      ]);

      setStats(statsData);
      setHierarchicalData(hierarchical);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const toggleBook = (bookId) => {
    setExpandedBooks(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const getMasteryColor = (percentage) => {
    if (percentage >= 80) return 'var(--color-success)';
    if (percentage >= 50) return 'var(--color-primary)';
    return 'var(--color-accent)';
  };

  const formatConceptName = (concept) => {
    // Convert kebab-case to Title Case
    return concept
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <button className="nav-button" onClick={onClose}>
          Back to Study
        </button>
        <div className="loading">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button className="nav-button" onClick={onClose}>
        Back to Study
      </button>

      <div className="section-title">
        <h2>Your Progress</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Questions Answered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.correct}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      {hierarchicalData.books.length > 0 ? (
        <div className="progress-hierarchy">
          <h3>Progress by Book</h3>

          {hierarchicalData.books.map(book => (
            <div key={book.id} className="book-progress">
              <button
                className="book-progress-header"
                onClick={() => toggleBook(book.id)}
              >
                <div className="book-progress-info">
                  <span className={`expand-icon ${expandedBooks.has(book.id) ? 'expanded' : ''}`}>
                    {expandedBooks.has(book.id) ? '−' : '+'}
                  </span>
                  <span className="book-progress-name">{book.name}</span>
                </div>
                <div className="book-progress-stats">
                  <span className="book-progress-accuracy">{book.accuracy}%</span>
                  <span className="book-progress-count">{book.correct}/{book.total}</span>
                </div>
              </button>

              <div className="book-progress-bar-container">
                <div
                  className="book-progress-bar"
                  style={{
                    width: `${book.accuracy}%`,
                    backgroundColor: getMasteryColor(book.accuracy)
                  }}
                />
              </div>

              {expandedBooks.has(book.id) && (
                <div className="chapters-list">
                  {book.chapters.map(chapter => (
                    <div key={chapter.id} className="chapter-progress">
                      <button
                        className="chapter-progress-header"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className="chapter-progress-info">
                          <span className={`expand-icon ${expandedChapters.has(chapter.id) ? 'expanded' : ''}`}>
                            {expandedChapters.has(chapter.id) ? '−' : '+'}
                          </span>
                          <span className="chapter-number">Ch. {chapter.chapter_number}</span>
                          <span className="chapter-progress-title">{chapter.title}</span>
                        </div>
                        <div className="chapter-progress-stats">
                          <span className="chapter-progress-accuracy">{chapter.accuracy}%</span>
                          <span className="chapter-progress-count">{chapter.correct}/{chapter.total}</span>
                        </div>
                      </button>

                      <div className="chapter-progress-bar-container">
                        <div
                          className="chapter-progress-bar"
                          style={{
                            width: `${chapter.accuracy}%`,
                            backgroundColor: getMasteryColor(chapter.accuracy)
                          }}
                        />
                      </div>

                      {expandedChapters.has(chapter.id) && chapter.concepts.length > 0 && (
                        <div className="concepts-list">
                          {chapter.concepts.map(concept => (
                            <div key={concept.concept} className="concept-item">
                              <div className="concept-header">
                                <span className="concept-name">{formatConceptName(concept.concept)}</span>
                                <span className="concept-percentage">{Math.round(concept.mastery_percentage)}%</span>
                              </div>
                              <div className="concept-bar-container">
                                <div
                                  className="concept-bar"
                                  style={{
                                    width: `${concept.mastery_percentage}%`,
                                    backgroundColor: getMasteryColor(concept.mastery_percentage),
                                  }}
                                />
                              </div>
                              <div className="concept-details">
                                {concept.correct_attempts} / {concept.total_attempts} correct
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {expandedChapters.has(chapter.id) && chapter.concepts.length === 0 && (
                        <div className="no-concepts">
                          No concept data available for this chapter yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Start answering questions to track your progress by book and chapter!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
