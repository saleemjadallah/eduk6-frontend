import React from 'react';
import { ArrowLeft, User, Shield, CreditCard, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileManager } from '../components/forms/ProfileManager';
import { cn } from '../utils/cn';

export const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'billing' | 'notifications'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile & Auto-fill', icon: User, description: 'Manage your personal information for form auto-fill' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and security settings' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment methods and history' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and notification preferences' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile, security, and preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <tab.icon className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-medium">{tab.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tab.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Profile Completion Card */}
            {activeTab === 'profile' && (
              <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Profile Completion</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Personal Info</span>
                    <span className="text-green-600 font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Passport</span>
                    <span className="text-green-600 font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Employment</span>
                    <span className="text-amber-600 font-medium">Add details</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Family</span>
                    <span className="text-gray-400 font-medium">Optional</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-xs text-indigo-700">
                    Complete profiles enable faster auto-fill across all visa applications
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {activeTab === 'profile' && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-1">About Profile & Auto-fill</h3>
                  <p className="text-sm text-blue-700">
                    Your profile information is securely stored and used to automatically fill visa application forms.
                    Update your details here to ensure accurate auto-fill across all applications.
                  </p>
                </div>
                <ProfileManager />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Change Password</h3>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Update Password
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-2">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">Billing & Payment</h2>
                <p className="text-gray-600">Payment history and saved payment methods will appear here</p>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about your applications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Form validation alerts</p>
                      <p className="text-sm text-gray-600">Get notified about validation issues</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};