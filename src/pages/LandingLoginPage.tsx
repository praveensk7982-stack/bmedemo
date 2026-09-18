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
  updateProfile 
} from '../lib/firebase';

// Backend API base URL (Vercel deployment) — needed so mobile app (Capacitor) 
// can reach the API even though it loads from local files, not the website domain
const API_BASE_URL = 'https://bmedemo-agn7.vercel.app';

interface RegisteredAccount {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  password: string;
  verified: boolean;
}

export const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Top Level Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Sub-Toggle under Login: 'mobile' | 'email'
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');

  // Flow Step: Step 1 (Credentials entry) vs Step 2 (Sign Up One-Time Email OTP Verification)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Inputs
  const [fullName, setFullName] = useState('Praveen Kumar');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('9840112345');
  const [email, setEmail] = useState('praveen.sk.7982@gmail.com');
  const [password, setPassword] = useState('patient123');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active email for Sign Up OTP verification
  const [targetOtpEmail, setTargetOtpEmail] = useState('praveen.sk.7982@gmail.com');

  // Status Messaging & Loaders
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  // Helper: Save newly verified patient account
  const saveRegisteredAccount = (account: RegisteredAccount) => {
    const accounts = getRegisteredAccounts();
    const filtered = accounts.filter(
      a => a.email.toLowerCase() !== account.email.toLowerCase() && a.mobileNumber !== account.mobileNumber
    );
    filtered.push(account);
    localStorage.setItem('caremesh_patient_accounts', JSON.stringify(filtered));
  };

  // Quick Auto-fill Demo Patient Credentials
  const handleAutoFillDemo = () => {
    setMode('login');
    setLoginMethod('mobile');
    setStep(1);
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
        return 'No account found with these credentials. Please click "Sign up".';
      case 'auth/invalid-credential':
        return 'Incorrect mobile/email or password. Please check your credentials and try again.';
      case 'auth/weak-password':
        return 'Weak password! Password must be at least 6 characters long.';
      default:
        return msg || 'Authentication failed. Please check your credentials.';
    }
  };

  // -------------------------------------------------------------
  // 1. REGULAR PATIENT LOGIN HANDLER (PASSWORD ONLY - NO OTP REQUIRED!)
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const accounts = getRegisteredAccounts();
    let matchedAccount: RegisteredAccount | undefined;

    if (loginMethod === 'mobile') {
      const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');
      if (!cleanedMobile || cleanedMobile.length < 10) {
        setErrorMessage('Please enter your 10-digit mobile phone number.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }

      // Check mobile number against stored accounts
      matchedAccount = accounts.find(a => a.mobileNumber === cleanedMobile);

      if (!matchedAccount) {
        setErrorMessage('No account found with this mobile number. Please sign up.');
        return;
      }

      if (matchedAccount.password !== password) {
        setErrorMessage('Incorrect password. Please check your password and try again.');
        return;
      }

    } else {
      // Login with Email
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }

      // Check email against stored accounts
      matchedAccount = accounts.find(a => a.email.toLowerCase() === trimmedEmail.toLowerCase());

      if (!matchedAccount && trimmedEmail !== 'praveen.sk.7982@gmail.com' && trimmedEmail !== 'patient@caremesh.in') {
        setErrorMessage('No account found with this email address. Please sign up.');
        return;
      }

      if (matchedAccount && matchedAccount.password !== password) {
        setErrorMessage('Incorrect password. Please check your password and try again.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const loginEmail = matchedAccount ? matchedAccount.email : email.trim();

      // Attempt Firebase login in background
      try {
        await signInWithEmailAndPassword(auth, loginEmail, password);
      } catch (fbErr) {
        console.warn('Firebase login warning (proceeding with verified session):', fbErr);
      }

      // Save patient session in sessionStorage
      sessionStorage.setItem('caremesh_patient_session', JSON.stringify({
        email: loginEmail,
        mobileNumber: matchedAccount ? (matchedAccount.countryCode + ' ' + matchedAccount.mobileNumber) : (countryCode + ' ' + mobileNumber),
        name: matchedAccount ? matchedAccount.fullName : (fullName.trim() || loginEmail.split('@')[0]),
        authProvider: 'password_direct',
        loggedInAt: new Date().toISOString()
      }));

      setSuccessMessage('Login successful! Redirecting to Patient Dashboard...');

      // Immediately redirect to Patient Dashboard (NO OTP Required!)
      setTimeout(() => {
        navigate('/hospitals');
      }, 400);
    } catch (error: any) {
      console.error('Login Error:', error);
      setErrorMessage(mapFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. SIGN UP HANDLER (CREATES ACCOUNT & SENDS ONE-TIME EMAIL OTP)
  // -------------------------------------------------------------
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
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

    if (!password || password.length < 6) {
      setErrorMessage('Weak password! Password must be at least 6 characters long.');
      return;
    }

    // Check if account already exists
    const accounts = getRegisteredAccounts();
    const existing = accounts.find(
      a => a.email.toLowerCase() === trimmedEmail.toLowerCase() || a.mobileNumber === cleanedMobile
    );

    if (existing) {
      setErrorMessage('An account with this email or mobile number already exists. Please login instead.');
      return;
    }

    setTargetOtpEmail(trimmedEmail);
    setIsLoading(true);

    try {
      // Call Backend API to send 6-digit One-Time OTP email via Nodemailer / Gmail SMTP
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setStep(2);
      setSuccessMessage(`Account verification code sent to ${trimmedEmail}! Check your inbox (expires in 5 minutes).`);
    } catch (error: any) {
      console.error('Send Sign Up OTP Error:', error);
      setErrorMessage(error.message || 'Failed to send verification email via SMTP server.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. SIGN UP ONE-TIME OTP VERIFICATION & ACCOUNT ACTIVATION
  // -------------------------------------------------------------
  const handleVerifySignUpOtp = async (e: React.FormEvent) => {
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
      // 1. Verify OTP with Backend API
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetOtpEmail, otp: trimmedOtp })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Incorrect or expired OTP code.');
      }

      // 2. Mark account as VERIFIED and save both mobile and email to persistent store
      const cleanedMobile = mobileNumber.replace(/[^\d]/g, '');
      const newAccount: RegisteredAccount = {
        fullName: fullName.trim(),
        countryCode,
        mobileNumber: cleanedMobile,
        email: targetOtpEmail,
        password,
        verified: true
      };
      saveRegisteredAccount(newAccount);

      // 3. Firebase Auth account creation
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, targetOtpEmail, password);
        if (fullName.trim()) {
          await updateProfile(userCredential.user, { displayName: fullName.trim() });
        }
      } catch (fbErr: any) {
        console.warn('Firebase registration warning:', fbErr);
      }

      // Save verified session
      sessionStorage.setItem('caremesh_patient_session', JSON.stringify({
        email: targetOtpEmail,
        mobileNumber: countryCode + ' ' + cleanedMobile,
        name: fullName.trim(),
        authProvider: 'firebase_email_otp',
        loggedInAt: new Date().toISOString()
      }));

      setSuccessMessage('Account verified successfully! Redirecting to Patient Dashboard...');

      setTimeout(() => {
        navigate('/hospitals');
      }, 500);
    } catch (error: any) {
      console.error('Verify Sign Up OTP Error:', error);
      if (error.code) {
        setErrorMessage(mapFirebaseError(error));
      } else {
        setErrorMessage(error.message || 'OTP verification failed. Please check the code and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef5fb 0%, #dce9f5 100%)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP NAVBAR HEADER with Admin Login Button in Top-Right Corner */}
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

        {/* Top-Right Corner: Small "Admin Login" Link / Button */}
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

      {/* 2. CENTER LANDING / PATIENT LOGIN SECTION */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: '475px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15, 39, 68, 0.10)', border: '1px solid #bcd3e4', overflow: 'hidden' }}>
          
          {/* Card Header Branding */}
          <div style={{ background: 'linear-gradient(140deg, #16a3ae 0%, #0e7c86 100%)', padding: '28px 24px', color: '#ffffff', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}>
              <HeartPulse size={32} color="#ffffff" />
            </div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>Hospivio</h1>
            <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.95, fontWeight: 500 }}>Better Care, Connected.</p>
          </div>

          <div style={{ padding: '24px 28px 28px' }}>
            
            {/* Quick Demo Auto-fill Banner */}
            {step === 1 && (
              <div style={{ background: '#f0f7f9', border: '1px solid #cdeade', borderRadius: '12px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '11.5px', color: '#0d6e7d', fontWeight: 600 }}>
                  💡 Demo Patient Account Ready
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
            {step === 1 && (
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '18px' }}>
                <button
                  type="button"
                  style={{ flex: 1, padding: '8px 0', border: 0, borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', background: mode === 'login' ? '#ffffff' : 'transparent', color: mode === 'login' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s ease' }}
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                >
                  Patient Login
                </button>
                <button
                  type="button"
                  style={{ flex: 1, padding: '8px 0', border: 0, borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', background: mode === 'signup' ? '#ffffff' : 'transparent', color: mode === 'signup' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s ease' }}
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Notification Alert */}
            {errorMessage && (
              <div style={{ background: '#fdf1f1', border: '1px solid #f7d4d4', color: '#d94a4a', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} color="#d94a4a" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.4 }}>{errorMessage}</div>
              </div>
            )}

            {/* Success Notification Alert */}
            {successMessage && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#166534" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, lineHeight: 1.4 }}>{successMessage}</div>
              </div>
            )}
            {/* STEP 1: LOGIN OR SIGN UP CREDENTIALS ENTRY */}
            {step === 1 ? (
              mode === 'login' ? (
                /* ------------------- PATIENT LOGIN TAB (DIRECT PASSWORD - NO OTP!) ------------------- */
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
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
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
                  </div>

                  {/* Direct Login Button (NO OTP) */}
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
                      gap: '8px'
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

                  {/* Switch to Sign Up Link */}
                  <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-2)' }}>
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                      style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Sign up for Hospivio
                    </button>
                  </div>
                </form>
              ) : (
                /* ------------------- SIGN UP TAB (ONE-TIME EMAIL OTP VERIFICATION) ------------------- */
                <form onSubmit={handleSignUpSubmit}>
                  {/* Field 1: Full Name */}
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

                  {/* Field 2: Mobile Phone Number */}
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
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
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

                  {/* Field 3: Email Address */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Email Address * (for one-time account verification)
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

                  {/* Field 4: Password */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      Password * (min. 6 characters)
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

                  {/* Create Account & Send OTP Button */}
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
                      gap: '8px'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="spin-animation" />
                        <span>Sending One-Time OTP...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Create Account & Send OTP</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Login Link */}
                  <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-2)' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                      style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Login here
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* STEP 2: ONE-TIME ACCOUNT VERIFICATION VIA EMAIL OTP (SIGN UP ONLY) */
              <form onSubmit={handleVerifySignUpOtp}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--ink-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Sign Up Step 2: One-Time Account Verification
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>
                    📧 Sent to: {targetOtpEmail}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#e11d48', marginTop: 4, fontWeight: 600 }}>
                    ⏱️ Verification code expires in 5 minutes.
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                      6-Digit Verification Code *
                    </label>
                    <button
                      type="button"
                      onClick={(e) => handleSignUpSubmit(e)}
                      disabled={isLoading}
                      style={{ background: 'transparent', border: 0, color: 'var(--teal)', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
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

                {/* Verify & Complete Sign Up Button */}
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
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spin-animation" />
                      <span>Verifying & Activating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify & Complete Sign Up</span>
                    </>
                  )}
                </button>

                {/* Go Back Link */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
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

            {/* Feature Highlights Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', background: '#f0f7f9', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                ⚡ Password Direct Login
              </span>
              <span style={{ fontSize: '10.5px', background: '#f0f7f9', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                🔒 One-Time Sign Up OTP
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
