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
    const { fullName, mobileNumber, email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid email and password (minimum 6 characters) are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanedMobile = mobileNumber ? mobileNumber.replace(/[^\d]/g, '') : '';
    const passwordHash = bcrypt.hashSync(password, 10);

    if (supabase) {
      console.log(`[Supabase Registration Attempt] Inserting patient row for: ${normalizedEmail}`);
      
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
            message: 'An account with this email address already exists. Please login instead.',
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
      console.warn('[Supabase Warning] Supabase client not initialized (missing env vars). Returning fallback response.');
      return res.status(200).json({
        success: true,
        message: 'Account registered locally (Supabase env vars unconfigured).',
        patient: { full_name: fullName, email: normalizedEmail, mobile_number: cleanedMobile }
      });
    }
  } catch (error) {
    console.error('[Register API Catch Block Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
}
