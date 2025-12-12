import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAPI } from '../../services/api/teacherAPI';
import TeacherLayout from '../../components/teacher/TeacherLayout';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Building2,
  GraduationCap,
  Globe,
  AlertTriangle,
  ChevronRight,
  Zap,
  Crown,
  Coffee,
  ExternalLink,
} from 'lucide-react';

const SUBJECTS = [
  { value: '', label: 'Select your primary subject' },
  { value: 'MATH', label: 'Mathematics' },
  { value: 'SCIENCE', label: 'Science' },
  { value: 'ENGLISH', label: 'English Language Arts' },
  { value: 'SOCIAL_STUDIES', label: 'Social Studies' },
  { value: 'HISTORY', label: 'History' },
  { value: 'GEOGRAPHY', label: 'Geography' },
  { value: 'ART', label: 'Art' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'PHYSICAL_EDUCATION', label: 'Physical Education' },
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'FOREIGN_LANGUAGE', label: 'Foreign Language' },
  { value: 'MULTIPLE', label: 'Multiple Subjects' },
  { value: 'OTHER', label: 'Other' },
];

const GRADE_RANGES = [
  { value: '', label: 'Select grade level range' },
  { value: 'ELEMENTARY', label: 'Elementary (K-5)' },
  { value: 'MIDDLE', label: 'Middle School (6-8)' },
  { value: 'HIGH', label: 'High School (9-12)' },
  { value: 'MIXED', label: 'Mixed Grades' },
];

const TeacherSettingsPage = () => {
  const navigate = useNavigate();
  const { teacher, updateProfile, signOut, refreshAuth } = useTeacherAuth();

  // Active tab
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    schoolName: '',
    subject: '',
    gradeRange: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    productNews: true,
    usageAlerts: true,
    weeklyDigest: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Initialize form with teacher data
  useEffect(() => {
    if (teacher) {
      setProfileForm({
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        schoolName: teacher.schoolName || '',
        subject: teacher.subject || '',
        gradeRange: teacher.gradeRange || '',
      });
    }
  }, [teacher]);

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await teacherAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (result.success) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle notification preferences
  const handleNotificationToggle = async (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setNotifLoading(true);

    // In a real app, save to backend here
    setTimeout(() => {
      setNotifLoading(false);
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 2000);
    }, 500);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const result = await teacherAPI.deleteAccount();
      if (result.success) {
        await signOut();
        navigate('/teacher');
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'PROFESSIONAL':
        return { icon: Crown, label: 'Professional', color: 'text-teacher-gold', bg: 'bg-teacher-gold/10' };
      case 'BASIC':
        return { icon: Zap, label: 'Basic', color: 'text-teacher-sage', bg: 'bg-teacher-sage/10' };
      default:
        return { icon: Coffee, label: 'Free', color: 'text-teacher-inkLight', bg: 'bg-teacher-ink/5' };
    }
  };

  const tierInfo = getTierInfo(teacher?.subscriptionTier);
  const TierIcon = tierInfo.icon;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  const headerActions = (
    <Link
      to="/teacher/dashboard"
      className="teacher-btn-secondary flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Dashboard</span>
    </Link>
  );

  return (
    <TeacherLayout
      title="Settings"
      subtitle="Manage your account and preferences"
      headerActions={headerActions}
    >
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-teacher-chalk text-white shadow-teacher'
                  : 'bg-white text-teacher-inkLight hover:text-teacher-ink hover:bg-teacher-paper border border-teacher-ink/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Profile Info Card */}
              <div className="teacher-card p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teacher-terracotta to-teacher-terracottaLight flex items-center justify-center text-white font-bold text-xl border-2 border-teacher-ink/10">
                    {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-teacher-ink">
                      {teacher?.firstName} {teacher?.lastName}
                    </h2>
                    <p className="text-teacher-inkLight">{teacher?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tierInfo.bg} ${tierInfo.color}`}>
                        <TierIcon className="w-3.5 h-3.5" />
                        {tierInfo.label} Plan
                      </span>
                      {teacher?.emailVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teacher-sage/10 text-teacher-sage">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      School/Organization
                    </label>
                    <input
                      type="text"
                      value={profileForm.schoolName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, schoolName: e.target.value }))}
                      placeholder="Enter your school name"
                      className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        <GraduationCap className="w-4 h-4 inline mr-1" />
                        Primary Subject
                      </label>
                      <select
                        value={profileForm.subject}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      >
                        {SUBJECTS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Grade Level Range
                      </label>
                      <select
                        value={profileForm.gradeRange}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gradeRange: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm bg-white focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      >
                        {GRADE_RANGES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={teacher?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm bg-teacher-paper text-teacher-inkLight cursor-not-allowed"
                    />
                    <p className="text-xs text-teacher-inkLight mt-1">
                      Contact support to change your email address
                    </p>
                  </div>

                  {profileError && (
                    <div className="p-3 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-center gap-2 text-teacher-coral text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="p-3 bg-teacher-sage/10 border border-teacher-sage/20 rounded-xl flex items-center gap-2 text-teacher-sage text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      Profile updated successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-teacher-chalk text-white font-medium rounded-xl hover:bg-teacher-chalkLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="teacher-card p-6">
                <h3 className="text-lg font-semibold text-teacher-ink mb-1">Change Password</h3>
                <p className="text-sm text-teacher-inkLight mb-6">
                  Update your password to keep your account secure
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 pr-10 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-teacher-inkLight hover:text-teacher-ink"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 pr-10 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-teacher-inkLight hover:text-teacher-ink"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-teacher-inkLight mt-1">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teacher-inkLight mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-teacher-ink/10 rounded-xl text-sm focus:outline-none focus:border-teacher-chalk focus:ring-2 focus:ring-teacher-chalk/10 transition-all"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-center gap-2 text-teacher-coral text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-teacher-sage/10 border border-teacher-sage/20 rounded-xl flex items-center gap-2 text-teacher-sage text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      Password changed successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="px-6 py-2.5 bg-teacher-chalk text-white font-medium rounded-xl hover:bg-teacher-chalkLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication (Coming Soon) */}
              <div className="teacher-card p-6 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-teacher-ink mb-1">Two-Factor Authentication</h3>
                    <p className="text-sm text-teacher-inkLight">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-teacher-gold/10 text-teacher-gold">
                    Coming Soon
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="teacher-card p-6">
                <h3 className="text-lg font-semibold text-teacher-ink mb-1">Email Notifications</h3>
                <p className="text-sm text-teacher-inkLight mb-6">
                  Choose what emails you'd like to receive
                </p>

                <div className="space-y-4">
                  {[
                    {
                      key: 'emailUpdates',
                      title: 'Product Updates',
                      description: 'New features and improvements to Orbit Learn',
                    },
                    {
                      key: 'productNews',
                      title: 'Tips & Tutorials',
                      description: 'Get the most out of your AI teaching assistant',
                    },
                    {
                      key: 'usageAlerts',
                      title: 'Usage Alerts',
                      description: 'Get notified when you\'re running low on credits',
                    },
                    {
                      key: 'weeklyDigest',
                      title: 'Weekly Digest',
                      description: 'Summary of your content creation activity',
                    },
                  ].map(({ key, title, description }) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 border border-teacher-ink/10 rounded-xl hover:bg-teacher-paper/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-teacher-ink">{title}</p>
                        <p className="text-sm text-teacher-inkLight">{description}</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={() => handleNotificationToggle(key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-teacher-ink/10 rounded-full peer peer-checked:bg-teacher-chalk transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  ))}
                </div>

                {notifSuccess && (
                  <div className="mt-4 p-3 bg-teacher-sage/10 border border-teacher-sage/20 rounded-xl flex items-center gap-2 text-teacher-sage text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    Preferences saved!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Subscription Info */}
              <div className="teacher-card p-6">
                <h3 className="text-lg font-semibold text-teacher-ink mb-1">Subscription</h3>
                <p className="text-sm text-teacher-inkLight mb-4">
                  Manage your subscription and billing
                </p>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teacher-chalk/5 to-teacher-gold/5 rounded-xl border border-teacher-ink/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${tierInfo.bg} flex items-center justify-center`}>
                      <TierIcon className={`w-6 h-6 ${tierInfo.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-teacher-ink">{tierInfo.label} Plan</p>
                      <p className="text-sm text-teacher-inkLight">
                        {teacher?.subscriptionTier === 'FREE'
                          ? '100K credits/month'
                          : teacher?.subscriptionTier === 'BASIC'
                            ? '500K credits/month'
                            : '2M credits/month'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/teacher/billing"
                    className="px-4 py-2 bg-white border border-teacher-ink/10 rounded-xl text-sm font-medium text-teacher-ink hover:bg-teacher-paper flex items-center gap-2 transition-colors"
                  >
                    {teacher?.subscriptionTier === 'FREE' ? 'Upgrade' : 'Manage'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Export Data */}
              <div className="teacher-card p-6">
                <h3 className="text-lg font-semibold text-teacher-ink mb-1">Export Your Data</h3>
                <p className="text-sm text-teacher-inkLight mb-4">
                  Download a copy of all your content and account data
                </p>

                <button
                  className="px-4 py-2 border border-teacher-ink/10 rounded-xl text-sm font-medium text-teacher-ink hover:bg-teacher-paper flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Request Data Export
                </button>
              </div>

              {/* Danger Zone */}
              <div className="teacher-card p-6 border-teacher-coral/20">
                <h3 className="text-lg font-semibold text-teacher-coral mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-teacher-inkLight mb-4">
                  Permanently delete your account and all associated data
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 border border-teacher-coral text-teacher-coral rounded-xl text-sm font-medium hover:bg-teacher-coral/5 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                ) : (
                  <div className="p-4 bg-teacher-coral/5 border border-teacher-coral/20 rounded-xl">
                    <p className="text-sm text-teacher-ink mb-3">
                      This action is <strong>permanent</strong> and cannot be undone. All your content, settings, and data will be permanently deleted.
                    </p>
                    <p className="text-sm text-teacher-inkLight mb-3">
                      Type <strong>DELETE</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full px-4 py-2.5 border border-teacher-coral/30 rounded-xl text-sm mb-3 focus:outline-none focus:border-teacher-coral focus:ring-2 focus:ring-teacher-coral/10"
                    />

                    {deleteError && (
                      <div className="mb-3 p-3 bg-teacher-coral/10 border border-teacher-coral/20 rounded-xl flex items-center gap-2 text-teacher-coral text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {deleteError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                        className="px-4 py-2 bg-teacher-coral text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        {deleteLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Permanently Delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                          setDeleteError(null);
                        }}
                        className="px-4 py-2 border border-teacher-ink/10 rounded-xl text-sm font-medium text-teacher-ink hover:bg-teacher-paper transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TeacherLayout>
  );
};

export default TeacherSettingsPage;
