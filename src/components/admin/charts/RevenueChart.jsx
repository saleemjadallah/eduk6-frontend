import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

/**
 * RevenueChart - MRR trend and tier breakdown
 */
const RevenueChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="revenue-container loading">
        <div className="skeleton-chart" />
        <style>{`
          .revenue-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
          }

          .revenue-container.loading .skeleton-chart {
            height: 300px;
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
          }

          .revenue-container.loading .skeleton-chart::after {
            content: '';
            display: block;
            height: 100%;
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
            margin: 24px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  const { overview, breakdown, mrrSeries } = data || {};

  if (!overview) {
    return (
      <div className="revenue-card empty">
        <h3>Revenue</h3>
        <p>No revenue data available yet.</p>
        <style>{`
          .revenue-card.empty {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            color: #6b7280;
          }
          .revenue-card.empty h3 {
            color: #ffffff;
            margin: 0 0 8px 0;
          }
        `}</style>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tier colors
  const tierColors = {
    FAMILY: '#3b82f6',
    FAMILY_PLUS: '#8b5cf6',
    ANNUAL: '#22c55e',
  };

  // Format MRR series for chart
  const chartData = mrrSeries?.map(d => ({
    date: d.date,
    mrr: d.mrr,
  })) || [];

  return (
    <div className="revenue-container">
      {/* Main MRR Chart */}
      <div className="revenue-card">
        <div className="revenue-header">
          <div>
            <h3>Monthly Recurring Revenue</h3>
            <p className="revenue-subtitle">
              {overview.mrrGrowthPercent !== null && (
                <span className={overview.mrrGrowthPercent >= 0 ? 'positive' : 'negative'}>
                  {overview.mrrGrowthPercent >= 0 ? '+' : ''}{overview.mrrGrowthPercent}% vs last month
                </span>
              )}
            </p>
          </div>
          <div className="revenue-total">
            <span className="mrr-value">{formatCurrency(overview.mrr)}</span>
            <span className="mrr-label">Current MRR</span>
          </div>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2d2d44' }}
                tickFormatter={(value) => {
                  const date = new Date(value + '-01');
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2d2d44' }}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value) => [formatCurrency(value), 'MRR']}
                labelFormatter={(label) => {
                  const date = new Date(label + '-01');
                  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#22c55e', stroke: '#1a1a2e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="revenue-card breakdown">
        <h3>Revenue by Tier</h3>

        {breakdown?.byTier?.length > 0 ? (
          <>
            <div className="tier-list">
              {breakdown.byTier.map((tier) => (
                <div key={tier.tier} className="tier-item">
                  <div className="tier-info">
                    <span
                      className="tier-dot"
                      style={{ background: tierColors[tier.tier] || '#6b7280' }}
                    />
                    <span className="tier-name">{tier.tier.replace('_', ' ')}</span>
                  </div>
                  <div className="tier-values">
                    <span className="tier-mrr">{formatCurrency(tier.mrr)}</span>
                    <span className="tier-count">{tier.count} subscribers</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="breakdown-chart">
              <ResponsiveContainer width="100%" height={100}>
                <BarChart
                  data={breakdown.byTier}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="tier" hide />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {breakdown.byTier.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={tierColors[entry.tier] || '#6b7280'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="no-data">No paid subscribers yet</p>
        )}

        {/* ARR Highlight */}
        <div className="arr-highlight">
          <span className="arr-value">{formatCurrency(overview.arr)}</span>
          <span className="arr-label">Annual Run Rate (ARR)</span>
        </div>

        {/* Additional Metrics */}
        <div className="additional-metrics">
          <div className="add-metric">
            <span className="add-metric-value">{formatCurrency(overview.avgRevenuePerUser)}</span>
            <span className="add-metric-label">ARPU</span>
          </div>
          <div className="add-metric">
            <span className="add-metric-value">{formatCurrency(overview.ltv)}</span>
            <span className="add-metric-label">LTV</span>
          </div>
        </div>
      </div>

      <style>{`
        .revenue-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .revenue-card {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          padding: 24px;
        }

        .revenue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .revenue-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .revenue-subtitle {
          margin: 4px 0 0 0;
          font-size: 0.875rem;
        }

        .revenue-subtitle .positive {
          color: #22c55e;
        }

        .revenue-subtitle .negative {
          color: #ef4444;
        }

        .revenue-total {
          text-align: right;
        }

        .mrr-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #22c55e;
        }

        .mrr-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .chart-wrapper {
          margin: 0 -10px;
        }

        .revenue-card.breakdown h3 {
          margin: 0 0 20px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .tier-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tier-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tier-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tier-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .tier-name {
          font-size: 0.875rem;
          color: #ffffff;
          text-transform: capitalize;
        }

        .tier-values {
          text-align: right;
        }

        .tier-mrr {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
        }

        .tier-count {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .breakdown-chart {
          margin: 20px 0;
        }

        .arr-highlight {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin-top: 20px;
        }

        .arr-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #22c55e;
        }

        .arr-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .additional-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .add-metric {
          text-align: center;
          padding: 12px;
          background: #0f0f1a;
          border-radius: 8px;
        }

        .add-metric-value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
        }

        .add-metric-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .no-data {
          color: #6b7280;
          text-align: center;
          padding: 20px 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .revenue-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RevenueChart;
