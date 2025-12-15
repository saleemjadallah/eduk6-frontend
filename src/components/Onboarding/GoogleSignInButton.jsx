import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ onSuccess, onError, disabled, text = 'continue_with' }) => {
  const buttonRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onError?.('Failed to load Google Sign-In');
      };
      document.body.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 320,
          });
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        onError?.('Failed to initialize Google Sign-In');
      }
    };

    const handleCredentialResponse = (response) => {
      if (response.credential) {
        onSuccess?.(response.credential);
      } else {
        onError?.('No credential received from Google');
      }
    };

    if (GOOGLE_CLIENT_ID) {
      loadGoogleScript();
    } else {
      console.warn('Google Client ID not configured');
    }

    return () => {
      // Cleanup if needed
    };
  }, [onSuccess, onError, text]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="google-signin-container">
      <div
        ref={buttonRef}
        className={`google-signin-button ${disabled ? 'disabled' : ''}`}
        style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
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
            <span>Continue with Google</span>
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
          padding: 10px 24px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          background: white;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          color: #3c4043;
          width: 100%;
          max-width: 320px;
        }
      `}</style>
    </div>
  );
};

export default GoogleSignInButton;
