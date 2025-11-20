import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  stats: {
    total: number;
    label: string;
    completeness?: number;
  };
  cta: {
    label: string;
    href: string;
  };
  onClick?: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  gradient,
  stats,
  cta,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={cta.href}
      onClick={handleClick}
      className={cn(
        'block group rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 overflow-hidden',
        'hover:shadow-xl hover:border-white/80 transition-all duration-300',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Header with gradient background */}
      <div className={cn('p-6 bg-gradient-to-br', gradient, 'relative overflow-hidden')}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </div>

      {/* Stats and CTA */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
            <p className="text-sm text-neutral-500">{stats.label}</p>
          </div>

          {stats.completeness !== undefined && (
            <div className="text-right">
              <p className="text-sm font-semibold text-neutral-700">
                {stats.completeness}% Complete
              </p>
              <div className="w-24 h-2 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                  style={{ width: `${stats.completeness}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
            {cta.label}
          </span>
          <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
