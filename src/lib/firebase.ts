import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
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
export { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
};
export type { ConfirmationResult };
