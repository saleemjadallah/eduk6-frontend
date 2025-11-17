import React, { useState } from 'react';
import { Shield, Info, Save, Globe, Calendar, Phone, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface UserPreferences {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  namePrefix?: string;
  nationality?: string;
  countryOfResidence?: string;
  cityOfResidence?: string;
  gender?: string;
  professionCategory?: string;
  employmentStatus?: string;
  educationLevel?: string;
  preferredDateFormat?: string;
  preferredPhoneFormat?: string;
  preferredLanguage?: string;
  measurementSystem?: string;
}

interface PreferencesManagerProps {
  onSave?: (preferences: UserPreferences) => void;
  className?: string;
}

export const PreferencesManager: React.FC<PreferencesManagerProps> = ({ onSave, className }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [activeTab, setActiveTab] = useState<'basics' | 'formats' | 'privacy'>('basics');
  const [isSaving, setIsSaving] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(true);

  const tabs = [
    { id: 'basics', label: 'Basic Info', icon: User },
    { id: 'formats', label: 'Preferences', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call API to save preferences
      if (onSave) {
        onSave(preferences);
      }
      // Show success message
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200", className)}>
      {/* Privacy Notice Banner */}
      {showPrivacyInfo && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Your Privacy is Protected</h3>
                <p className="text-sm text-green-700 mt-1">
                  We NEVER store sensitive information like passport numbers, dates of birth, or financial data.
                  Only formatting preferences and general information are saved to help with form validation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyInfo(false)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Basic Information Tab */}
        {activeTab === 'basics' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Info className="w-4 h-4 inline mr-1" />
                This information helps with form formatting and validation only. No sensitive data is stored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name Prefix</label>
                <select
                  value={preferences.namePrefix || ''}
                  onChange={(e) => setPreferences({ ...preferences, namePrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={preferences.firstName || ''}
                  onChange={(e) => setPreferences({ ...preferences, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="For auto-capitalization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={preferences.middleName || ''}
                  onChange={(e) => setPreferences({ ...preferences, middleName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={preferences.lastName || ''}
                  onChange={(e) => setPreferences({ ...preferences, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="For auto-capitalization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={preferences.nationality || ''}
                  onChange={(e) => setPreferences({ ...preferences, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., United States"
                />
                <p className="text-xs text-gray-500 mt-1">Helps determine date/phone formats</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                <input
                  type="text"
                  value={preferences.countryOfResidence || ''}
                  onChange={(e) => setPreferences({ ...preferences, countryOfResidence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City of Residence</label>
                <input
                  type="text"
                  value={preferences.cityOfResidence || ''}
                  onChange={(e) => setPreferences({ ...preferences, cityOfResidence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., New York"
                />
                <p className="text-xs text-gray-500 mt-1">City only, no street address needed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession Category</label>
                <select
                  value={preferences.professionCategory || ''}
                  onChange={(e) => setPreferences({ ...preferences, professionCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts">Arts & Creative</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">General category only, not specific employer</p>
              </div>
            </div>
          </div>
        )}

        {/* Format Preferences Tab */}
        {activeTab === 'formats' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-sm text-indigo-800">
                <Calendar className="w-4 h-4 inline mr-1" />
                These preferences help auto-format your entries correctly for each country's requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preferred Date Format
                </label>
                <div className="space-y-2">
                  {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(format => (
                    <label key={format} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="dateFormat"
                        value={format}
                        checked={preferences.preferredDateFormat === format}
                        onChange={(e) => setPreferences({ ...preferences, preferredDateFormat: e.target.value })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm">{format}</span>
                      {format === 'DD/MM/YYYY' && <span className="text-xs text-gray-500">(Europe, Asia)</span>}
                      {format === 'MM/DD/YYYY' && <span className="text-xs text-gray-500">(USA)</span>}
                      {format === 'YYYY-MM-DD' && <span className="text-xs text-gray-500">(ISO)</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number Region
                </label>
                <select
                  value={preferences.preferredPhoneFormat || ''}
                  onChange={(e) => setPreferences({ ...preferences, preferredPhoneFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select your region...</option>
                  <option value="+1">USA/Canada (+1)</option>
                  <option value="+44">UK (+44)</option>
                  <option value="+91">India (+91)</option>
                  <option value="+86">China (+86)</option>
                  <option value="+49">Germany (+49)</option>
                  <option value="+33">France (+33)</option>
                  <option value="+971">UAE (+971)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Helps format phone numbers correctly</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement System</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="measurement"
                      value="metric"
                      checked={preferences.measurementSystem === 'metric'}
                      onChange={(e) => setPreferences({ ...preferences, measurementSystem: e.target.value })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm">Metric (kg, cm)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="measurement"
                      value="imperial"
                      checked={preferences.measurementSystem === 'imperial'}
                      onChange={(e) => setPreferences({ ...preferences, measurementSystem: e.target.value })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm">Imperial (lbs, inches)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                <select
                  value={preferences.preferredLanguage || ''}
                  onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">What We Store</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>✓ Your name (for formatting assistance)</li>
                <li>✓ Nationality and residence (for date/phone formats)</li>
                <li>✓ General profession category (not specific employer)</li>
                <li>✓ Your formatting preferences</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">What We Never Store</h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li>✗ Passport or ID numbers</li>
                <li>✗ Date of birth</li>
                <li>✗ Specific addresses</li>
                <li>✗ Phone numbers</li>
                <li>✗ Financial information</li>
                <li>✗ Travel history</li>
                <li>✗ Family member details</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Privacy Controls</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow preference storage</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow anonymous usage analytics</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                </label>
              </div>

              <button className="mt-6 text-sm text-red-600 hover:text-red-800 underline">
                Delete all my preference data
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};