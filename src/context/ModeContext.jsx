import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AUTO_SWITCH_DEFAULT_MINUTES = 15;
const PIN_LENGTH = 4;

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get auth context - may not be available yet
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthProvider not available yet
  }

  const user = authContext?.user;

  const [currentMode, setCurrentMode] = useState('child');
  const [parentPinVerified, setParentPinVerified] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);
  const [autoSwitchMinutes, setAutoSwitchMinutes] = useState(AUTO_SWITCH_DEFAULT_MINUTES);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  // Load mode preferences from localStorage
  useEffect(() => {
    if (user) {
      const savedAutoSwitch = localStorage.getItem(`auto_switch_${user.id}`);

      if (savedAutoSwitch) {
        try {
          const { enabled, minutes } = JSON.parse(savedAutoSwitch);
          setAutoSwitchEnabled(enabled);
          setAutoSwitchMinutes(minutes || AUTO_SWITCH_DEFAULT_MINUTES);
        } catch (e) {
          // Invalid JSON, use defaults
        }
      }

      // Always start in child mode for safety
      setCurrentMode('child');
      setParentPinVerified(false);
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

  // Check if locked out from PIN attempts
  useEffect(() => {
    if (lockedUntil) {
      const now = new Date();
      if (now >= lockedUntil) {
        setLockedUntil(null);
        setPinAttempts(0);
      }
    }
  }, [lockedUntil]);

  const hasParentPin = useCallback(() => {
    if (!user) return false;
    const pin = localStorage.getItem(`parent_pin_${user.id}`);
    return !!pin;
  }, [user]);

  const setParentPin = useCallback(async (pin) => {
    if (!user) return false;

    // Validate PIN format
    if (pin.length !== PIN_LENGTH || !/^\d+$/.test(pin)) {
      return false;
    }

    // Store PIN (in production, should hash this)
    localStorage.setItem(`parent_pin_${user.id}`, pin);
    return true;
  }, [user]);

  const verifyParentPin = useCallback(async (pin) => {
    if (!user) return false;

    // Check if locked out
    if (lockedUntil && new Date() < lockedUntil) {
      return false;
    }

    const storedPin = localStorage.getItem(`parent_pin_${user.id}`);
    if (!storedPin) {
      // No PIN set, allow first-time setup
      return true;
    }

    const isValid = pin === storedPin;

    if (!isValid) {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);

      // Lock out after 5 failed attempts
      if (newAttempts >= 5) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15);
        setLockedUntil(lockTime);
      }
    } else {
      setPinAttempts(0);
    }

    return isValid;
  }, [user, pinAttempts, lockedUntil]);

  const switchToParentMode = useCallback(async (pin) => {
    if (!user) return false;

    // Check if locked out
    if (lockedUntil && new Date() < lockedUntil) {
      return false;
    }

    setIsTransitioning(true);

    try {
      // If no PIN exists, this is first-time setup
      if (!hasParentPin()) {
        const setupSuccess = await setParentPin(pin);
        if (!setupSuccess) {
          setIsTransitioning(false);
          return false;
        }
      } else {
        // Verify existing PIN
        const isValid = await verifyParentPin(pin);
        if (!isValid) {
          setIsTransitioning(false);
          return false;
        }
      }

      // Switch to parent mode
      setCurrentMode('parent');
      setParentPinVerified(true);
      setLastActivity(new Date());

      // Navigate to parent dashboard
      navigate('/parent/dashboard');

      setIsTransitioning(false);
      return true;
    } catch (error) {
      console.error('Switch to parent mode error:', error);
      setIsTransitioning(false);
      return false;
    }
  }, [user, hasParentPin, setParentPin, verifyParentPin, navigate, lockedUntil]);

  const switchToChildMode = useCallback(() => {
    // Set mode to child and clear parent verification
    setCurrentMode('child');
    setParentPinVerified(false);

    // Navigate to child learning dashboard
    // Using setTimeout to ensure state updates are processed first
    setTimeout(() => {
      navigate('/learn');
    }, 0);
  }, [navigate]);

  const updateAutoSwitch = useCallback((enabled, minutes) => {
    setAutoSwitchEnabled(enabled);
    if (minutes !== undefined) {
      setAutoSwitchMinutes(minutes);
    }

    if (user) {
      localStorage.setItem(
        `auto_switch_${user.id}`,
        JSON.stringify({ enabled, minutes: minutes || autoSwitchMinutes })
      );
    }
  }, [user, autoSwitchMinutes]);

  const getRemainingAttempts = useCallback(() => {
    return Math.max(0, 5 - pinAttempts);
  }, [pinAttempts]);

  const getTimeUntilUnlock = useCallback(() => {
    if (!lockedUntil) return null;
    const now = new Date();
    if (now >= lockedUntil) return null;
    return Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
  }, [lockedUntil]);

  const value = useMemo(() => ({
    currentMode,
    parentPinVerified,
    isTransitioning,
    switchToChildMode,
    switchToParentMode,
    verifyParentPin,
    setParentPin,
    hasParentPin: hasParentPin(),
    autoSwitchEnabled,
    autoSwitchMinutes,
    updateAutoSwitch,
    isLocked: lockedUntil && new Date() < lockedUntil,
    remainingAttempts: getRemainingAttempts(),
    timeUntilUnlock: getTimeUntilUnlock(),
  }), [
    currentMode,
    parentPinVerified,
    isTransitioning,
    switchToChildMode,
    switchToParentMode,
    verifyParentPin,
    setParentPin,
    hasParentPin,
    autoSwitchEnabled,
    autoSwitchMinutes,
    updateAutoSwitch,
    lockedUntil,
    getRemainingAttempts,
    getTimeUntilUnlock,
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
