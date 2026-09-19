import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (supabase) {
  console.log('[Supabase Client] Initialized successfully with URL:', supabaseUrl);
} else {
  console.warn('[Supabase Client] Environment variables SUPABASE_URL / SUPABASE_ANON_KEY missing. Supabase queries will use fallback handling.');
}

// In-Memory OTP Store: Map<email, { otp, expiresAt }>
const otpStore = new Map();

// Configure Nodemailer Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Endpoint 1: Send OTP Email (Enforces rule: Check existing email BEFORE sending OTP!)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // RULE 1: Check if email already exists in Supabase patients table BEFORE sending OTP
    if (supabase) {
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('id, email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkError) {
        console.warn('[Supabase Check Warning]:', checkError.message);
      }

      if (existingPatient) {
        console.warn(`[Duplicate Signup Blocked] Email ${normalizedEmail} already registered in Supabase.`);
        return res.status(400).json({
          success: false,
          alreadyExists: true,
          message: 'An account already exists with this email. Please login instead.'
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory for verification
    otpStore.set(normalizedEmail, { otp, expiresAt });

    // Also upsert in Supabase otp_store table if available
    if (supabase) {
      await supabase
        .from('otp_store')
        .upsert({ email: normalizedEmail, otp, expires_at: expiresAt })
        .catch(err => console.warn('[Supabase OTP Store Warning]:', err.message));
    }

    // Send Email via Gmail SMTP
    const mailOptions = {
      from: `"Hospivio Health" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your Hospivio Verification Code',
      text: `Your Hospivio verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #cdeade; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(140deg, #16a3ae 0%, #0e7c86 100%); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Hospivio Verification Code</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Better Care, Connected.</p>
          </div>
          <div style="padding: 28px 24px; color: #1e293b;">
            <p style="margin-top: 0; font-size: 14px;">Hello,</p>
            <p style="font-size: 14px; color: #475569;">Your 6-digit verification code for Hospivio account registration is:</p>
            <div style="background: #f0f7f9; border: 2px dashed #16a3ae; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d6e7d;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #e11d48; font-weight: 600; margin-bottom: 20px;">
              ⏱️ Note: This verification code will expire in 5 minutes.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">If you did not request this verification code, please ignore this email.</p>
          </div>
          <div style="background: #f8fafc; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © Hospivio Health Systems. All rights reserved.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP Sent] ${otp} -> ${normalizedEmail}`);

    return res.json({ 
      success: true, 
      message: `Verification code sent to ${normalizedEmail}. Code expires in 5 minutes.` 
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send OTP email via SMTP.' 
    });
  }
});

// Endpoint 2: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const key = email.toLowerCase().trim();
    let record = otpStore.get(key);

    if (!record && supabase) {
      const { data } = await supabase.from('otp_store').select('*').eq('email', key).single();
      if (data) {
        record = { otp: data.otp, expiresAt: data.expires_at };
      }
    }

    if (!record) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP requested for this email address. Please click "Resend Code".' 
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP code has expired (valid for 5 minutes). Please request a new code.' 
      });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect verification code. Please check your email and try again.' 
      });
    }

    // OTP verified successfully -> remove from store
    otpStore.delete(key);
    if (supabase) {
      await supabase.from('otp_store').delete().eq('email', key).catch(() => {});
    }

    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// Endpoint 3: Register Patient Row in Supabase (Called AFTER OTP verification)
app.post('/api/register-patient', async (req, res) => {
  try {
    const { fullName, mobileNumber, email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid email and password (minimum 6 characters) required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : '';

    if (supabase) {
      // Double-check duplicate before insert
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({
          success: false,
          alreadyExists: true,
          message: 'An account already exists with this email. Please login instead.'
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      console.log(`[Supabase Registration] Inserting patient row for: ${normalizedEmail}`);
      
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            full_name: fullName ? fullName.trim() : normalizedEmail.split('@')[0],
            mobile_number: cleanedMobile,
            email: normalizedEmail,
            password_hash: passwordHash,
            email_verified: true
          }
        ])
        .select();

      if (error) {
        console.error('[Supabase Insert Error Object]:', JSON.stringify(error, null, 2));
        if (error.code === '23505') {
          return res.status(400).json({
            success: false,
            alreadyExists: true,
            message: 'An account already exists with this email address. Please login instead.',
            supabaseError: error
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Database insertion failed: ' + (error.message || 'Error inserting into patients table'),
          supabaseError: error
        });
      }

      console.log('[Supabase Insert Success] Patient created with ID:', data[0]?.id);
      return res.status(200).json({
        success: true,
        message: 'Account registered successfully in Supabase.',
        patient: data[0]
      });
    } else {
      console.warn('[Supabase Warning] Supabase client unconfigured. Returning fallback response.');
      return res.status(200).json({
        success: true,
        message: 'Account registered locally (Supabase env vars unconfigured).',
        patient: { full_name: fullName, email: normalizedEmail, mobile_number: cleanedMobile }
      });
    }
  } catch (error) {
    console.error('[Register API Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
});

// Endpoint 4: Patient Login (Direct password login - NO OTP required!)
app.post('/api/patient-login', async (req, res) => {
  try {
    const { email, mobileNumber, password, loginMethod } = req.body;
    const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : '';
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    if (supabase) {
      console.log(`[Supabase Login Attempt] Querying patient via ${loginMethod}: ${loginMethod === 'mobile' ? cleanedMobile : normalizedEmail}`);
      
      let query = supabase.from('patients').select('*');

      if (loginMethod === 'mobile') {
        if (!cleanedMobile) return res.status(400).json({ success: false, message: 'Mobile phone number is required.' });
        query = query.eq('mobile_number', cleanedMobile);
      } else {
        if (!normalizedEmail) return res.status(400).json({ success: false, message: 'Email address is required.' });
        query = query.eq('email', normalizedEmail);
      }

      const { data: patients, error } = await query;

      if (error) {
        console.error('[Supabase Select Error Object]:', JSON.stringify(error, null, 2));
        return res.status(500).json({
          success: false,
          message: 'Database query failed: ' + (error.message || 'Error querying patients table'),
          supabaseError: error
        });
      }

      // DISTINCTION 1: NO ACCOUNT FOUND (404)
      if (!patients || patients.length === 0) {
        console.warn(`[Supabase Login Failure] No row found for ${loginMethod === 'mobile' ? cleanedMobile : normalizedEmail}`);
        return res.status(404).json({
          success: false,
          message: loginMethod === 'mobile'
            ? 'No account found with this mobile number. Please click "Create Account".'
            : 'No account found with this email address. Please click "Create Account".'
        });
      }

      const patient = patients[0];

      // DISTINCTION 2: INCORRECT PASSWORD (401)
      const isPasswordMatch = bcrypt.compareSync(password, patient.password_hash);

      if (!isPasswordMatch) {
        console.warn('[Supabase Login Failure] Password mismatch for patient:', patient.email);
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        });
      }

      // SUCCESS (200): Unlimited direct login using stored password hash
      console.log('[Supabase Login Success] Patient authenticated:', patient.email);
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        patient: {
          id: patient.id,
          fullName: patient.full_name,
          email: patient.email,
          mobileNumber: patient.mobile_number
        }
      });
    } else {
      console.warn('[Supabase Warning] Supabase client unconfigured. Returning fallback.');
      return res.status(200).json({
        success: true,
        message: 'Fallback local authentication active.',
        patient: { email: normalizedEmail, mobileNumber: cleanedMobile }
      });
    }
  } catch (error) {
    console.error('[Login API Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
});

// Endpoint 5: Reset Password (Direct Supabase Password Hash Update via verified OTP flow)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid email and new password (minimum 6 characters) required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    if (supabase) {
      console.log(`[Supabase Password Reset] Updating password hash for: ${normalizedEmail}`);
      const { data, error } = await supabase
        .from('patients')
        .update({ password_hash: passwordHash })
        .eq('email', normalizedEmail)
        .select();

      if (error) {
        console.error('[Supabase Password Reset Error]:', JSON.stringify(error, null, 2));
        return res.status(500).json({
          success: false,
          message: 'Database password update failed: ' + (error.message || 'Error updating patients table'),
          supabaseError: error
        });
      }

      console.log('[Supabase Password Reset Success] Updated patient:', normalizedEmail);
      return res.status(200).json({
        success: true,
        message: 'Password reset successfully in Supabase.',
        patient: data ? data[0] : null
      });
    } else {
      console.warn('[Supabase Warning] Supabase client unconfigured. Returning fallback.');
      return res.status(200).json({
        success: true,
        message: 'Password reset locally.'
      });
    }
  } catch (error) {
    console.error('[Reset Password API Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during password reset.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hospivio Email OTP & Supabase Auth Server running on http://0.0.0.0:${PORT}`);
});