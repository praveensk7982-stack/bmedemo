import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store in memory
    const otpStore = globalThis.otpStore || new Map();
    otpStore.set(normalizedEmail, { otp, expiresAt });
    globalThis.otpStore = otpStore;

    // Optional: store in Supabase otp_store table
if (supabase) {
  const { error: supabaseError } = await supabase
    .from('otp_store')
    .upsert({ email: normalizedEmail, otp, expires_at: expiresAt });
  if (supabaseError) {
    console.warn('[Supabase OTP Store Warning]:', supabaseError.message);
  }
}

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"Hospivio Health" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your Hospivio Verification Code',
      text: `Your Hospivio verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #cdeade; border-radius: 12px; background: #fff;">
          <div style="background: #16a3ae; padding: 15px; text-align: center; color: white; border-radius: 8px;">
            <h2 style="margin:0;">Hospivio Verification Code</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hello,</p>
            <p>Your 6-digit verification code is:</p>
            <div style="background: #f0f7f9; border: 2px dashed #16a3ae; padding: 15px; text-align: center; border-radius: 8px; margin: 15px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0d6e7d;">${otp}</span>
            </div>
            <p style="color: #e11d48; font-size: 13px; font-weight: bold;">⏱️ Note: This verification code will expire in 5 minutes.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP.' });
  }
}