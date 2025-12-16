import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * Format number with K/M suffix
 */
const formatNumber = (num, currency = false) => {
  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * KPICard - Individual metric card with sparkline
 */
const KPICard = ({ title, value, change, changeLabel, sparklineData, color = '#3b82f6', format, prefix }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {change !== undefined && (
          <span className="kpi-change" style={{ color: changeColor }}>
            {isPositive ? '+' : ''}{change}%
            {changeLabel && <span className="change-label"> {changeLabel}</span>}
          </span>
        )}
      </div>

      <div className="kpi-value">
        {prefix && <span className="kpi-prefix">{prefix}</span>}
        {format === 'currency' ? formatNumber(value, true) : formatNumber(value)}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="kpi-sparkline">
          <ResponsiveContainer width="100%" height={50}>
            <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sparkline-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#sparkline-${title.replace(/\s/g, '')})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        .kpi-card {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .kpi-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 #000;
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .change-label {
          font-weight: 400;
          opacity: 0.8;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .kpi-prefix {
          font-size: 1.25rem;
          opacity: 0.7;
          margin-right: 2px;
        }

        .kpi-sparkline {
          margin-top: 8px;
          height: 50px;
        }
      `}</style>
    </div>
  );
};

/**
 * KPICards - Grid of KPI metric cards
 */
const KPICards = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="kpi-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="kpi-card loading">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-sparkline" />
          </div>
        ))}
        <style>{`
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
          }

          .kpi-card.loading {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .skeleton {
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-title {
            width: 60%;
            height: 14px;
          }

          .skeleton-value {
            width: 40%;
            height: 32px;
          }

          .skeleton-sparkline {
            width: 100%;
            height: 50px;
            margin-top: 8px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!data) return null;

  // Build sparkline data from DAU series if available
  const dauSparkline = data.dauSeries?.map(d => ({ value: d.count })) || [];
  const mrrSparkline = data.mrrSeries?.map(d => ({ value: d.mrr })) || [];

  const cards = [
    {
      title: 'Total Parents',
      value: data.users?.totalParents || 0,
      change: data.growth?.newUsersThisWeek > 0 ? Math.round((data.growth.newUsersThisWeek / Math.max(1, data.users.totalParents - data.growth.newUsersThisWeek)) * 100) : 0,
      changeLabel: 'vs last week',
      color: '#3b82f6',
    },
    {
      title: 'Total Children',
      value: data.users?.totalChildren || 0,
      color: '#8b5cf6',
    },
    {
      title: 'Paying Subscribers',
      value: data.users?.payingSubscribers || 0,
      change: data.users?.conversionRate,
      changeLabel: 'conversion',
      color: '#22c55e',
    },
    {
      title: 'MRR',
      value: data.revenue?.mrr || 0,
      change: data.revenue?.mrrGrowthPercent,
      changeLabel: 'vs last month',
      format: 'currency',
      sparklineData: mrrSparkline,
      color: '#f59e0b',
    },
    {
      title: 'DAU/MAU Ratio',
      value: data.users?.dauMauRatio ? `${Math.round(data.users.dauMauRatio * 100)}%` : '0%',
      color: '#06b6d4',
    },
    {
      title: 'ARR',
      value: data.revenue?.arr || 0,
      format: 'currency',
      color: '#ec4899',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
      `}</style>
    </div>
  );
};

export default KPICards;
