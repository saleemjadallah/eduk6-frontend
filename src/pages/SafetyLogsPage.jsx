import React, { useState, useEffect, useCallback } from 'react';
import { safetyAPI } from '../services/api/safetyAPI';
import { useAuth } from '../context/AuthContext';
import IncidentDetailModal from '../components/Safety/IncidentDetailModal';
import './SafetyLogsPage.css';

// Incident type icons and labels
const INCIDENT_TYPES = {
  PROFANITY: { icon: '🤬', label: 'Profanity' },
  PII_DETECTED: { icon: '🔐', label: 'Personal Info' },
  INAPPROPRIATE_TOPIC: { icon: '⚠️', label: 'Inappropriate Topic' },
  JAILBREAK_ATTEMPT: { icon: '🚫', label: 'Jailbreak Attempt' },
  HARMFUL_CONTENT: { icon: '☠️', label: 'Harmful Content' },
  BLOCKED_BY_GEMINI: { icon: '🛡️', label: 'Blocked by AI' },
  PARENT_OVERRIDE: { icon: '👤', label: 'Parent Override' },
};

// Severity config
const SEVERITY_CONFIG = {
  LOW: { label: 'Low', className: 'severity-low' },
  MEDIUM: { label: 'Medium', className: 'severity-medium' },
  HIGH: { label: 'High', className: 'severity-high' },
  CRITICAL: { label: 'Critical', className: 'severity-critical' },
};

// Format relative time
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const SafetyLogsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    childId: '',
    severity: '',
    incidentType: '',
    reviewed: '',
  });

  // Get children for filter dropdown
  let children = [];
  try {
    const authContext = useAuth();
    children = authContext?.user?.children || [];
  } catch (e) {
    // AuthProvider not available
  }

  // Fetch data
  const fetchData = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both incidents and summary in parallel
      const [incidentsResponse, summaryResponse] = await Promise.all([
        safetyAPI.getIncidents({ ...filters, page, limit: pagination.limit }),
        safetyAPI.getSummary(),
      ]);

      if (incidentsResponse.success) {
        setIncidents(incidentsResponse.data.incidents);
        setPagination(incidentsResponse.data.pagination);
      }

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    } catch (err) {
      console.error('Safety logs fetch error:', err);
      setError(err.message || 'Failed to load safety logs');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  // Handle incident click
  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  // Handle mark as reviewed
  const handleMarkReviewed = async (incidentId, action) => {
    try {
      const response = await safetyAPI.markAsReviewed(incidentId, action);
      if (response.success) {
        // Update local state
        setIncidents(prev =>
          prev.map(inc =>
            inc.id === incidentId ? { ...inc, reviewed: true, parentAction: action } : inc
          )
        );
        // Update summary
        if (summary) {
          setSummary(prev => ({
            ...prev,
            unreviewedCount: Math.max(0, prev.unreviewedCount - 1),
          }));
        }
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error('Failed to mark as reviewed:', err);
    }
  };

  // Loading state
  if (isLoading && incidents.length === 0) {
    return (
      <div className="safety-logs-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading safety logs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && incidents.length === 0) {
    return (
      <div className="safety-logs-page">
        <div className="page-error">
          <p>Unable to load safety logs</p>
          <p className="error-message">{error}</p>
          <button onClick={() => fetchData()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Calculate trend direction
  const getTrendDirection = () => {
    if (!summary?.last7Days?.trend) return 'stable';
    const trend = summary.last7Days.trend;
    const recent = trend.slice(-3).reduce((a, b) => a + b, 0);
    const older = trend.slice(0, 3).reduce((a, b) => a + b, 0);
    if (recent > older) return 'up';
    if (recent < older) return 'down';
    return 'stable';
  };

  const trendDirection = getTrendDirection();
  const highCriticalCount = (summary?.bySeverity?.HIGH || 0) + (summary?.bySeverity?.CRITICAL || 0);

  return (
    <div className="safety-logs-page">
      {/* Page header */}
      <div className="page-header">
        <h1>Safety Logs</h1>
        <p>Monitor and review safety incidents across your children's learning sessions</p>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">🛡️</div>
          <div className="summary-info">
            <span className="summary-value">{summary?.totalIncidents || 0}</span>
            <span className="summary-label">Total Incidents</span>
          </div>
        </div>

        <div className={`summary-card ${highCriticalCount > 0 ? 'alert' : ''}`}>
          <div className="summary-icon">⚠️</div>
          <div className="summary-info">
            <span className="summary-value">{highCriticalCount}</span>
            <span className="summary-label">High / Critical</span>
          </div>
        </div>

        <div className={`summary-card ${(summary?.unreviewedCount || 0) > 0 ? 'pending' : ''}`}>
          <div className="summary-icon">👁️</div>
          <div className="summary-info">
            <span className="summary-value">{summary?.unreviewedCount || 0}</span>
            <span className="summary-label">Unreviewed</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            {trendDirection === 'up' ? '📈' : trendDirection === 'down' ? '📉' : '➡️'}
          </div>
          <div className="summary-info">
            <span className="summary-value">{summary?.last7Days?.total || 0}</span>
            <span className="summary-label">Last 7 Days</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Child</label>
          <select
            value={filters.childId}
            onChange={(e) => handleFilterChange('childId', e.target.value)}
          >
            <option value="">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.displayName}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Severity</label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.incidentType}
            onChange={(e) => handleFilterChange('incidentType', e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(INCIDENT_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.reviewed}
            onChange={(e) => handleFilterChange('reviewed', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="false">Unreviewed</option>
            <option value="true">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Incidents table */}
      {incidents.length > 0 ? (
        <>
          <div className="incidents-table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(incident => {
                  const typeConfig = INCIDENT_TYPES[incident.incidentType] || { icon: '❓', label: incident.incidentType };
                  const severityConfig = SEVERITY_CONFIG[incident.severity] || { label: incident.severity, className: '' };

                  return (
                    <tr
                      key={incident.id}
                      className={`incident-row ${!incident.reviewed ? 'unreviewed' : ''}`}
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <td className="child-cell">
                        <span className="child-avatar">{incident.childAvatar ? '🧒' : '🧒'}</span>
                        <span className="child-name">{incident.childName}</span>
                      </td>
                      <td className="type-cell">
                        <span className="type-icon">{typeConfig.icon}</span>
                        <span className="type-label">{typeConfig.label}</span>
                      </td>
                      <td>
                        <span className={`severity-badge ${severityConfig.className}`}>
                          {severityConfig.label}
                        </span>
                      </td>
                      <td className="time-cell">{formatTimeAgo(incident.createdAt)}</td>
                      <td>
                        {incident.reviewed ? (
                          <span className="status-badge reviewed">Reviewed</span>
                        ) : (
                          <span className="status-badge pending">Pending</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncidentClick(incident);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="page-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No Safety Incidents</h3>
          <p>Great news! There are no safety incidents to review.</p>
        </div>
      )}

      {/* Incident detail modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onMarkReviewed={handleMarkReviewed}
        />
      )}
    </div>
  );
};

export default SafetyLogsPage;
