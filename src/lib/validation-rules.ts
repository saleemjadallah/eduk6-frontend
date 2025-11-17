// ===================================
// FORM VALIDATION RULES ENGINE
// ===================================

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'date' | 'dependency' | 'custom';
  params?: any;
  message: string;
}

export interface FieldValidation {
  fieldId: string;
  rules: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    fieldId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }[];
}

// Country-specific validation requirements
export const countryValidationRules: Record<string, any> = {
  singapore: {
    passportValidityMonths: 6,
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: /^\+65\s?\d{8}$/,
    postalCodeFormat: /^\d{6}$/,
    specificRules: {
      arrivalCard: {
        flightNumber: {
          format: /^[A-Z]{2}\d{1,4}$/,
          message: 'Flight number must be in format XX123 (e.g., SQ123)'
        }
      }
    }
  },
  uae: {
    passportValidityMonths: 6,
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: /^\+971\s?\d{8,9}$/,
    emiratesIdFormat: /^\d{3}-\d{4}-\d{7}-\d{1}$/,
    specificRules: {
      sponsorRequired: true,
      attestedDocuments: ['degree', 'marriage_certificate'],
    }
  },
  schengen: {
    passportValidityMonths: 3,
    dateFormat: 'DD/MM/YYYY',
    travelInsuranceMinimum: 30000, // EUR
    proofOfAccommodation: true,
    bankStatementMonths: 3,
    specificRules: {
      multipleEntry: {
        requiresPreviousVisas: true,
        message: 'Multiple entry visa requires proof of previous Schengen visas'
      }
    }
  },
  usa: {
    passportValidityMonths: 6,
    dateFormat: 'MM/DD/YYYY',
    phoneFormat: /^\+1\s?\d{10}$/,
    ds160Required: true,
    specificRules: {
      socialMedia: {
        required: true,
        platforms: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'],
        years: 5
      }
    }
  },
  uk: {
    passportValidityMonths: 6,
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: /^\+44\s?\d{10,11}$/,
    tbTestRequired: ['India', 'Pakistan', 'Bangladesh', 'Nigeria'],
    specificRules: {
      maintenance: {
        studentVisa: 1334, // GBP per month
        workVisa: 1270, // GBP
      }
    }
  },
  canada: {
    passportValidityMonths: 6,
    dateFormat: 'YYYY-MM-DD',
    phoneFormat: /^\+1\s?\d{10}$/,
    biometricsRequired: true,
    specificRules: {
      eta: {
        validityYears: 5,
        fee: 7, // CAD
      }
    }
  },
  thailand: {
    passportValidityMonths: 6,
    dateFormat: 'DD/MM/YYYY',
    onwardTicketRequired: true,
    accommodationProof: true,
    specificRules: {
      touristVisa: {
        maxStayDays: 60,
        extensionPossible: true,
        extensionDays: 30
      }
    }
  }
};

// Common field validators
export const fieldValidators = {
  // Date validators
  dateValidator: (value: string, format: string): boolean => {
    const formats: Record<string, RegExp> = {
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
    };
    return formats[format]?.test(value) || false;
  },

  // Date comparison
  dateNotPast: (value: string): boolean => {
    const date = new Date(value);
    return date >= new Date();
  },

  // Passport expiry validator
  passportExpiryValidator: (expiryDate: string, requiredMonths: number, travelDate?: string): ValidationResult => {
    const expiry = new Date(expiryDate);
    const checkDate = travelDate ? new Date(travelDate) : new Date();
    checkDate.setMonth(checkDate.getMonth() + requiredMonths);

    if (expiry < checkDate) {
      return {
        isValid: false,
        errors: [{
          fieldId: 'passport_expiry',
          message: `Passport must be valid for at least ${requiredMonths} months from ${travelDate ? 'travel date' : 'today'}`,
          severity: 'error'
        }]
      };
    }

    // Warning if expiring within 1 year
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (expiry < oneYearFromNow) {
      return {
        isValid: true,
        errors: [{
          fieldId: 'passport_expiry',
          message: 'Consider renewing your passport - expires within 1 year',
          severity: 'warning'
        }]
      };
    }

    return { isValid: true, errors: [] };
  },

  // Email validator
  emailValidator: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Phone validator
  phoneValidator: (phone: string, country?: string): boolean => {
    if (country && countryValidationRules[country]?.phoneFormat) {
      return countryValidationRules[country].phoneFormat.test(phone);
    }
    // Generic international phone format
    return /^\+\d{1,3}\s?\d{6,14}$/.test(phone);
  },

  // Name validators
  nameValidator: (name: string): ValidationResult => {
    const errors = [];

    if (name.length < 2) {
      errors.push({
        fieldId: 'name',
        message: 'Name must be at least 2 characters',
        severity: 'error' as const
      });
    }

    if (/\d/.test(name)) {
      errors.push({
        fieldId: 'name',
        message: 'Name should not contain numbers',
        severity: 'warning' as const
      });
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(name)) {
      errors.push({
        fieldId: 'name',
        message: 'Name contains special characters',
        severity: 'warning' as const
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  },

  // Address validator
  addressValidator: (address: any): ValidationResult => {
    const errors = [];

    if (!address.street || address.street.length < 5) {
      errors.push({
        fieldId: 'address_street',
        message: 'Street address is too short',
        severity: 'error' as const
      });
    }

    if (!address.city || address.city.length < 2) {
      errors.push({
        fieldId: 'address_city',
        message: 'City is required',
        severity: 'error' as const
      });
    }

    if (!address.country) {
      errors.push({
        fieldId: 'address_country',
        message: 'Country is required',
        severity: 'error' as const
      });
    }

    if (!address.postalCode) {
      errors.push({
        fieldId: 'address_postal',
        message: 'Postal code is required',
        severity: 'warning' as const
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }
};

// Field dependency validators
export const dependencyValidators = {
  // If married, spouse details required
  maritalStatusDependency: (maritalStatus: string, spouseData: any): ValidationResult => {
    if (maritalStatus === 'Married' && !spouseData) {
      return {
        isValid: false,
        errors: [{
          fieldId: 'spouse_details',
          message: 'Spouse information is required when marital status is Married',
          severity: 'error'
        }]
      };
    }
    return { isValid: true, errors: [] };
  },

  // If traveling with minors, guardian consent required
  minorTravelDependency: (hasMinors: boolean, guardianConsent: any): ValidationResult => {
    if (hasMinors && !guardianConsent) {
      return {
        isValid: false,
        errors: [{
          fieldId: 'guardian_consent',
          message: 'Guardian consent letter is required when traveling with minors',
          severity: 'error'
        }]
      };
    }
    return { isValid: true, errors: [] };
  },

  // Employment status dependencies
  employmentDependency: (employmentStatus: string, employerDetails: any): ValidationResult => {
    if (employmentStatus === 'Employed' && !employerDetails) {
      return {
        isValid: false,
        errors: [{
          fieldId: 'employer_details',
          message: 'Employer information is required',
          severity: 'error'
        }]
      };
    }

    if (employmentStatus === 'Student' && !employerDetails?.institution) {
      return {
        isValid: false,
        errors: [{
          fieldId: 'institution_details',
          message: 'Educational institution information is required',
          severity: 'error'
        }]
      };
    }

    return { isValid: true, errors: [] };
  }
};

// Smart field mapping suggestions
export const smartFieldMapper = {
  // Map common field variations to standard names
  fieldNameVariations: {
    firstName: ['first_name', 'given_name', 'givenName', 'forename', 'prenom'],
    lastName: ['last_name', 'family_name', 'familyName', 'surname', 'nom'],
    dateOfBirth: ['date_of_birth', 'birth_date', 'birthDate', 'dob', 'birthday'],
    nationality: ['citizenship', 'citizen_of', 'country_of_citizenship'],
    passportNumber: ['passport_no', 'passport_num', 'document_number'],
    email: ['email_address', 'e_mail', 'electronic_mail'],
    phone: ['telephone', 'mobile', 'contact_number', 'phone_number'],
    address: ['residence', 'residential_address', 'home_address'],
  },

  // Find best match for a field
  findBestMatch: (fieldName: string): string | null => {
    const normalizedField = fieldName.toLowerCase().replace(/[_-]/g, '');

    for (const [standard, variations] of Object.entries(smartFieldMapper.fieldNameVariations)) {
      if (variations.some(v => v.toLowerCase().replace(/[_-]/g, '') === normalizedField)) {
        return standard;
      }
    }

    return null;
  },

  // Calculate confidence score for auto-fill
  calculateConfidence: (fieldName: string, mappedField: string): number => {
    const normalized = fieldName.toLowerCase().replace(/[_-]/g, '');
    const mapped = mappedField.toLowerCase().replace(/[_-]/g, '');

    if (normalized === mapped) return 1.0;
    if (normalized.includes(mapped) || mapped.includes(normalized)) return 0.9;
    if (smartFieldMapper.findBestMatch(fieldName) === mappedField) return 0.85;

    return 0.5;
  }
};

// Main validation function
export const validateForm = (
  formData: Record<string, any>,
  country: string,
  _visaType: string
): ValidationResult => {
  const errors: ValidationResult['errors'] = [];
  const countryRules = countryValidationRules[country.toLowerCase()] || {};

  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'passportNumber'];
  for (const field of requiredFields) {
    if (!formData[field]) {
      errors.push({
        fieldId: field,
        message: `${field.replace(/([A-Z])/g, ' $1').trim()} is required`,
        severity: 'error'
      });
    }
  }

  // Validate date formats
  if (formData.dateOfBirth && countryRules.dateFormat) {
    if (!fieldValidators.dateValidator(formData.dateOfBirth, countryRules.dateFormat)) {
      errors.push({
        fieldId: 'dateOfBirth',
        message: `Date must be in format ${countryRules.dateFormat}`,
        severity: 'error'
      });
    }
  }

  // Validate passport expiry
  if (formData.passportExpiry && countryRules.passportValidityMonths) {
    const passportValidation = fieldValidators.passportExpiryValidator(
      formData.passportExpiry,
      countryRules.passportValidityMonths,
      formData.travelDate
    );
    errors.push(...passportValidation.errors);
  }

  // Validate email
  if (formData.email && !fieldValidators.emailValidator(formData.email)) {
    errors.push({
      fieldId: 'email',
      message: 'Invalid email format',
      severity: 'error'
    });
  }

  // Validate phone
  if (formData.phone && !fieldValidators.phoneValidator(formData.phone, country.toLowerCase())) {
    errors.push({
      fieldId: 'phone',
      message: `Phone number format incorrect for ${country}`,
      severity: 'warning'
    });
  }

  // Check dependencies
  const maritalValidation = dependencyValidators.maritalStatusDependency(
    formData.maritalStatus,
    formData.spouseDetails
  );
  errors.push(...maritalValidation.errors);

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
};

// Helper function to format validation messages for users
export const formatValidationMessage = (error: ValidationResult['errors'][0]): string => {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return `${icons[error.severity]} ${error.message}`;
};