import React, { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Users, AlertCircle, CheckCircle2, Save, Plus } from 'lucide-react';
import { profileApi, UserProfile, PassportProfile, EmploymentProfile, EducationProfile, FamilyProfile, CompleteProfile } from '../../lib/api-profile';
import { cn } from '../../utils/cn';

interface ProfileManagerProps {
  onProfileUpdate?: (profile: CompleteProfile) => void;
  className?: string;
}

const createEmptyCurrentAddress = () => ({
  street: '',
  apartment: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  fromDate: '',
  toDate: '',
});

const createEmptyPersonalForm = (): Partial<UserProfile> => ({
  countryOfBirth: '',
  currentAddress: createEmptyCurrentAddress(),
});

const createEmptyEmployerAddress = () => ({
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
});

const createEmptyEmploymentForm = (): Partial<EmploymentProfile> => ({
  isCurrent: false,
  employerAddress: createEmptyEmployerAddress(),
});

const normalizePersonalForm = (data?: Partial<UserProfile>) => ({
  ...createEmptyPersonalForm(),
  ...data,
  countryOfBirth: data?.countryOfBirth || data?.nationality || '',
  currentAddress: {
    ...createEmptyCurrentAddress(),
    ...(data?.currentAddress || {}),
  },
});

const normalizeEmploymentForm = (data?: Partial<EmploymentProfile>) => ({
  ...createEmptyEmploymentForm(),
  ...data,
  employerAddress: {
    ...createEmptyEmployerAddress(),
    ...(data?.employerAddress || {}),
  },
});

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onProfileUpdate, className }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'passport' | 'employment' | 'education' | 'family'>('personal');
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState<Partial<UserProfile>>(createEmptyPersonalForm());
  const [passportForm, setPassportForm] = useState<Partial<PassportProfile>>({});
  const [employmentForm, setEmploymentForm] = useState<Partial<EmploymentProfile>>(createEmptyEmploymentForm());
  const [educationForm, setEducationForm] = useState<Partial<EducationProfile>>({});
  const [familyForm, setFamilyForm] = useState<Partial<FamilyProfile>>({});

  // Edit modes - will be used when edit functionality is implemented
  const [, setEditingEmploymentId] = useState<string | null>(null);
  const [, _setEditingEducationId] = useState<string | null>(null);
  const [, setEditingFamilyId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (): Promise<CompleteProfile | null> => {
    setIsLoading(true);
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        if (response.data.profile) {
          setPersonalForm(normalizePersonalForm(response.data.profile));
        } else {
          setPersonalForm(createEmptyPersonalForm());
        }
        if (response.data.passports?.[0]) {
          setPassportForm(response.data.passports[0]);
        }
        return response.data;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
      setPersonalForm(createEmptyPersonalForm());
      return null;
    } finally {
      setIsLoading(false);
    }

    setProfile(null);
    setPersonalForm(createEmptyPersonalForm());
    return null;
  };

  const refreshProfile = async () => {
    const updatedProfile = await loadProfile();
    if (updatedProfile && onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
  };

  const showSaveMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const validatePersonalForm = () => {
    const requiredFields: [string, string | undefined][] = [
      ['First name', personalForm.firstName],
      ['Last name', personalForm.lastName],
      ['Date of birth', personalForm.dateOfBirth],
      ['Place of birth', personalForm.placeOfBirth],
      ['Gender', personalForm.gender],
      ['Marital status', personalForm.maritalStatus],
      ['Nationality', personalForm.nationality],
      ['Email', personalForm.email],
      ['Phone', personalForm.phone],
      ['Country of birth', personalForm.countryOfBirth],
    ];

    for (const [label, value] of requiredFields) {
      if (!value || value.toString().trim() === '') {
        return `${label} is required`;
      }
    }

    const address = personalForm.currentAddress || createEmptyCurrentAddress();
    const addressFields: [string, string | undefined][] = [
      ['Street address', address.street],
      ['City', address.city],
      ['Postal code', address.postalCode],
      ['Country', address.country],
      ['Move-in date', address.fromDate],
    ];

    for (const [label, value] of addressFields) {
      if (!value || value.toString().trim() === '') {
        return `Current address ${label.toLowerCase()} is required`;
      }
    }

    return null;
  };

  const validateEmploymentForm = () => {
    const address = employmentForm.employerAddress || createEmptyEmployerAddress();
    const addressFields: [string, string | undefined][] = [
      ['Street address', address.street],
      ['City', address.city],
      ['Postal code', address.postalCode],
      ['Country', address.country],
    ];

    if (!employmentForm.employerName?.trim()) return 'Employer name is required';
    if (!employmentForm.jobTitle?.trim()) return 'Job title is required';
    if (!employmentForm.startDate?.trim()) return 'Employment start date is required';

    for (const [label, value] of addressFields) {
      if (!value || value.toString().trim() === '') {
        return `Employer ${label.toLowerCase()} is required`;
      }
    }

    return null;
  };

  const handleSavePersonal = async () => {
    const validationError = validatePersonalForm();
    if (validationError) {
      showSaveMessage('error', validationError);
      return;
    }

    setIsSaving(true);
    try {
      const preparedProfile = normalizePersonalForm(personalForm);
      const response = await profileApi.saveProfile(preparedProfile as UserProfile);
      if (response.success) {
        showSaveMessage('success', 'Personal information saved successfully');
        await refreshProfile();
      } else {
        showSaveMessage('error', response.error || 'Failed to save personal information');
      }
    } catch (error) {
      showSaveMessage('error', 'Error saving personal information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassport = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.savePassport({ ...passportForm, isActive: true } as PassportProfile);
      if (response.success) {
        showSaveMessage('success', 'Passport information saved successfully');
        await refreshProfile();
      } else {
        showSaveMessage('error', response.error || 'Failed to save passport information');
      }
    } catch (error) {
      showSaveMessage('error', 'Error saving passport information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmployment = async () => {
    const validationError = validateEmploymentForm();
    if (validationError) {
      showSaveMessage('error', validationError);
      return;
    }

    setIsSaving(true);
    try {
      const preparedEmployment = normalizeEmploymentForm(employmentForm);
      const response = await profileApi.saveEmployment(preparedEmployment as EmploymentProfile);
      if (response.success) {
        showSaveMessage('success', 'Employment record saved successfully');
        setEmploymentForm(createEmptyEmploymentForm());
        setEditingEmploymentId(null);
        await refreshProfile();
      } else {
        showSaveMessage('error', response.error || 'Failed to save employment record');
      }
    } catch (error) {
      showSaveMessage('error', 'Error saving employment record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEducation = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.saveEducation(educationForm as EducationProfile);
      if (response.success) {
        showSaveMessage('success', 'Education record saved successfully');
        setEducationForm({});
        await refreshProfile();
      } else {
        showSaveMessage('error', response.error || 'Failed to save education record');
      }
    } catch (error) {
      showSaveMessage('error', 'Error saving education record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFamilyMember = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.addFamilyMember(familyForm as FamilyProfile);
      if (response.success) {
        showSaveMessage('success', 'Family member added successfully');
        setFamilyForm({});
        setEditingFamilyId(null);
        await refreshProfile();
      } else {
        showSaveMessage('error', response.error || 'Failed to add family member');
      }
    } catch (error) {
      showSaveMessage('error', 'Error adding family member');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'passport', label: 'Passport', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'family', label: 'Family', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentAddress = personalForm.currentAddress || createEmptyCurrentAddress();
  const employerAddress = employmentForm.employerAddress || createEmptyEmployerAddress();

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
        <p className="text-gray-600 mt-1">Save your information once and reuse it across all visa applications</p>

        {/* Completion Status */}
        <div className="mt-4 flex items-center gap-2">
          {profile?.profile ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Profile Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Complete your profile to enable auto-fill</span>
            </div>
          )}
        </div>
      </div>

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

      {/* Save Message */}
      {saveMessage && (
        <div className={cn(
          "mx-6 mt-4 p-3 rounded-lg flex items-center gap-2",
          saveMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage.text}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={personalForm.firstName || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={personalForm.lastName || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={personalForm.middleName || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, middleName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Middle name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={personalForm.dateOfBirth || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth *</label>
                <input
                  type="text"
                  value={personalForm.placeOfBirth || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Birth *</label>
                <input
                  type="text"
                  value={personalForm.countryOfBirth || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, countryOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Country where you were born"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  value={personalForm.gender || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
                <select
                  value={personalForm.maritalStatus || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                <input
                  type="text"
                  value={personalForm.nationality || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={personalForm.email || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={personalForm.phone || ''}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <p className="text-sm font-semibold text-gray-900">Current Address</p>
                <p className="text-xs text-gray-500">Stored to auto-fill residential history on applications</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={currentAddress.street || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      street: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Unit</label>
                <input
                  type="text"
                  value={currentAddress.apartment || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      apartment: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Apt, suite, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={currentAddress.city || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      city: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  value={currentAddress.state || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      state: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="State or region"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  value={currentAddress.postalCode || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      postalCode: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Postal / ZIP code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={currentAddress.country || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      country: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date *</label>
                <input
                  type="date"
                  value={currentAddress.fromDate || ''}
                  onChange={(e) => setPersonalForm(prev => ({
                    ...prev,
                    currentAddress: {
                      ...(prev.currentAddress || createEmptyCurrentAddress()),
                      fromDate: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleSavePersonal}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Personal Information'}
            </button>
          </div>
        )}

        {/* Passport Tab */}
        {activeTab === 'passport' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number *</label>
                <input
                  type="text"
                  value={passportForm.passportNumber || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, passportNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="A12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Type *</label>
                <select
                  value={passportForm.passportType || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, passportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Regular">Regular</option>
                  <option value="Diplomatic">Diplomatic</option>
                  <option value="Official">Official</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={passportForm.issueDate || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={passportForm.expiryDate || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Country *</label>
                <input
                  type="text"
                  value={passportForm.issuingCountry || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, issuingCountry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Issue *</label>
                <input
                  type="text"
                  value={passportForm.placeOfIssue || ''}
                  onChange={(e) => setPassportForm({ ...passportForm, placeOfIssue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="New York"
                />
              </div>
            </div>

            <button
              onClick={handleSavePassport}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Passport Information'}
            </button>
          </div>
        )}

        {/* Employment Tab */}
        {activeTab === 'employment' && (
          <div className="space-y-6">
            {/* Employment History List */}
            {profile?.employment && profile.employment.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Employment History</h3>
                <div className="space-y-2">
                  {profile.employment.map((emp) => (
                    <div key={emp.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{emp.jobTitle} at {emp.employerName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(emp.startDate).toLocaleDateString()} - {emp.isCurrent ? 'Present' : emp.endDate ? new Date(emp.endDate).toLocaleDateString() : 'Present'}
                        </p>
                      </div>
                      {emp.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold">Add Employment Record</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={employmentForm.isCurrent || false}
                    onChange={(e) => setEmploymentForm(prev => ({ ...prev, isCurrent: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">This is my current job</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name *</label>
                <input
                  type="text"
                  value={employmentForm.employerName || ''}
                  onChange={(e) => setEmploymentForm(prev => ({ ...prev, employerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={employmentForm.jobTitle || ''}
                  onChange={(e) => setEmploymentForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={employmentForm.startDate || ''}
                  onChange={(e) => setEmploymentForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {!employmentForm.isCurrent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={employmentForm.endDate || ''}
                    onChange={(e) => setEmploymentForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="md:col-span-2 pt-2">
                <p className="text-sm font-semibold text-gray-900">Employer Address</p>
                <p className="text-xs text-gray-500">Used when auto-filling employment history</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={employerAddress.street || ''}
                  onChange={(e) => setEmploymentForm(prev => ({
                    ...prev,
                    employerAddress: {
                      ...(prev.employerAddress || createEmptyEmployerAddress()),
                      street: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 Business Ave"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={employerAddress.city || ''}
                  onChange={(e) => setEmploymentForm(prev => ({
                    ...prev,
                    employerAddress: {
                      ...(prev.employerAddress || createEmptyEmployerAddress()),
                      city: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input
                  type="text"
                  value={employerAddress.state || ''}
                  onChange={(e) => setEmploymentForm(prev => ({
                    ...prev,
                    employerAddress: {
                      ...(prev.employerAddress || createEmptyEmployerAddress()),
                      state: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="State or region"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  value={employerAddress.postalCode || ''}
                  onChange={(e) => setEmploymentForm(prev => ({
                    ...prev,
                    employerAddress: {
                      ...(prev.employerAddress || createEmptyEmployerAddress()),
                      postalCode: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Postal / ZIP code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={employerAddress.country || ''}
                  onChange={(e) => setEmploymentForm(prev => ({
                    ...prev,
                    employerAddress: {
                      ...(prev.employerAddress || createEmptyEmployerAddress()),
                      country: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Country"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEmployment}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isSaving ? 'Adding...' : 'Add Employment Record'}
            </button>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            {/* Education History List */}
            {profile?.education && profile.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Education History</h3>
                <div className="space-y-2">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-sm text-gray-600">{edu.institutionName}</p>
                        <p className="text-xs text-gray-500">
                          Graduated: {edu.graduationDate ? new Date(edu.graduationDate).getFullYear() : 'In Progress'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold">Add Education Record</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                <input
                  type="text"
                  value={educationForm.institutionName || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, institutionName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="University or School Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                <select
                  value={educationForm.degree || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="High School Diploma">High School Diploma</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                  <option value="Professional Degree">Professional Degree (MD, JD, etc.)</option>
                  <option value="Diploma">Diploma/Certificate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
                <input
                  type="text"
                  value={educationForm.fieldOfStudy || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Computer Science, Business Administration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={educationForm.startDate || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                <input
                  type="date"
                  value={educationForm.graduationDate || ''}
                  onChange={(e) => setEducationForm({ ...educationForm, graduationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if still studying</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={educationForm.institutionAddress?.country || ''}
                  onChange={(e) => setEducationForm({
                    ...educationForm,
                    institutionAddress: {
                      ...educationForm.institutionAddress,
                      city: educationForm.institutionAddress?.city || '',
                      country: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Country where institution is located"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={educationForm.institutionAddress?.city || ''}
                  onChange={(e) => setEducationForm({
                    ...educationForm,
                    institutionAddress: {
                      ...educationForm.institutionAddress,
                      country: educationForm.institutionAddress?.country || '',
                      city: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City where institution is located"
                />
              </div>
            </div>

            <button
              onClick={handleSaveEducation}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isSaving ? 'Adding...' : 'Add Education Record'}
            </button>
          </div>
        )}

        {/* Family Members Tab */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            {/* Family Members List */}
            {profile?.family && profile.family.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Family Members</h3>
                <div className="space-y-2">
                  {profile.family.map((member) => (
                    <div key={member.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                      </div>
                      {member.isMinor && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Minor</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold">Add Family Member</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                <select
                  value={familyForm.relationship || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={familyForm.firstName || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={familyForm.lastName || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={familyForm.dateOfBirth || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={familyForm.nationality || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nationality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  value={familyForm.passportNumber || ''}
                  onChange={(e) => setFamilyForm({ ...familyForm, passportNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Passport number (if applicable)"
                />
              </div>
            </div>

            <button
              onClick={handleSaveFamilyMember}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isSaving ? 'Adding...' : 'Add Family Member'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
