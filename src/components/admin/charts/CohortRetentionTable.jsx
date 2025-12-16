import React from 'react';

/**
 * Get color class based on retention rate
 * Green: >30%, Yellow: 15-30%, Red: <15%
 */
const getRetentionColor = (rate) => {
  if (rate === null || rate === undefined) return 'future';
  if (rate >= 30) return 'green';
  if (rate >= 15) return 'yellow';
  return 'red';
};

/**
 * CohortRetentionTable - Color-coded cohort retention matrix
 * Critical for VC presentations
 */
const CohortRetentionTable = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="cohort-table-container">
        <div className="cohort-loading">
          <div className="skeleton-table">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="skeleton-cell" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .cohort-table-container {
            background: #1a1a2e;
            border: 3px solid #2d2d44;
            border-radius: 12px;
            box-shadow: 4px 4px 0 0 #000;
            overflow: hidden;
          }

          .cohort-loading {
            padding: 20px;
          }

          .skeleton-table {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .skeleton-row {
            display: flex;
            gap: 8px;
          }

          .skeleton-cell {
            height: 40px;
            flex: 1;
            background: linear-gradient(90deg, #2d2d44 25%, #3d3d5c 50%, #2d2d44 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (!data || !data.cohorts || data.cohorts.length === 0) {
    return (
      <div className="cohort-table-container empty">
        <p>No cohort data available yet. Data will appear once users start signing up.</p>
        <style>{`
          .cohort-table-container.empty {
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

  const { cohorts, headers } = data;
  const displayMonths = Math.min(headers.length, 13); // M0 to M12

  return (
    <div className="cohort-table-container">
      <div className="cohort-header">
        <h3>Monthly Cohort Retention</h3>
        <div className="cohort-legend">
          <span className="legend-item green">{'>'} 30%</span>
          <span className="legend-item yellow">15-30%</span>
          <span className="legend-item red">{'<'} 15%</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="cohort-table">
          <thead>
            <tr>
              <th className="sticky-col">Cohort</th>
              <th className="sticky-col size-col">Size</th>
              {headers.slice(0, displayMonths).map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, rowIndex) => (
              <tr key={cohort.cohortMonth}>
                <td className="sticky-col cohort-name">
                  {cohort.cohortDisplayName}
                </td>
                <td className="sticky-col size-col">
                  {cohort.cohortSize.toLocaleString()}
                </td>
                {cohort.retention.slice(0, displayMonths).map((rate, colIndex) => (
                  <td
                    key={colIndex}
                    className={`retention-cell ${getRetentionColor(rate)}`}
                    title={rate !== null ? `${rate}% retained in month ${colIndex}` : 'Future data'}
                  >
                    {rate !== null ? `${rate}%` : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .cohort-table-container {
          background: #1a1a2e;
          border: 3px solid #2d2d44;
          border-radius: 12px;
          box-shadow: 4px 4px 0 0 #000;
          overflow: hidden;
        }

        .cohort-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #2d2d44;
        }

        .cohort-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .cohort-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .legend-item::before {
          content: '';
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-item.green::before {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .legend-item.yellow::before {
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
        }

        .legend-item.red::before {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .table-wrapper {
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .cohort-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 800px;
        }

        .cohort-table th,
        .cohort-table td {
          padding: 12px 16px;
          text-align: center;
          white-space: nowrap;
        }

        .cohort-table th {
          background: #0f0f1a;
          color: #9ca3af;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #2d2d44;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .cohort-table .sticky-col {
          position: sticky;
          left: 0;
          z-index: 15;
          background: #1a1a2e;
        }

        .cohort-table th.sticky-col {
          background: #0f0f1a;
          z-index: 20;
        }

        .cohort-table .size-col {
          left: 120px;
        }

        .cohort-table th.size-col {
          left: 120px;
        }

        .cohort-table tbody tr:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .cohort-table tbody tr:hover .sticky-col {
          background: rgba(59, 130, 246, 0.1);
        }

        .cohort-name {
          text-align: left;
          font-weight: 500;
          color: #ffffff;
          min-width: 120px;
        }

        .size-col {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .retention-cell {
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 4px;
          transition: transform 0.1s;
        }

        .retention-cell:hover {
          transform: scale(1.05);
        }

        .retention-cell.green {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
          color: #22c55e;
        }

        .retention-cell.yellow {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.2) 100%);
          color: #eab308;
        }

        .retention-cell.red {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
          color: #ef4444;
        }

        .retention-cell.future {
          background: transparent;
          color: #4b5563;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cohort-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .cohort-table th,
          .cohort-table td {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CohortRetentionTable;
