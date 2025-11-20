import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { JeffreyRecommendation } from '../../types/unified';

interface JeffreyRecommendationsProps {
  recommendations: JeffreyRecommendation[];
  className?: string;
}

const getPriorityColor = (priority: JeffreyRecommendation['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-blue-500';
    default:
      return 'border-l-neutral-500';
  }
};

export const JeffreyRecommendations: React.FC<JeffreyRecommendationsProps> = ({
  recommendations,
  className,
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50',
        'border border-blue-100',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Jeffrey Avatar */}
        <div
          className="w-12 h-12 rounded-full
                     flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <img
            src="/assets/new-jeffrey-removebg-preview.png"
            alt="Jeffrey AI"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold mb-4 text-neutral-900">
            Jeffrey's Recommendations
          </h3>

          <ul className="space-y-3">
            {recommendations.map((rec) => (
              <li
                key={rec.id}
                className={cn(
                  'flex items-start gap-3 bg-white p-3 rounded-lg border-l-4',
                  getPriorityColor(rec.priority)
                )}
              >
                <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 text-sm">{rec.title}</p>
                  <p className="text-neutral-600 text-sm mt-0.5">{rec.description}</p>
                  {rec.action && (
                    <Link
                      to={rec.action.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-2"
                    >
                      {rec.action.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
