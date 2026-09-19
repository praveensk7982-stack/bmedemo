import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail as rawFetchSignInMethodsForEmail
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmqID8aqO378_g3H2m887Sa068AAszqV8",
  authDomain: "caremesh-app-345.firebaseapp.com",
  projectId: "caremesh-app-345",
  storageBucket: "caremesh-app-345.firebasestorage.app",
  messagingSenderId: "504626736580",
  appId: "1:504626736580:web:5326c10b91bb4c57cf4891",
  measurementId: "G-NKV4F7HETB"
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export async function fetchSignInMethodsForEmail(authObj: any, email: string): Promise<string[]> {
  if (typeof rawFetchSignInMethodsForEmail === 'function') {
    try {
      const res = await rawFetchSignInMethodsForEmail(authObj, email);
      if (Array.isArray(res)) return res;
    } catch (e) {
      console.warn('Firebase SDK fetchSignInMethodsForEmail warning:', e);
    }
  }

  // Fallback: Query Firebase Identity Toolkit API directly
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, continueUri: 'http://localhost' })
    });
    if (response.ok) {
      const data = await response.json();
      const methods = data.allProviders || data.signinMethods || [];
      return Array.isArray(methods) ? methods : [];
    }
  } catch (err) {
    console.warn('Firebase REST API createAuthUri fallback error:', err);
  }

  return [];
}

export { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
};
export type { ConfirmationResult };
