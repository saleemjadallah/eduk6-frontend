import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * ActiveUsersChart - DAU/WAU/MAU time series chart
 */
const ActiveUsersChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="chart-container loading">
        <div className="skeleton-chart" />
        <style>{`
          .chart-container {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            box-shadow: 4px 4px 0 0 #000;
            padding: 24px;
          }

          .chart-container.loading .skeleton-chart {
            height: 300px;
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!data || !data.dauSeries || data.dauSeries.length === 0) {
    return (
      <div className="chart-container empty">
        <h3>Daily Active Users</h3>
        <p>No activity data available yet.</p>
        <style>{`
          .chart-container.empty {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            color: #6b7280;
          }
          .chart-container.empty h3 {
            color: #ffffff;
            margin: 0 0 8px 0;
          }
        `}</style>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Transform data for the chart
  const chartData = data.dauSeries.map(d => ({
    date: formatDate(d.date),
    dau: d.count,
  }));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Daily Active Users (DAU)</h3>
        <div className="chart-stats">
          <span className="stat">
            <strong>Today: </strong>
            {chartData[chartData.length - 1]?.dau?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2d2d44' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#2d2d44' }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1a2e',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                color: '#ffffff',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value) => [value.toLocaleString(), 'DAU']}
            />
            <Area
              type="monotone"
              dataKey="dau"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#dauGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1a1a2e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement metrics */}
      {data.engagement && (
        <div className="engagement-metrics">
          <div className="metric">
            <span className="metric-value">{data.engagement.avgSessionDuration} min</span>
            <span className="metric-label">Avg Session</span>
          </div>
          <div className="metric">
            <span className="metric-value">{data.engagement.avgSessionsPerUser}</span>
            <span className="metric-label">Sessions/User</span>
          </div>
          <div className="metric">
            <span className="metric-value">{data.engagement.totalSessions?.toLocaleString()}</span>
            <span className="metric-label">Total Sessions</span>
          </div>
          <div className="metric">
            <span className="metric-value">{data.engagement.lessonsCompleted?.toLocaleString()}</span>
            <span className="metric-label">Lessons Done</span>
          </div>
        </div>
      )}

      <style>{`
        .chart-container {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          padding: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .chart-stats {
          display: flex;
          gap: 16px;
        }

        .chart-stats .stat {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .chart-stats .stat strong {
          color: #3b82f6;
        }

        .chart-wrapper {
          margin: 0 -10px;
        }

        .engagement-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #2d2d44;
        }

        .metric {
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .metric-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .engagement-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ActiveUsersChart;
