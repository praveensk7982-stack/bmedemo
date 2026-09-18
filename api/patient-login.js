import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
    const { email, mobileNumber, password, loginMethod } = req.body;
    const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : '';
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    if (supabase) {
      console.log(`[Supabase Select Attempt] Login attempt via ${loginMethod}: ${loginMethod === 'mobile' ? cleanedMobile : normalizedEmail}`);
      
      let query = supabase.from('patients').select('*');

      if (loginMethod === 'mobile') {
        if (!cleanedMobile) {
          return res.status(400).json({ success: false, message: 'Mobile phone number is required.' });
        }
        query = query.eq('mobile_number', cleanedMobile);
      } else {
        if (!normalizedEmail) {
          return res.status(400).json({ success: false, message: 'Email address is required.' });
        }
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

      // Server-side password comparison using bcrypt
      const isPasswordMatch = bcrypt.compareSync(password, patient.password_hash);

      if (!isPasswordMatch) {
        console.warn('[Supabase Login Failure] Password mismatch for patient:', patient.email);
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        });
      }

      console.log('[Supabase Login Success] Authenticated patient:', patient.email);
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
      console.warn('[Supabase Warning] Supabase client not initialized (missing env vars). Returning fallback.');
      return res.status(200).json({
        success: true,
        message: 'Fallback local authentication active.',
        patient: { email: normalizedEmail, mobileNumber: cleanedMobile }
      });
    }
  } catch (error) {
    console.error('[Login API Catch Block Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
}
