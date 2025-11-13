import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
// New Firebase project: headshots-9f6d7
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD2fhurnntHZVNXoirkShm1_mjDqQSSJbg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "headshots-9f6d7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "headshots-9f6d7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "headshots-9f6d7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "690695804752",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:690695804752:web:9464a9bde83091dae77e55",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9W9F1H8F6Y",
};

// Validate configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn(
    `[Firebase] Missing configuration keys: ${missingKeys.join(', ')}. ` +
    'Google authentication will not work. Please check your environment variables.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('[Firebase] Analytics initialization failed:', error);
  }
}

// Setup Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account picker
});

// Optional: Add additional scopes if needed
// googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

/**
 * Sign in with Google using popup
 * Returns the Firebase ID token for backend authentication
 */
export async function signInWithGoogle(): Promise<string> {
  const { signInWithPopup } = await import('firebase/auth');

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    console.log('[Firebase] Google sign-in successful:', result.user.email);

    return idToken;
  } catch (error: any) {
    console.error('[Firebase] Google sign-in error:', error);

    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in popup is already open.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email address but different sign-in credentials.');
    }

    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutFromFirebase(): Promise<void> {
  try {
    await auth.signOut();
    console.log('[Firebase] Sign-out successful');
  } catch (error) {
    console.error('[Firebase] Sign-out error:', error);
    throw new Error('Failed to sign out from Firebase');
  }
}

export default app;
