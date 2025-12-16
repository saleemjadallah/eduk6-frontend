import React from 'react';

/**
 * SubscriptionFunnel - Horizontal funnel visualization
 * Shows: Signup -> Active -> Trial -> Paid -> Retained
 */
const SubscriptionFunnel = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="funnel-container loading">
        <div className="funnel-stages">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="funnel-stage skeleton">
              <div className="skeleton-bar" style={{ width: `${100 - i * 15}%` }} />
            </div>
          ))}
        </div>
        <style>{`
          .funnel-container {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            box-shadow: 4px 4px 0 0 #000;
            padding: 24px;
          }

          .funnel-container.loading .funnel-stages {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .funnel-stage.skeleton {
            height: 40px;
          }

          .skeleton-bar {
            height: 100%;
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!data || !data.stages || data.stages.length === 0) {
    return (
      <div className="funnel-container empty">
        <p>No funnel data available yet.</p>
        <style>{`
          .funnel-container.empty {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  const { stages } = data;
  const maxCount = stages[0]?.count || 1;

  const colors = [
    { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#3b82f6' },
    { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1', text: '#6366f1' },
    { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', text: '#8b5cf6' },
    { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#22c55e' },
    { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', text: '#ec4899' },
  ];

  return (
    <div className="funnel-container">
      <div className="funnel-header">
        <h3>Conversion Funnel</h3>
      </div>

      <div className="funnel-stages">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;
          const color = colors[index % colors.length];

          return (
            <div key={stage.stage} className="funnel-stage">
              <div className="stage-info">
                <span className="stage-label">{stage.label}</span>
                <span className="stage-count">{stage.count.toLocaleString()}</span>
              </div>
              <div className="stage-bar-container">
                <div
                  className="stage-bar"
                  style={{
                    width: `${Math.max(width, 5)}%`,
                    background: color.bg,
                    borderColor: color.border,
                  }}
                >
                  <span className="stage-percentage" style={{ color: color.text }}>
                    {stage.percentage}%
                  </span>
                </div>
              </div>
              {stage.conversionFromPrevious !== null && index > 0 && (
                <div className="stage-conversion">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                  <span>{stage.conversionFromPrevious}% conversion</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .funnel-container {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          padding: 24px;
        }

        .funnel-header {
          margin-bottom: 24px;
        }

        .funnel-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .funnel-stages {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .funnel-stage {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stage-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stage-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #ffffff;
        }

        .stage-count {
          font-size: 0.875rem;
          font-weight: 600;
          color: #9ca3af;
        }

        .stage-bar-container {
          width: 100%;
          height: 40px;
          background: #0f0f1a;
          border-radius: 8px;
          overflow: hidden;
        }

        .stage-bar {
          height: 100%;
          border-left: 4px solid;
          display: flex;
          align-items: center;
          padding-left: 12px;
          transition: width 0.5s ease-out;
        }

        .stage-percentage {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stage-conversion {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #6b7280;
          margin-left: 4px;
        }

        .stage-conversion svg {
          color: #22c55e;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionFunnel;
