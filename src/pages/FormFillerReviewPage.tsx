/**
 * AI Form Filler - Review & Fill Page
 * Review extracted fields, validate data, and generate filled PDF
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  fillPDFForm,
  validateFormData,
  downloadFilledPDF,
} from '../lib/api-formfiller';
import FieldCard from '../components/formfiller/FieldCard';
import ValidationAlert from '../components/formfiller/ValidationAlert';
import ConfidenceIndicator from '../components/formfiller/ConfidenceIndicator';
import type {
  ExtractedField,
  FieldMapping,
  FieldPopulation,
  ValidationIssue,
} from '../types/formfiller';

interface LocationState {
  file: File;
  extractedFields: ExtractedField[];
  fieldMappings: FieldMapping[];
  documentType: string;
}

export default function FormFillerReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Redirect if no state
  useEffect(() => {
    if (!state?.file || !state?.fieldMappings) {
      navigate('/form-filler/upload');
    }
  }, [state, navigate]);

  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(state?.fieldMappings || []);
  const [isValidating, setIsValidating] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [validationIssues, setValidationIssues] = useState<{
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    infos: ValidationIssue[];
  }>({ errors: [], warnings: [], infos: [] });
  const [validationStatus, setValidationStatus] = useState<string>('');
  const [showValidation, setShowValidation] = useState(false);
  const [destinationCountry, setDestinationCountry] = useState<string>('');

  // Calculate statistics
  const totalFields = fieldMappings.length;
  const autoMappedFields = fieldMappings.filter((f) => f.canonicalPath).length;
  const highConfidenceFields = fieldMappings.filter((f) => f.confidence >= 85).length;
  const needsReviewFields = fieldMappings.filter(
    (f) => f.confidence < 70 || !f.canonicalPath
  ).length;
  const avgConfidence = Math.round(
    fieldMappings.reduce((sum, f) => sum + f.confidence, 0) / totalFields
  );

  // Handle field update
  const handleFieldUpdate = (index: number, newValue: string) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], populatedValue: newValue };
    setFieldMappings(updated);
  };

  // Run validation
  const handleValidate = async () => {
    setIsValidating(true);
    setShowValidation(false);

    try {
      // Create temp form ID for validation
      const tempFormId = `temp_${Date.now()}`;

      // Prepare form data from field mappings
      const formData = fieldMappings.reduce((acc, mapping) => {
        if (mapping.canonicalPath) {
          const value = mapping.populatedValue || mapping.extractedField.value;
          const keys = mapping.canonicalPath.split('.');
          let current = acc;

          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = value;
        }
        return acc;
      }, {} as any);

      const result = await validateFormData(
        tempFormId,
        formData,
        state.extractedFields,
        destinationCountry || undefined
      );

      if (result.success && result.data) {
        setValidationIssues(result.data.issues);
        setValidationStatus(result.data.validation.status);
        setShowValidation(true);
      } else {
        throw new Error(result.error || 'Validation failed');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      alert(`Validation failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Fill PDF form
  const handleFillForm = async () => {
    setIsFilling(true);

    try {
      // Prepare field populations
      const fieldPopulations: FieldPopulation[] = fieldMappings.map((mapping) => ({
        fieldId: mapping.extractedField.label,
        formFieldLabel: mapping.extractedField.label,
        value: mapping.populatedValue || mapping.extractedField.value,
        canonicalPath: mapping.canonicalPath || undefined,
        transform: mapping.transform,
      }));

      const result = await fillPDFForm(
        state.file,
        fieldPopulations,
        destinationCountry || undefined,
        true
      );

      if (result.success && result.data) {
        // Show success message
        alert(
          `Form filled successfully! ${result.data.statistics.populatedFields} fields populated.`
        );

        // Auto-download
        await downloadFilledPDF(result.data.formId, `filled_${state.file.name}`);

        // Navigate to history after brief delay
        setTimeout(() => {
          navigate('/form-filler/history');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to fill form');
      }
    } catch (err: any) {
      console.error('Fill error:', err);
      alert(`Failed to fill form: ${err.message}`);
    } finally {
      setIsFilling(false);
    }
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/form-filler/upload')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Upload
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review & Fill Form</h1>
              <p className="text-gray-600 mt-1">
                Document: <span className="font-medium">{state.file.name}</span>
              </p>
              <p className="text-gray-600">
                Type: <span className="font-medium">{state.documentType}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Overall Confidence</div>
              <ConfidenceIndicator confidence={avgConfidence} size="lg" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Total Fields</div>
            <div className="text-2xl font-bold text-gray-900">{totalFields}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Auto-Mapped</div>
            <div className="text-2xl font-bold text-green-600">
              {autoMappedFields}
              <span className="text-sm text-gray-500 ml-2">
                ({Math.round((autoMappedFields / totalFields) * 100)}%)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">High Confidence</div>
            <div className="text-2xl font-bold text-blue-600">
              {highConfidenceFields}
              <span className="text-sm text-gray-500 ml-2">
                ({Math.round((highConfidenceFields / totalFields) * 100)}%)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Needs Review</div>
            <div className="text-2xl font-bold text-yellow-600">
              {needsReviewFields}
              <span className="text-sm text-gray-500 ml-2">
                ({Math.round((needsReviewFields / totalFields) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Destination Country (Optional) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination Country (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Specify if this form is for travel/visa to enable country-specific validation
          </p>
          <select
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            className="block w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No specific country</option>
            <option value="ARE">United Arab Emirates</option>
            <option value="USA">United States</option>
            <option value="GBR">United Kingdom</option>
            <option value="CAN">Canada</option>
            <option value="AUS">Australia</option>
            <option value="IND">India</option>
            <option value="CHN">China</option>
            <option value="JPN">Japan</option>
            <option value="SGP">Singapore</option>
            <option value="DEU">Germany</option>
            <option value="FRA">France</option>
          </select>
        </div>

        {/* Validation Results */}
        {showValidation && (
          <div className="mb-6 space-y-4">
            {validationIssues.errors.length > 0 && (
              <ValidationAlert
                issues={validationIssues.errors}
                type="error"
                title="Validation Errors - Must Fix"
              />
            )}

            {validationIssues.warnings.length > 0 && (
              <ValidationAlert
                issues={validationIssues.warnings}
                type="warning"
                title="Warnings - Please Review"
              />
            )}

            {validationIssues.infos.length > 0 && (
              <ValidationAlert
                issues={validationIssues.infos}
                type="info"
                title="Information"
              />
            )}

            {validationIssues.errors.length === 0 &&
              validationIssues.warnings.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-6 w-6 text-green-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-900">
                        Validation Passed - {validationStatus}
                      </h3>
                      <p className="text-sm text-green-700">
                        All fields validated successfully. Ready to fill form!
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Field Cards */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Form Fields</h2>
            <div className="text-sm text-gray-600">
              Review and edit values before filling
            </div>
          </div>

          <div className="space-y-4">
            {fieldMappings.map((mapping, index) => (
              <FieldCard
                key={index}
                field={mapping}
                onUpdate={(newValue) => handleFieldUpdate(index, newValue)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleValidate}
              disabled={isValidating || isFilling}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validating...
                </span>
              ) : (
                'Validate Data'
              )}
            </button>

            <button
              onClick={handleFillForm}
              disabled={
                isFilling ||
                isValidating ||
                (showValidation && validationIssues.errors.length > 0)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFilling ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Filling Form...
                </span>
              ) : (
                'Fill & Download PDF'
              )}
            </button>
          </div>

          {validationIssues.errors.length > 0 && showValidation && (
            <p className="text-sm text-red-600 mt-3 text-right">
              Please fix all validation errors before filling the form
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
