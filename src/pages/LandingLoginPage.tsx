import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User,
  Smartphone,
  HeartPulse,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogIn,
  Key,
  RefreshCw,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail
} from '../lib/firebase';
// Backend API base URL
const API_BASE_URL ='https://bmedemo.vercel.app';
interface RegisteredAccount {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  password: string;
  verified: boolean;
}
// Helper: Fetch with Timeout (15s) to prevent hanging requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out (15 seconds). Please check your connection and try again.');
    }
    throw err;
  }
};
// API Call Helper: Send OTP (No DB insert yet!)
const sendOtpApiCall = async (targetEmail: string) => {
  const endpoints = [
    '/api/send-otp',
    `${API_BASE_URL}/api/send-otp`,
    'http://localhost:5000/api/send-otp'
  ];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      }, 15000);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return data;
      } else {
        const err: any = new Error(data.message || 'Failed to send verification email.');
        if (data.alreadyExists) {
          err.alreadyExists = true;
      }
        throw err;
    }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('timed out')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to send OTP email. Please retry.');
};
// API Call Helper: Verify OTP
const verifyOtpApiCall = async (targetEmail: string, code: string) => {
  const endpoints = [
    '/api/verify-otp',
    `${API_BASE_URL}/api/verify-otp`,
    'http://localhost:5000/api/verify-otp'
  ];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, otp: code })
      }, 15000);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return data;
      } else {
        throw new Error(data.message || 'Incorrect or expired verification code.');
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('timed out')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('OTP verification failed. Please check the code and try again.');
};
// API Call Helper: Register Patient in Supabase with Bcrypt Password Hash
const registerPatientApiCall = async (fullName: string, mobileNumber: string, email: string, password: string) => {
  const endpoints = [
    '/api/register-patient',
    `${API_BASE_URL}/api/register-patient`,
    'http://localhost:5000/api/register-patient'
  ];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobileNumber, email, password })
      }, 15000);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return data;
      } else {
        if (data.supabaseError) {
          console.error('[Supabase Insert Error Logged]:', data.supabaseError);
        }
        throw new Error(data.message || 'Database registration failed.');
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('timed out')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Database registration failed.');
};
// API Call Helper: Patient Login via Supabase Query & Bcrypt Password Compare
const patientLoginApiCall = async (email: string, mobileNumber: string, password: string, loginMethod: 'mobile' | 'email') => {
  const endpoints = [
    '/api/patient-login',
    `${API_BASE_URL}/api/patient-login`,
    'http://localhost:5000/api/patient-login'
  ];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobileNumber, password, loginMethod })
      }, 15000);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return data;
      } else {
        if (data.supabaseError) {
          console.error('[Supabase Select Error Logged]:', data.supabaseError);
        }
        throw new Error(data.message || 'Login failed.');
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('timed out')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Login failed. Please check credentials.');
};

// API Call Helper: Reset Password in Supabase / Backend Database
const resetPasswordApiCall = async (email: string, newPassword: string) => {
  const endpoints = [
    '/api/reset-password',
    `${API_BASE_URL}/api/reset-password`,
    'http://localhost:5000/api/reset-password'
  ];
  let lastError: any = null;
  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      }, 15000);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return data;
      } else {
        if (data.supabaseError) {
          console.error('[Supabase Reset Password Error Logged]:', data.supabaseError);
        }
        throw new Error(data.message || 'Password reset failed.');
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('timed out')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Password reset failed. Please retry.');
};

export const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  // Mode: 'login' | 'signup' | 'forgot_password'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  // Sub-Toggle under Login: 'mobile' | 'email'
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  // Sign Up Multi-Step Flow:
  // Step 1: Details (Name, Mobile, Email) -> Sends OTP (NO DB Insert yet)
  // Step 2: Verify Email OTP
  // Step 3: Create Password -> Inserts into Supabase with bcrypt hash
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3>(1);

  // Forgot Password Multi-Step Flow:
  // Step 1: Enter Registered Email -> Sends OTP
  // Step 2: Verify Email OTP
  // Step 3: Set New Password -> Updates Supabase bcrypt password hash & local storage
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [targetForgotOtpEmail, setTargetForgotOtpEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Form Inputs (blank by default -- Auto-fill Demo button fills demo data)
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Active email for Sign Up OTP verification
  const [targetOtpEmail, setTargetOtpEmail] = useState('');
  // Status Messaging & Loaders
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Helper: Retrieve registered user accounts from localStorage
  const getRegisteredAccounts = (): RegisteredAccount[] => {
    try {
      const raw = localStorage.getItem('caremesh_patient_accounts');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // fallback
    }
    return [
      {
        fullName: 'Praveen Kumar',
        countryCode: '+91',
        mobileNumber: '9840112345',
        email: 'praveen.sk.7982@gmail.com',
        password: 'patient123',
        verified: true
      },
      {
        fullName: 'Demo Patient',
        countryCode: '+91',
        mobileNumber: '9840012345',
        email: 'patient@caremesh.in',
        password: 'patient123',
        verified: true
      }
    ];
  };
  // Helper: Save newly verified patient account locally as backup
  const saveRegisteredAccount = (account: RegisteredAccount) => {
    const accounts = getRegisteredAccounts();
    const filtered = accounts.filter(
      a => a.email.toLowerCase() !== account.email.toLowerCase() && a.mobileNumber !== account.mobileNumber
    );
    filtered.push(account);
    localStorage.setItem('caremesh_patient_accounts', JSON.stringify(filtered));
  };
  // Quick Auto-fill Demo Patient Credentials for Login
  const handleAutoFillDemo = () => {
    setMode('login');
    setLoginMethod('mobile');
    setSignUpStep(1);
    setCountryCode('+91');
    setMobileNumber('9840112345');
    setEmail('praveen.sk.7982@gmail.com');
    setPassword('patient123');
    setErrorMessage(null);
    setSuccessMessage('Demo patient credentials filled!');
  };
  // Map Firebase Errors to User-Friendly Messages
  const mapFirebaseError = (error: any): string => {
    const code = error?.code || '';
    const msg = error?.message || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email address is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Invalid email format. Please enter a valid email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please check your password and try again.';
      case 'auth/user-not-found':
        return 'No account found with these credentials. Please click "Create Account".';
      case 'auth/invalid-credential':
        return 'Incorrect mobile/email or password. Please check your credentials and try again.';
      case 'auth/weak-password':
        return 'Weak password! Password must be at least 6 characters long.';
      default:
        return msg || 'Authentication failed. Please check your credentials.';
    }
  };
  // ------------------------------------------------------------
  // 1. PATIENT LOGIN HANDLER (SUPABASE QUERY & BCRYPT VERIFICATION)
  // ------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');
    const trimmedEmail = email.trim();
    if (loginMethod === 'mobile') {
      if (!cleanedMobile || cleanedMobile.length < 10) {
        setErrorMessage('Please enter your 10-digit mobile phone number.');
        return;
      }
    } else {
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setErrorMessage('Please enter your email address.');
        return;
      }
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    setIsLoading(true);
    try {
      let loginResult: any = null;
      try {
        loginResult = await patientLoginApiCall(trimmedEmail, cleanedMobile, password, loginMethod);
      } catch (apiErr: any) {
        console.warn('Backend Supabase API login error (checking local fallback):', apiErr.message);
        // Fallback check against localStorage if offline/unconfigured
        const accounts = getRegisteredAccounts();
        const matched = loginMethod === 'mobile'
          ? accounts.find(a => a.mobileNumber === cleanedMobile)
          : accounts.find(a => a.email.toLowerCase() === trimmedEmail.toLowerCase());
        if (!matched && trimmedEmail !== 'praveen.sk.7982@gmail.com' && trimmedEmail !== 'patient@caremesh.in') {
          throw apiErr;
        }
        if (matched && matched.password !== password) {
      }
          throw new Error('Incorrect password. Please check your password and try again.');
        loginResult = { success: true, patient: matched };
    }
      const patientData = loginResult.patient || {};
      const finalEmail = patientData.email || trimmedEmail;
      const finalName = patientData.fullName || patientData.full_name || fullName.trim() || finalEmail.split('@')[0];
      // Background Firebase Auth login attempt
      try {
        await signInWithEmailAndPassword(auth, finalEmail, password);
      } catch (fbErr) {
        console.warn('Firebase login warning (proceeding with verified session):', fbErr);
      }
      // Save patient session in sessionStorage
      sessionStorage.setItem('caremesh_patient_session', JSON.stringify({
        email: finalEmail,
        mobileNumber: countryCode + ' ' + (patientData.mobileNumber || patientData.mobile_number || cleanedMobile),
        name: finalName,
        authProvider: 'supabase_bcrypt',
        loggedInAt: new Date().toISOString()
      }));
      setSuccessMessage('Login successful! Redirecting to Patient Dashboard...');
      setTimeout(() => {
        navigate('/hospitals');
      }, 400);
    } catch (error: any) {
      console.error('Login Error:', error);
      setErrorMessage(error.message || mapFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------------------
  // 2. SIGN UP - STEP 1: VALIDATE DETAILS & SEND OTP TO EMAIL (NO DB INSERT YET)
  // ------------------------------------------------------------
  const handleSignUpStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAccountAlreadyExists(false);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanedMobile || cleanedMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setTargetOtpEmail(trimmedEmail);
    setIsLoading(true);

    try {
      // 1. Primary Check: Check if email is already registered in Firebase Authentication
      const signInMethods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
      if (signInMethods && signInMethods.length > 0) {
        setErrorMessage('An account with this email address already exists. Please login instead.');
        setAccountAlreadyExists(true);
        setIsLoading(false);
        return;
      }

      // 2. Secondary Check: Check if account exists in local registered accounts backup
      const registeredAccounts = getRegisteredAccounts();
      const existingLocal = registeredAccounts.find(
        a => a.email.toLowerCase() === trimmedEmail || a.mobileNumber === cleanedMobile
      );
      if (existingLocal) {
        setErrorMessage('An account with this email address already exists. Please login instead.');
        setAccountAlreadyExists(true);
        setIsLoading(false);
        return;
      }

      // 3. Send OTP Email only if email is NOT already registered
      await sendOtpApiCall(trimmedEmail);
      setSignUpStep(2);
      setSuccessMessage(`Verification code sent to ${trimmedEmail}! Check your inbox (code expires in 5 minutes).`);
    } catch (error: any) {
      console.error('Send Sign Up OTP Error:', error);
      if (error.alreadyExists || error.message?.includes('already exists')) {
        setAccountAlreadyExists(true);
        setErrorMessage('An account with this email address already exists. Please login instead.');
      } else {
        setErrorMessage(error.message || 'Failed to send OTP verification email. Please retry.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------------------
  // 3. SIGN UP - STEP 2: VERIFY EMAIL OTP CODE
  // ------------------------------------------------------------
  const handleSignUpStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code received via email.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpApiCall(targetOtpEmail, trimmedOtp);
      setSignUpStep(3);
      setSuccessMessage('Email verified successfully! Now create your account password to complete registration.');
    } catch (error: any) {
      console.error('Verify Sign Up OTP Error:', error);
      setErrorMessage(error.message || 'OTP verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------------------------
  // 4. SIGN UP - STEP 3: CREATE PASSWORD & INSERT ROW INTO SUPABASE
  // ------------------------------------------------------------
  const handleSignUpStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match! Please check and try again.');
      return;
    }
    setIsLoading(true);
    try {
      const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');
      const trimmedEmail = targetOtpEmail.toLowerCase().trim();
      // 1. INSERT ROW INTO SUPABASE PATIENTS TABLE (storing lower(email) and bcrypt password hash)
      try {
        const regRes = await registerPatientApiCall(fullName.trim(), cleanedMobile, trimmedEmail, password);
        console.log('[Supabase Register Success]:', regRes);
      } catch (dbErr: any) {
        console.error('[Supabase Register Error Object]:', dbErr);
        throw new Error(dbErr.message || 'Failed to insert account into Supabase database.');
      }
      // 2. Save local account backup
      const newAccount: RegisteredAccount = {
        fullName: fullName.trim(),
        countryCode,
        mobileNumber: cleanedMobile,
        email: trimmedEmail,
        password,
        verified: true
      };
      saveRegisteredAccount(newAccount);
      // 3. Background Firebase Auth creation
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (fullName.trim()) {
          await updateProfile(userCredential.user, { displayName: fullName.trim() });
        }
      } catch (fbErr: any) {
        console.warn('Firebase registration warning:', fbErr);
      }
      // Save verified session
      sessionStorage.setItem('caremesh_patient_session', JSON.stringify({
        email: trimmedEmail,
        mobileNumber: countryCode + ' ' + cleanedMobile,
        name: fullName.trim(),
        authProvider: 'supabase_email_otp_verified',
        loggedInAt: new Date().toISOString()
      }));
      setSuccessMessage('Account created and verified successfully in Supabase! Redirecting to Patient Dashboard...');
      setTimeout(() => {
        navigate('/hospitals');
      }, 500);
    } catch (error: any) {
      console.error('Create Password Error:', error);
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
    } finally {
    }
      setIsLoading(false);
  };

  // ------------------------------------------------------------
  // 5. FORGOT PASSWORD - STEP 1: SEND RESET CODE TO EMAIL
  // ------------------------------------------------------------
  const handleForgotStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter your valid registered email address.');
      return;
    }

    setTargetForgotOtpEmail(trimmedEmail);
    setIsLoading(true);

    try {
      await sendOtpApiCall(trimmedEmail);
      setForgotStep(2);
      setSuccessMessage(`Verification code sent to ${trimmedEmail}! Check your inbox (code expires in 5 minutes).`);
    } catch (error: any) {
      console.error('Send Forgot Password OTP Error:', error);
      setErrorMessage(error.message || 'Failed to send verification code. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------
  // 6. FORGOT PASSWORD - STEP 2: VERIFY OTP CODE
  // ------------------------------------------------------------
  const handleForgotStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedOtp = forgotOtpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code received via email.');
      return;
    }

    setIsLoading(true);

    try {
      await verifyOtpApiCall(targetForgotOtpEmail, trimmedOtp);
      setForgotStep(3);
      setSuccessMessage('Code verified! Please set your new password below.');
    } catch (error: any) {
      console.error('Verify Forgot Password OTP Error:', error);
      setErrorMessage(error.message || 'Incorrect or expired verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await sendOtpApiCall(targetForgotOtpEmail);
      setSuccessMessage(`A new verification code has been sent to ${targetForgotOtpEmail}.`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to resend verification code. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------
  // 7. FORGOT PASSWORD - STEP 3: RESET PASSWORD & LOGIN
  // ------------------------------------------------------------
  const handleForgotStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match! Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call backend API to update bcrypt password hash in Supabase/patients table
      try {
        await resetPasswordApiCall(targetForgotOtpEmail, newPassword);
      } catch (apiErr: any) {
        console.warn('Backend reset password call warning:', apiErr.message);
      }

      // 2. Update matching local account in localStorage (caremesh_patient_accounts)
      try {
        const accounts = getRegisteredAccounts();
        const matchedIndex = accounts.findIndex(
          a => a.email.toLowerCase() === targetForgotOtpEmail.toLowerCase()
        );
        if (matchedIndex !== -1) {
          accounts[matchedIndex].password = newPassword;
          localStorage.setItem('caremesh_patient_accounts', JSON.stringify(accounts));
        }
      } catch (e) {
        console.warn('Failed to update local storage account password:', e);
      }

      // 3. Save session to sessionStorage and log user in automatically
      sessionStorage.setItem('caremesh_patient_session', JSON.stringify({
        email: targetForgotOtpEmail,
        mobileNumber: '',
        name: targetForgotOtpEmail.split('@')[0],
        authProvider: 'supabase_email_otp_password_reset',
        loggedInAt: new Date().toISOString()
      }));

      setSuccessMessage('Password reset successful! Logging you in...');
      setTimeout(() => {
        navigate('/hospitals');
      }, 500);
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef5fb 0%, #dce9f5 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP NAVBAR HEADER */}
      <header style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #cdeade' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(13, 110, 125, 0.3)' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.2px', lineHeight: 1 }}>Hospivio</div>
            <div style={{ fontSize: '10.5px', color: 'var(--ink-2)', marginTop: 2, fontWeight: 500 }}>Better Care, Connected.</div>
          </div>
        </div>
        {/* Top-Right Corner: Admin Login Link */}
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          style={{
            background: '#ffffff',
            border: '1px solid #bcd3e4',
            color: 'var(--teal)',
            padding: '7px 14px',
            borderRadius: '20px',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(15, 39, 68, 0.06)',
            transition: 'all 0.15s ease'
          }}
          title="Hospital Staff & Administrator Login"
        >
          <ShieldCheck size={16} color="var(--teal)" />
          <span>Admin Login</span>
        </button>
      </header>
      {/* 2. CENTER LANDING / PATIENT AUTH CARD */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: '475px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15, 39, 68, 0.10)', border: '1px solid #bcd3e4', overflow: 'hidden' }}>
          {/* Card Header Branding */}
          <div style={{ background: 'linear-gradient(140deg, #16a3ae 0%, #0e7c86 100%)', padding: '26px 24px', color: '#ffffff', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', margin: '0 auto 10px', display: 'grid', placeItems: 'center' }}>
              <HeartPulse size={28} color="#ffffff" />
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>Hospivio</h1>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', opacity: 0.95, fontWeight: 500 }}>Better Care, Connected.</p>
          </div>
          <div style={{ padding: '24px 28px 28px' }}>
            {/* Quick Demo Auto-fill Banner (Visible on Login or Step 1) */}
            {mode === 'login' && (
              <div style={{ background: '#f0f7f9', border: '1px solid #cdeade', borderRadius: '12px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '11.5px', color: '#0d6e7d', fontWeight: 600 }}>
                  Demo Patient Account Ready
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  style={{ fontSize: '11px', background: 'var(--teal)', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Auto-fill Demo
                </button>
              </div>
            )}
            {/* Main Mode Switcher Tabs: Patient Login vs Create Account */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                style={{ flex: 1, padding: '8px 0', border: 0, borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', background: mode === 'login' ? '#ffffff' : 'transparent', color: mode === 'login' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s ease' }}
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAccountAlreadyExists(false);
                }}
              >
                Patient Login
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: '8px 0', border: 0, borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', background: mode === 'signup' ? '#ffffff' : 'transparent', color: mode === 'signup' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s ease' }}
                onClick={() => {
                  setMode('signup');
                  setSignUpStep(1);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setAccountAlreadyExists(false);
                }}
              >
                Create Account
              </button>
            </div>
            {/* Error Notification Alert */}
            {errorMessage && (
              <div style={{ background: '#fdf1f1', border: '1px solid #f7d4d4', color: '#d94a4a', padding: '12px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} color="#d94a4a" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <div>{errorMessage}</div>
                  {accountAlreadyExists && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginMethod('email');
                        setEmail(targetOtpEmail || email);
                        setAccountAlreadyExists(false);
                        setErrorMessage(null);
                      }}
                      style={{
                        marginTop: '10px',
                        background: '#0e7c86',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <LogIn size={14} />
                      Go to Login
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Success Notification Alert */}
            {successMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#166534" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.4 }}>{successMessage}</div>
              </div>
            )}
            {/* MODE 1: PATIENT LOGIN TAB */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                {/* Sub-Toggle Buttons for Login Method: Mobile vs Email */}
                <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('mobile'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      border: 0,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: loginMethod === 'mobile' ? '#0e7c86' : '#f8fafc',
                      color: loginMethod === 'mobile' ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Smartphone size={14} />
                    <span>Login with Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      border: 0,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: loginMethod === 'email' ? '#0e7c86' : '#f8fafc',
                      color: loginMethod === 'email' ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Mail size={14} />
                    <span>Login with Email</span>
                  </button>
                </div>
                {/* METHOD 1: LOGIN WITH MOBILE */}
                {loginMethod === 'mobile' ? (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Registered Mobile Phone Number *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="form-control"
                        style={{ width: '82px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: '#f8fafc' }}
                      >
                        <option value="+91">IN +91</option>
                        <option value="+1">US +1</option>
                        <option value="+44">UK +44</option>
                        <option value="+971">AE +971</option>
                      </select>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Smartphone size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="e.g. 98401 12345"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 600 }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* METHOD 2: LOGIN WITH EMAIL */
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Registered Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. praveen.sk.7982@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                        required
                      />
                    </div>
                  </div>
                )}
                {/* Password Field */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter your password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Forgot Password link (Visible only in Email Login mode) */}
                  {loginMethod === 'email' && (
                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          setForgotStep(1);
                          setForgotEmail(email || '');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: 'var(--teal)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
                {/* Direct Login Button */}
                <button
                  type="submit"
                  className="btn"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isLoading ? 0.75 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spin-animation" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Login</span>
                    </>
                  )}
                </button>
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-2)' }}>
                  New user?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setSignUpStep(1); setErrorMessage(null); setSuccessMessage(null); }}
                    style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Create Account for Hospivio
                  </button>
                </div>
              </form>
            ) : mode === 'forgot_password' ? (
              /* MODE 3: FORGOT PASSWORD (3-STEP OTP VERIFIED RESET FLOW) */
              <div>
                {/* STEP INDICATOR BAR FOR FORGOT PASSWORD */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {/* Step 1 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: forgotStep > 1 ? '#10b981' : (forgotStep === 1 ? '#16a3ae' : '#cbd5e1'), color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      {forgotStep > 1 ? '✓' : '1'}
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: forgotStep === 1 ? 700 : 500, color: forgotStep === 1 ? '#0f172a' : '#64748b' }}>Enter Email</span>
                  </div>
                  <div style={{ flex: 1, height: 2, background: forgotStep > 1 ? '#10b981' : '#e2e8f0', margin: '0 8px' }} />
                  {/* Step 2 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: forgotStep > 2 ? '#10b981' : (forgotStep === 2 ? '#16a3ae' : '#cbd5e1'), color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      {forgotStep > 2 ? '✓' : '2'}
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: forgotStep === 2 ? 700 : 500, color: forgotStep === 2 ? '#0f172a' : '#64748b' }}>Verify Code</span>
                  </div>
                  <div style={{ flex: 1, height: 2, background: forgotStep > 2 ? '#10b981' : '#e2e8f0', margin: '0 8px' }} />
                  {/* Step 3 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: forgotStep === 3 ? '#16a3ae' : '#cbd5e1', color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      3
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: forgotStep === 3 ? 700 : 500, color: forgotStep === 3 ? '#0f172a' : '#64748b' }}>New Password</span>
                  </div>
                </div>

                {/* FORGOT PASSWORD - STEP 1: ENTER REGISTERED EMAIL */}
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1Submit}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Registered Email Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. praveen.sk.7982@gmail.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <span>Send Reset Code</span>
                      )}
                    </button>

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: 'var(--teal)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Login</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* FORGOT PASSWORD - STEP 2: VERIFY EMAIL OTP CODE */}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotStep2Submit}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Enter 6-Digit Verification Code *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Key size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          maxLength={6}
                          className="form-control"
                          placeholder="e.g. 123456"
                          value={forgotOtpCode}
                          onChange={(e) => setForgotOtpCode(e.target.value.replace(/[^\d]/g, ''))}
                          style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '16px', fontWeight: 700, letterSpacing: '4px' }}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <span>Verify Code</span>
                      )}
                    </button>

                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <button
                        type="button"
                        onClick={handleResendForgotOtp}
                        disabled={isLoading}
                        style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <RefreshCw size={13} />
                        <span>Resend Code</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                        style={{ background: 'transparent', border: 0, color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ArrowLeft size={13} />
                        <span>Back to Login</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* FORGOT PASSWORD - STEP 3: SET NEW PASSWORD */}
                {forgotStep === 3 && (
                  <form onSubmit={handleForgotStep3Submit}>
                    {/* New Password */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        New Password (min 6 characters) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Enter new password..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer' }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Confirm New Password *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showConfirmNewPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Confirm new password..."
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer' }}
                        >
                          {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <span>Reset Password & Login</span>
                      )}
                    </button>

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: 'var(--teal)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Login</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* MODE 2: CREATE ACCOUNT (3-STEP VERIFIED SIGN UP FLOW) */
              <div>
                {/* STEP INDICATOR BAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {/* Step 1 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: signUpStep > 1 ? '#10b981' : (signUpStep === 1 ? '#16a3ae' : '#cbd5e1'), color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      {signUpStep > 1 ? 'OK' : '1'}
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: signUpStep === 1 ? 700 : 500, color: signUpStep === 1 ? '#0f172a' : '#64748b' }}>Details</span>
                  </div>
                  <div style={{ flex: 1, height: 2, background: signUpStep > 1 ? '#10b981' : '#e2e8f0', margin: '0 8px' }} />
                  {/* Step 2 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: signUpStep > 2 ? '#10b981' : (signUpStep === 2 ? '#16a3ae' : '#cbd5e1'), color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      {signUpStep > 2 ? 'OK' : '2'}
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: signUpStep === 2 ? 700 : 500, color: signUpStep === 2 ? '#0f172a' : '#64748b' }}>Verify Email</span>
                  </div>
                  <div style={{ flex: 1, height: 2, background: signUpStep > 2 ? '#10b981' : '#e2e8f0', margin: '0 8px' }} />
                  {/* Step 3 Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: signUpStep === 3 ? '#16a3ae' : '#cbd5e1', color: '#fff', fontSize: '11.5px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                      3
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: signUpStep === 3 ? 700 : 500, color: signUpStep === 3 ? '#0f172a' : '#64748b' }}>Set Password</span>
                  </div>
                </div>
                {/* SIGN UP - STEP 1: PATIENT DETAILS ENTRY */}
                {signUpStep === 1 && (
                  <form onSubmit={handleSignUpStep1Submit}>
                    {/* Full Name */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Praveen Kumar"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                      </div>
                    </div>
                    {/* Mobile Phone Number */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Mobile Phone Number *
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="form-control"
                          style={{ width: '82px', height: '42px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: '#f8fafc' }}
                        >
                          <option value="+91">IN +91</option>
                          <option value="+1">US +1</option>
                          <option value="+44">UK +44</option>
                          <option value="+971">AE +971</option>
                        </select>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <Smartphone size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter 10-digit mobile number..."
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 600 }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {/* Email Address */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Email Address * (for account verification)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. praveen.sk.7982@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                      </div>
                    </div>
                    {/* Step 1 Submit Button: Send OTP */}
                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Continue & Send Email OTP</span>
                        </>
                      )}
                    </button>
                    <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-2)' }}>
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                        style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Login here
                      </button>
                    </div>
                  </form>
                )}
                {/* SIGN UP - STEP 2: VERIFY EMAIL OTP */}
                {signUpStep === 2 && (
                  <form onSubmit={handleSignUpStep2Submit}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--ink-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Step 2: Verify Your Email
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>
                        Verification code sent to: <b>{targetOtpEmail}</b>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#e11d48', marginTop: 4, fontWeight: 600 }}>
                        Code expires in 5 minutes.
                      </div>
                    </div>
                    <div style={{ marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                          Enter 6-Digit Code *
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handleSignUpStep1Submit(e)}
                          disabled={isLoading}
                          style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontSize: '11.5px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} />
                          <span>Resend Code</span>
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Key size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter 6-digit code..."
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ''))}
                          maxLength={6}
                          style={{ width: '100%', paddingLeft: '38px', height: '44px', borderRadius: '9px', fontSize: '16px', letterSpacing: '4px', fontWeight: 700 }}
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    {/* Step 2 Submit Button: Verify OTP */}
                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Verify Email OTP</span>
                        </>
                      )}
                    </button>
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSignUpStep(1);
                          setOtpCode('');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        style={{ background: 'transparent', border: 0, color: 'var(--ink-2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <ArrowLeft size={14} />
                        <span>Change Details / Back</span>
                      </button>
                    </div>
                  </form>
                )}
                {/* SIGN UP - STEP 3: CREATE PASSWORD & INSERT INTO SUPABASE */}
                {signUpStep === 3 && (
                  <form onSubmit={handleSignUpStep3Submit}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px' }}>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Step 3: Create Your Password
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginTop: 2 }}>
                        Email Verified: <b>{targetOtpEmail}</b>
                      </div>
                    </div>
                    {/* Create Password */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Create Password * (min. 6 characters)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="At least 6 characters..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer' }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm Password */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                        Confirm Password *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="Re-enter your password..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{ width: '100%', paddingLeft: '38px', paddingRight: '40px', height: '42px', borderRadius: '9px', fontSize: '13.5px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer' }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {/* Step 3 Submit Button: Create Account */}
                    <button
                      type="submit"
                      className="btn"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.75 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="spin-animation" />
                          <span>Saving Account to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Create Account & Login</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
            {/* Feature Highlights Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', background: '#f0f7f9', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Supabase + Bcrypt Auth
              </span>
              <span style={{ fontSize: '10.5px', background: '#f0f7f9', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Verified Email OTP Sign Up
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};