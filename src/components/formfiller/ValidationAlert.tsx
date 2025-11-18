/**
 * Validation Alert Component
 * Displays validation issues with appropriate styling
 */

import type { ValidationIssue } from '../../types/formfiller';

interface ValidationAlertProps {
  issues: ValidationIssue[];
  type: 'error' | 'warning' | 'info';
  title?: string;
  className?: string;
}

export default function ValidationAlert({
  issues,
  type,
  title,
  className = '',
}: ValidationAlertProps) {
  if (issues.length === 0) return null;

  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: '❌',
      title: title || 'Validation Errors',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: '⚠️',
      title: title || 'Warnings',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'ℹ️',
      title: title || 'Information',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <h3 className={`font-semibold ${style.text} mb-2`}>{style.title}</h3>
          <ul className="space-y-2">
            {issues.map((issue, index) => (
              <li key={index} className={`${style.text} text-sm`}>
                <div className="font-medium">{issue.field}:</div>
                <div className="ml-4">{issue.message}</div>
                {issue.suggestion && (
                  <div className="ml-4 mt-1 text-xs opacity-75">
                    💡 {issue.suggestion}
                  </div>
                )}
                {issue.autoFixable && (
                  <div className="ml-4 mt-1">
                    <button className="text-xs underline hover:no-underline">
                      Auto-fix this issue
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
