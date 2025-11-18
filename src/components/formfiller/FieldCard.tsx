/**
 * Field Card Component
 * Displays a form field with confidence indicator and edit capability
 */

import { useState } from 'react';
import ConfidenceIndicator from './ConfidenceIndicator';
import type { FieldMapping } from '../../types/formfiller';

interface FieldCardProps {
  field: FieldMapping;
  onUpdate?: (value: string) => void;
  className?: string;
}

export default function FieldCard({ field, onUpdate, className = '' }: FieldCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(field.populatedValue || field.extractedField.value);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(field.populatedValue || field.extractedField.value);
    setIsEditing(false);
  };

  // Determine if field needs review
  const needsReview = field.confidence < 70 || !field.canonicalPath;

  return (
    <div
      className={`border rounded-lg p-4 ${
        needsReview ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
      } ${className}`}
    >
      {/* Field header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{field.extractedField.label}</h4>
          {field.canonicalPath && (
            <p className="text-xs text-gray-500 mt-1">Mapped to: {field.canonicalPath}</p>
          )}
          {!field.canonicalPath && (
            <p className="text-xs text-yellow-700 mt-1">⚠️ No mapping found - manual entry required</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {needsReview && (
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
              Needs Review
            </span>
          )}
        </div>
      </div>

      {/* Confidence indicator */}
      <ConfidenceIndicator confidence={field.confidence} size="sm" className="mb-3" />

      {/* Value display/edit */}
      <div className="space-y-2">
        {isEditing ? (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded flex-1">
                {value || <span className="text-gray-400 italic">Empty</span>}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
            </div>
            {field.suggestion && (
              <p className="text-xs text-gray-600 italic">💡 {field.suggestion}</p>
            )}
          </>
        )}
      </div>

      {/* Field type badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
          {field.extractedField.type}
        </span>
        {field.needsTransform && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
            Transform: {field.transform}
          </span>
        )}
      </div>
    </div>
  );
}
