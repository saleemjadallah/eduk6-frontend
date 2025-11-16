import React from 'react';
import { cn } from '../../utils/cn';
import { WorkflowType } from '../../types/unified';

interface ContextBadgeProps {
  workflow: WorkflowType;
  className?: string;
}

const workflowLabels: Record<string, string> = {
  'form-filler': 'Helping with: Form Auto-Fill',
  validator: 'Helping with: Document Validation',
  photo: 'Helping with: Photo Requirements',
  travel: 'Helping with: Travel Planning',
  dashboard: 'Ready to help with your visa journey',
};

export const ContextBadge: React.FC<ContextBadgeProps> = ({ workflow, className }) => {
  const label = workflow ? workflowLabels[workflow] : 'Ready to help with your visa journey';

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium',
        className
      )}
    >
      {label}
    </span>
  );
};
