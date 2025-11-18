/**
 * Confidence Indicator Component
 * Shows confidence level with color-coded visual indicator
 */

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export default function ConfidenceIndicator({
  confidence,
  size = 'md',
  showPercentage = true,
  className = '',
}: ConfidenceIndicatorProps) {
  // Determine color based on confidence level
  const getConfidenceColor = () => {
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (confidence >= 85) return 'text-green-700';
    if (confidence >= 70) return 'text-yellow-700';
    return 'text-red-700';
  };

  const sizeClasses = {
    sm: 'h-1.5 text-xs',
    md: 'h-2 text-sm',
    lg: 'h-3 text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Progress bar */}
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full ${getConfidenceColor()} transition-all duration-300`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <span className={`font-medium ${sizeClasses[size]} ${getTextColor()}`}>
          {confidence}%
        </span>
      )}
    </div>
  );
}
