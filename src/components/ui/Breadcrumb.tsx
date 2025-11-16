import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemProps {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ children, className }) => {
  const items = React.Children.toArray(children);

  return (
    <nav className={cn('flex items-center space-x-2 text-sm mb-6', className)}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  href,
  active,
  children,
  className,
}) => {
  if (active || !href) {
    return (
      <span
        className={cn(
          'text-neutral-900 font-medium',
          active && 'text-primary-600',
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        'text-neutral-500 hover:text-neutral-700 transition-colors',
        className
      )}
    >
      {children}
    </Link>
  );
};
