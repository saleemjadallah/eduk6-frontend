import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { authAPI } from '../services/api/authAPI';
import { tokenManager } from '../services/api/tokenManager';
import { storageManager } from '../services/storage/storageManager';

const AUTO_SWITCH_DEFAULT_MINUTES = 15;
const PARENT_MODE_SESSION_KEY = 'orbitlearn_parent_mode';

const ModeContext = createContext(null);

/**
 * Mode Context Provider
 * Handles parent/child mode switching with backend PIN verification
 *
 * Security Improvements:
 * - PINs are NOT stored in localStorage (handled by backend)
 * - Child token is managed via tokenManager
 * - Mode switching requires backend PIN verification with brute force protection
 * - Auto-switch preferences are namespaced per user
 */
export function ModeProvider({ children }) {
  const navigate = useNavigate();

  // Try to get auth context - may not be available yet
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthProvider not available yet
  }

  const user = authContext?.user;
  const currentProfile = authContext?.currentProfile;
  const childProfiles = authContext?.children;

  // Check sessionStorage for persisted parent mode (survives page reloads like Stripe redirects)
  const getInitialMode = () => {
    try {
      const savedMode = sessionStorage.getItem(PARENT_MODE_SESSION_KEY);
      if (savedMode === 'true') {
        return 'parent';
      }
    } catch (e) {
      // sessionStorage not available
    }
    return 'child';
  };

  const [currentMode, setCurrentMode] = useState(getInitialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);
  const [autoSwitchMinutes, setAutoSwitchMinutes] = useState(AUTO_SWITCH_DEFAULT_MINUTES);
  const [pinError, setPinError] = useState(null);

  // Load mode preferences from namespaced storage
  useEffect(() => {
    if (user) {
      const prefs = storageManager.getUserPreferences();
      if (prefs?.autoSwitch) {
        setAutoSwitchEnabled(prefs.autoSwitch.enabled);
        setAutoSwitchMinutes(prefs.autoSwitch.minutes || AUTO_SWITCH_DEFAULT_MINUTES);
      }

      // Restore parent mode from session if available
      try {
        const savedMode = sessionStorage.getItem(PARENT_MODE_SESSION_KEY);
        if (savedMode === 'true') {
          setCurrentMode('parent');
          setLastActivity(new Date());
        }
      } catch (e) {
        // sessionStorage not available
      }
    }
  }, [user]);

  // Auto-switch to child mode after inactivity
  useEffect(() => {
    if (!autoSwitchEnabled || currentMode === 'child') return;

    const checkInactivity = setInterval(() => {
      const now = new Date();
      const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

      if (inactiveMinutes >= autoSwitchMinutes) {
        console.log('Auto-switching to child mode due to inactivity');
        switchToChildMode();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInactivity);
  }, [autoSwitchEnabled, autoSwitchMinutes, currentMode, lastActivity]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(new Date());

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  /**
   * Switch to parent mode with PIN verification
   * Uses backend for PIN verification (handles brute force protection)
   */
  const switchToParentMode = useCallback(async (pin) => {
    if (!user || !currentProfile) return { success: false, error: 'Not authenticated' };

    setIsTransitioning(true);
    setPinError(null);

    try {
      // Call backend to verify PIN and switch to child mode first
      // The backend's /auth/children/:childId/switch endpoint handles:
      // - PIN verification
      // - Brute force protection
      // - Child token generation
      const response = await authAPI.switchToChild(currentProfile.id, pin);

      if (response.success) {
        // Actually we want parent mode here, so clear the child token
        authAPI.switchToParent();
        setCurrentMode('parent');
        setLastActivity(new Date());

        // Persist parent mode to sessionStorage (survives page reloads like Stripe redirects)
        try {
          sessionStorage.setItem(PARENT_MODE_SESSION_KEY, 'true');
        } catch (e) {
          // sessionStorage not available
        }

        // Navigate to parent dashboard
        navigate('/parent/dashboard');

        setIsTransitioning(false);
        return { success: true };
      } else {
        const error = response.error || 'Invalid PIN';
        setPinError(error);
        setIsTransitioning(false);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Switch to parent mode error:', error);
      const errorMessage = error.message || 'Failed to verify PIN';
      setPinError(errorMessage);
      setIsTransitioning(false);
      return { success: false, error: errorMessage };
    }
  }, [user, currentProfile, navigate]);

  /**
   * Switch to child mode
   * Clears parent privileges but maintains child session
   */
  const switchToChildMode = useCallback(() => {
    // Set mode to child
    setCurrentMode('child');
    setPinError(null);

    // Clear parent mode from sessionStorage
    try {
      sessionStorage.removeItem(PARENT_MODE_SESSION_KEY);
    } catch (e) {
      // sessionStorage not available
    }

    // Navigate to child learning dashboard
    navigate('/learn');
  }, [navigate]);

  /**
   * Update auto-switch preferences
   */
  const updateAutoSwitch = useCallback((enabled, minutes) => {
    setAutoSwitchEnabled(enabled);
    if (minutes !== undefined) {
      setAutoSwitchMinutes(minutes);
    }

    // Save to namespaced storage
    const prefs = storageManager.getUserPreferences() || {};
    storageManager.setUserPreferences({
      ...prefs,
      autoSwitch: {
        enabled,
        minutes: minutes || autoSwitchMinutes,
      },
    });
  }, [autoSwitchMinutes]);

  /**
   * Clear PIN error
   */
  const clearPinError = useCallback(() => {
    setPinError(null);
  }, []);

  // Check if in parent mode based on current mode state
  const isParentMode = currentMode === 'parent';

  const value = useMemo(() => ({
    currentMode,
    isParentMode,
    isChildMode: currentMode === 'child',
    isTransitioning,
    pinError,
    currentChild: currentProfile,
    childProfiles,
    switchToChildMode,
    switchToParentMode,
    clearPinError,
    autoSwitchEnabled,
    autoSwitchMinutes,
    updateAutoSwitch,
  }), [
    currentMode,
    isParentMode,
    isTransitioning,
    pinError,
    currentProfile,
    childProfiles,
    switchToChildMode,
    switchToParentMode,
    clearPinError,
    autoSwitchEnabled,
    autoSwitchMinutes,
    updateAutoSwitch,
  ]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
}

export { ModeContext };
export default ModeContext;
