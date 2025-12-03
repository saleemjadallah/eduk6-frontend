import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api/reportsAPI';
import './ProgressReportsPage.css';

// Subject icons mapping
const SUBJECT_ICONS = {
  MATH: '🔢',
  SCIENCE: '🔬',
  ENGLISH: '📖',
  HISTORY: '🏛️',
  GEOGRAPHY: '🌍',
  ART: '🎨',
  MUSIC: '🎵',
  TECHNOLOGY: '💻',
  OTHER: '📚',
};

// Badge rarity colors
const RARITY_COLORS = {
  COMMON: '#78909c',
  UNCOMMON: '#66bb6a',
  RARE: '#42a5f5',
  EPIC: '#ab47bc',
  LEGENDARY: '#ffa726',
};

export default function ProgressReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [report, setReport] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch children list
  const fetchChildren = useCallback(async () => {
    try {
      const response = await reportsAPI.getChildren();
      if (response.success) {
        setChildren(response.data);
        if (response.data.length > 0 && !selectedChildId) {
          setSelectedChildId(response.data[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load children');
    }
  }, [selectedChildId]);

  // Fetch report for selected child
  const fetchReport = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await reportsAPI.getReport(selectedChildId, period);
      if (response.success) {
        setReport(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId, period]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (selectedChildId) {
      fetchReport();
    }
  }, [selectedChildId, period, fetchReport]);

  const handleExport = async () => {
    if (!selectedChildId) return;
    try {
      setExporting(true);
      const response = await reportsAPI.exportReport(selectedChildId);
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-report-${report?.child?.displayName || 'child'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate XP progress to next level
  const getXpProgress = () => {
    if (!report?.overview) return { current: 0, needed: 100, percent: 0 };
    const currentXP = report.overview.currentXP;
    const level = report.overview.level;
    const xpPerLevel = 100 * level; // Simple progression
    const percent = Math.min(100, Math.round((currentXP / xpPerLevel) * 100));
    return { current: currentXP, needed: xpPerLevel, percent };
  };

  // Get max value for activity chart
  const getChartMax = () => {
    if (!report?.activityChart) return 5;
    const max = Math.max(...report.activityChart.map(d => d.lessons), 1);
    return Math.ceil(max / 5) * 5 || 5;
  };

  if (loading && !report) {
    return (
      <div className="reports-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading progress report...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1>Progress Reports</h1>
          <p>Track your children's learning journey</p>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Children Found</h3>
          <p>Add a child profile to start tracking their progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Progress Reports</h1>
          <p>Track your children's learning journey</p>
        </div>
        <button
          className="btn-secondary export-btn"
          onClick={handleExport}
          disabled={exporting || !report}
        >
          {exporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>

      {/* Controls */}
      <div className="report-controls">
        <div className="control-group">
          <label>Child</label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Period</label>
          <div className="period-tabs">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '3 Months' },
              { value: 'all', label: 'All Time' },
            ].map(p => (
              <button
                key={p.value}
                className={`period-tab ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>!</span>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner small"></div>
        </div>
      ) : report ? (
        <div className="report-content">
          {/* Overview Stats */}
          <section className="stats-grid">
            <div className="stat-card level-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <span className="stat-label">Level</span>
                <span className="stat-value">{report.overview.level}</span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{ width: `${getXpProgress().percent}%` }}
                ></div>
              </div>
              <span className="xp-text">
                {getXpProgress().current} / {getXpProgress().needed} XP
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <span className="stat-label">Lessons Completed</span>
                <span className="stat-value">{report.overview.lessonsCompleted}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💡</div>
              <div className="stat-info">
                <span className="stat-label">Questions Answered</span>
                <span className="stat-value">{report.overview.questionsAnswered}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-label">Total XP</span>
                <span className="stat-value">{report.overview.totalXP.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <span className="stat-label">Study Time</span>
                <span className="stat-value">{report.overview.totalStudyTime}</span>
              </div>
            </div>

            <div className="stat-card streak-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <span className="stat-label">Current Streak</span>
                <span className="stat-value">{report.streak.current} days</span>
              </div>
              <span className="streak-best">Best: {report.streak.longest} days</span>
            </div>
          </section>

          {/* Period Stats */}
          <section className="section-card period-summary">
            <h2>
              {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : period === '90d' ? 'Last 3 Months' : 'All Time'}
            </h2>
            <div className="period-stats">
              <div className="period-stat">
                <span className="period-value">{report.periodStats.lessonsStarted}</span>
                <span className="period-label">Lessons Started</span>
              </div>
              <div className="period-stat">
                <span className="period-value">{report.periodStats.lessonsCompleted}</span>
                <span className="period-label">Lessons Completed</span>
              </div>
              <div className="period-stat">
                <span className="period-value">{report.periodStats.avgCompletion}%</span>
                <span className="period-label">Avg. Completion</span>
              </div>
            </div>
          </section>

          {/* Activity Chart */}
          {report.activityChart && report.activityChart.length > 0 && (
            <section className="section-card">
              <h2>Daily Activity</h2>
              <div className="activity-chart">
                <div className="chart-y-axis">
                  {[getChartMax(), Math.round(getChartMax() / 2), 0].map(val => (
                    <span key={val}>{val}</span>
                  ))}
                </div>
                <div className="chart-bars">
                  {report.activityChart.map((day, idx) => (
                    <div key={idx} className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${(day.lessons / getChartMax()) * 100}%`,
                        }}
                        title={`${day.lessons} lessons on ${formatDate(day.date)}`}
                      ></div>
                      <span className="chart-label">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="chart-legend">Lessons per day</p>
            </section>
          )}

          {/* Subject Breakdown */}
          {report.subjectBreakdown && report.subjectBreakdown.length > 0 && (
            <section className="section-card">
              <h2>Subject Breakdown</h2>
              <div className="subject-list">
                {report.subjectBreakdown.map((subject, idx) => {
                  const total = report.subjectBreakdown.reduce((sum, s) => sum + s.count, 0);
                  const percent = Math.round((subject.count / total) * 100);
                  return (
                    <div key={idx} className="subject-item">
                      <div className="subject-header">
                        <span className="subject-icon">
                          {SUBJECT_ICONS[subject.subject] || '📚'}
                        </span>
                        <span className="subject-name">{subject.subject || 'Other'}</span>
                        <span className="subject-count">{subject.count} lessons</span>
                      </div>
                      <div className="subject-bar">
                        <div
                          className="subject-fill"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="two-column">
            {/* Recent Lessons */}
            <section className="section-card">
              <h2>Recent Lessons</h2>
              {report.recentLessons && report.recentLessons.length > 0 ? (
                <div className="lessons-list">
                  {report.recentLessons.map(lesson => (
                    <div key={lesson.id} className="lesson-item">
                      <div className="lesson-icon">
                        {SUBJECT_ICONS[lesson.subject] || '📚'}
                      </div>
                      <div className="lesson-info">
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-date">
                          {formatDate(lesson.lastAccessedAt || lesson.createdAt)}
                        </span>
                      </div>
                      <div className="lesson-progress">
                        <div className="progress-ring">
                          <svg viewBox="0 0 36 36">
                            <path
                              className="progress-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="progress-fill"
                              strokeDasharray={`${lesson.percentComplete || 0}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="progress-text">
                            {lesson.percentComplete || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-list">No lessons in this period</p>
              )}
            </section>

            {/* Recent Badges */}
            <section className="section-card">
              <h2>Recent Achievements</h2>
              {report.recentBadges && report.recentBadges.length > 0 ? (
                <div className="badges-list">
                  {report.recentBadges.map(badge => (
                    <div key={badge.id} className="badge-item">
                      <div
                        className="badge-icon"
                        style={{ borderColor: RARITY_COLORS[badge.rarity] || '#78909c' }}
                      >
                        {badge.icon}
                      </div>
                      <div className="badge-info">
                        <span className="badge-name">{badge.name}</span>
                        <span className="badge-desc">{badge.description}</span>
                        <span className="badge-date">{formatDate(badge.earnedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-list">No badges earned in this period</p>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
