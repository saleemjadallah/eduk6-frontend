import React, { useState, useEffect } from 'react';
import {
  Sparkles, AlertCircle, CheckCircle2, Edit2, Plus,
  Shield, Clock, TrendingUp
} from 'lucide-react';
import { profileApi, CompleteProfile } from '../../lib/api-profile';
import { validateForm } from '../../lib/validation-rules';
import { cn } from '../../utils/cn';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'checkbox' | 'select' | 'textarea';
  label: string;
  value: string;
  required?: boolean;
  validationStatus?: 'valid' | 'warning' | 'error';
  validationMessage?: string;
  autoFillConfidence?: number;
  source?: 'profile' | 'manual' | 'suggested';
}

interface FormFillerEnhancedProps {
  fields: FormField[];
  country: string;
  visaType: string;
  onFieldChange: (fieldId: string, value: string) => void;
  onProfileEdit?: () => void;
}

export const FormFillerEnhanced: React.FC<FormFillerEnhancedProps> = ({
  fields,
  country,
  visaType,
  onFieldChange,
  onProfileEdit: _onProfileEdit
}) => {
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [autoFillData, setAutoFillData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Run validation when fields change
    const formData: Record<string, any> = {};
    fields.forEach(field => {
      formData[field.name] = field.value;
    });

    const validation = validateForm(formData, country, visaType);
    setValidationErrors(validation.errors);
  }, [fields, country, visaType]);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        calculateProfileCompleteness(response.data);

        // Check if profile is incomplete
        if (!response.data.profile || !response.data.passports?.length) {
          setShowProfilePrompt(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const calculateProfileCompleteness = (profileData: CompleteProfile) => {
    let score = 0;
    let total = 4;

    if (profileData.profile) score++;
    if (profileData.passports?.length > 0) score++;
    if (profileData.employment?.length > 0) score++;
    if (profileData.education?.length > 0) score++;

    setProfileCompleteness(Math.round((score / total) * 100));
  };

  const handleAutoFill = async () => {
    if (!profile?.profile) {
      setShowProfilePrompt(true);
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await profileApi.getAutoFillData({
        country,
        visaType,
        fields: fields.map(f => ({
          id: f.id,
          name: f.name,
          label: f.label
        }))
      });

      if (response.success && response.data) {
        setAutoFillData(response.data.autoFillData);

        // Apply auto-fill data to fields
        Object.entries(response.data.autoFillData).forEach(([fieldId, data]) => {
          onFieldChange(fieldId, data.value);
        });

        // Show validation errors from auto-fill
        if (response.data.validationErrors.length > 0) {
          setValidationErrors(prev => [...prev, ...response.data!.validationErrors]);
        }
      }
    } catch (error) {
      console.error('Error auto-filling:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const _getFieldValidationStatus = (field: FormField) => {
    const error = validationErrors.find(e => e.fieldId === field.id);
    if (error) {
      return error.severity;
    }
    if (field.value && field.required) {
      return 'valid';
    }
    return null;
  };

  const getAutoFillStats = () => {
    const autoFilledCount = fields.filter(f => autoFillData[f.id]?.source === 'profile').length;
    const percentage = fields.length > 0 ? Math.round((autoFilledCount / fields.length) * 100) : 0;
    return { autoFilledCount, percentage };
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Status Card */}
      <div className={cn(
        "rounded-xl p-4 border",
        profileCompleteness === 100
          ? "bg-green-50 border-green-200"
          : profileCompleteness > 50
          ? "bg-amber-50 border-amber-200"
          : "bg-red-50 border-red-200"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {profileCompleteness === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
              <h3 className="font-semibold text-gray-900">
                Profile {profileCompleteness}% Complete
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {profileCompleteness === 100
                ? "Your profile is complete! Auto-fill will work at maximum efficiency."
                : `Complete your profile to enable ${100 - profileCompleteness}% more auto-fill coverage.`}
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">Saves ~15 min per form</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">Prevents rejection errors</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{getAutoFillStats().percentage}% auto-fillable</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open('/app/profile-settings', '_blank')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 inline mr-1" />
              Edit Profile
            </button>
            <button
              onClick={handleAutoFill}
              disabled={isAutoFilling || profileCompleteness === 0}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAutoFilling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Auto-filling...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-fill Form
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Prompt for New Users */}
      {showProfilePrompt && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Set Up Your Profile for Auto-fill</h3>
              <p className="text-indigo-100 mb-4">
                Save your information once and auto-fill any visa form in seconds.
                No more typing the same data repeatedly!
              </p>
              <ul className="space-y-1 text-sm text-indigo-100 mb-4">
                <li>✓ Auto-fill passport details across all forms</li>
                <li>✓ Save family member profiles for group applications</li>
                <li>✓ Real-time validation prevents costly rejections</li>
              </ul>
            </div>
            <button
              onClick={() => setShowProfilePrompt(false)}
              className="text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/app/profile-onboarding'}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
            >
              Set Up Profile Now
            </button>
            <button
              onClick={() => setShowProfilePrompt(false)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Buttons */}
      {profile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Quick add:</span>

          {!profile.employment?.find(e => e.isCurrent) && (
            <button
              onClick={() => window.open('/app/profile-settings?tab=employment', '_blank')}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              <Plus className="w-3 h-3" />
              Employment
            </button>
          )}

          {(!profile.family || profile.family.length === 0) && (
            <button
              onClick={() => window.open('/app/profile-settings?tab=family', '_blank')}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              <Plus className="w-3 h-3" />
              Family Member
            </button>
          )}

          {(!profile.education || profile.education.length === 0) && (
            <button
              onClick={() => window.open('/app/profile-settings?tab=education', '_blank')}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              <Plus className="w-3 h-3" />
              Education
            </button>
          )}
        </div>
      )}

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Validation Issues ({validationErrors.length})
          </h3>
          <div className="space-y-2">
            {validationErrors.slice(0, 3).map((error, index) => (
              <div key={index} className="text-sm">
                {formatValidationMessage(error)}
              </div>
            ))}
            {validationErrors.length > 3 && (
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Show {validationErrors.length - 3} more...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Country-Specific Requirements */}
      {countryValidationRules[country.toLowerCase()] && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            {country} Visa Requirements
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
            <div>
              <strong>Passport Validity:</strong> {countryValidationRules[country.toLowerCase()].passportValidityMonths} months
            </div>
            <div>
              <strong>Date Format:</strong> {countryValidationRules[country.toLowerCase()].dateFormat}
            </div>
            {countryValidationRules[country.toLowerCase()].specificRules?.onwardTicketRequired && (
              <div className="col-span-2">
                <strong>⚠️ Onward ticket required</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};