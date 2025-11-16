import React from 'react';
import {
  FileText,
  CheckCircle,
  Camera,
  Plane,
  MessageCircle,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ActivityItem } from '../../types/unified';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

const getIconForType = (type: ActivityItem['type']) => {
  switch (type) {
    case 'form':
      return FileText;
    case 'document':
      return CheckCircle;
    case 'photo':
      return Camera;
    case 'travel':
      return Plane;
    case 'chat':
      return MessageCircle;
    default:
      return FileText;
  }
};

const getStatusIcon = (status: ActivityItem['status']) => {
  switch (status) {
    case 'completed':
      return Check;
    case 'in_progress':
      return Clock;
    case 'failed':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: ActivityItem['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-500 bg-green-50';
    case 'in_progress':
      return 'text-blue-500 bg-blue-50';
    case 'failed':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-neutral-500 bg-neutral-50';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className,
  maxItems = 10,
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  if (displayedActivities.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {displayedActivities.map((activity, index) => {
        const TypeIcon = getIconForType(activity.type);
        const StatusIcon = getStatusIcon(activity.status);
        const statusColor = getStatusColor(activity.status);

        return (
          <div key={activity.id || index} className="flex items-start gap-4">
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  statusColor
                )}
              >
                <TypeIcon className="w-5 h-5" />
              </div>
              {index < displayedActivities.length - 1 && (
                <div className="w-0.5 h-full bg-neutral-200 absolute top-10" />
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-neutral-900">{activity.title}</h4>
                <div className="flex items-center gap-1">
                  <StatusIcon className={cn('w-4 h-4', statusColor.split(' ')[0])} />
                  <span className="text-xs text-neutral-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-neutral-600">{activity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
