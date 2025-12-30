import React, { useEffect, useRef, useState, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ onSuccess, onError, disabled, text = 'continue_with' }) => {
  const buttonRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Use refs to store callbacks to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const handleCredentialResponse = useCallback((response) => {
    if (response.credential) {
      onSuccessRef.current?.(response.credential);
    } else {
      onErrorRef.current?.('No credential received from Google');
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    let isMounted = true;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !buttonRef.current || !isMounted) {
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear the container before rendering
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: Math.max(buttonRef.current.offsetWidth, 280),
          });
        }

        if (isMounted) {
          setIsLoaded(true);
          setScriptError(false);
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (isMounted) {
          setScriptError(true);
        }
        onErrorRef.current?.('Failed to initialize Google Sign-In');
      }
    };

    const loadGoogleScript = () => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        initializeGoogle();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        // Wait for it to load
        existingScript.addEventListener('load', initializeGoogle);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize immediately - script is ready
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        if (isMounted) {
          setScriptError(true);
        }
        onErrorRef.current?.('Failed to load Google Sign-In');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      isMounted = false;
    };
  }, [text, handleCredentialResponse]);

  // Re-render button when text prop changes
  useEffect(() => {
    if (isLoaded && window.google?.accounts?.id && buttonRef.current) {
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.max(buttonRef.current.offsetWidth, 280),
      });
    }
  }, [text, isLoaded]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  // Show error state with fallback button
  if (scriptError) {
    return (
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="google-signin-fallback"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '10px 24px',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          background: 'white',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '14px',
          color: '#3c4043',
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009.003 18z" fill="#34A853"/>
          <path d="M3.964 10.712A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.33z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9.002 3.58z" fill="#EA4335"/>
        </svg>
        <span>Retry Google Sign-In</span>
      </button>
    );
  }

  return (
    <div className="google-signin-container">
      <div
        ref={buttonRef}
        className={`google-signin-button ${disabled ? 'disabled' : ''}`}
        style={{
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          minHeight: '40px',
        }}
      />
      {!isLoaded && (
        <div className="google-signin-loading">
          <div className="loading-placeholder">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.33z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9.002 3.58z" fill="#EA4335"/>
            </svg>
            <span>{text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}</span>
          </div>
        </div>
      )}
      <style>{`
        .google-signin-container {
          width: 100%;
          min-height: 44px;
          position: relative;
        }
        .google-signin-button {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .google-signin-button.disabled {
          pointer-events: none;
        }
        .google-signin-button iframe {
          margin: 0 auto;
        }
        .google-signin-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .loading-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          background: white;
          font-family: 'Google Sans', Roboto, arial, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #1f1f1f;
          width: 100%;
          height: 40px;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .loading-placeholder:hover {
          background: #f8faff;
          border-color: #d2e3fc;
        }
      `}</style>
    </div>
  );
};

export default GoogleSignInButton;
