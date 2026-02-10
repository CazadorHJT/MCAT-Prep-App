import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgressStats, getConceptMastery } from '../services/progressService';

const ProgressDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [conceptMastery, setConceptMastery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      const [statsData, masteryData] = await Promise.all([
        getProgressStats(user.id),
        getConceptMastery(user.id),
      ]);

      setStats(statsData);
      setConceptMastery(masteryData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getMasteryColor = (percentage) => {
    if (percentage >= 80) return 'var(--color-success)';
    if (percentage >= 50) return 'var(--color-primary)';
    return 'var(--color-accent)';
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

      {conceptMastery.length > 0 && (
        <div className="mastery-section">
          <h3>Concept Mastery</h3>
          <div className="mastery-list">
            {conceptMastery.map((item) => (
              <div key={item.concept} className="mastery-item">
                <div className="mastery-header">
                  <span className="mastery-concept">{item.concept}</span>
                  <span className="mastery-percentage">{Math.round(item.mastery_percentage)}%</span>
                </div>
                <div className="mastery-bar-container">
                  <div
                    className="mastery-bar"
                    style={{
                      width: `${item.mastery_percentage}%`,
                      backgroundColor: getMasteryColor(item.mastery_percentage),
                    }}
                  />
                </div>
                <div className="mastery-details">
                  {item.correct_attempts} / {item.total_attempts} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conceptMastery.length === 0 && (
        <div className="empty-state">
          <p>Start answering questions to track your concept mastery!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
