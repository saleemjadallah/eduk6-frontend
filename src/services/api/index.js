/**
 * API Services Index
 * Exports all API services for easy importing
 */

// Core API client and token manager
export { api, apiRequest, publicRequest, childRequest, API_BASE_URL } from './apiClient';
export { tokenManager } from './tokenManager';

// API services
export { authAPI, default as auth } from './authAPI';
export { consentAPI, default as consent } from './consentAPI';
export { profileAPI, default as profile } from './profileAPI';
export { childStatsAPI, default as childStats } from './childStatsAPI';
export { chatAPI, default as chat } from './chatAPI';
export { parentDashboardAPI, default as parentDashboard } from './parentDashboardAPI';

// Backward compatibility - deprecated, use api/apiClient directly
export { makeAuthenticatedRequest } from './apiUtils';
